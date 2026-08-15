/**
 * featureFlag.repository.js
 * -----------------------------------------
 * Data-access layer for the FeatureFlag model.
 * UPDATED (Batch 2 — safe auto-initialization): getOrCreate() now
 * seeds a flag's initial `enabled` value from environment
 * configuration (aiConfig.STARTUP_DEFAULT_ENABLED for
 * AI_FEATURE_ENABLED) ONLY at first-creation time. Once a flag
 * document exists in the database, the env var is never consulted
 * again — the database remains the sole, live, restart-proof source
 * of truth, exactly as before. This just removes the need to manually
 * create the document via mongosh before the Admin Panel toggle has
 * anything to act on.
 */

const FeatureFlag = require('./featureFlag.model');
const aiConfig = require('../../ai/ai.config');

const KNOWN_FLAGS = {
  AI_FEATURE_ENABLED: {
    description:
      'Global kill switch for the optional AI Enhancement Layer. When false, all AI-assisted fields (aiEnhancedExplanation, aiSummary, aiFeedback, etc.) remain null across every module, and the core rule-based platform operates unaffected.',
    // Seed value used ONLY the very first time this flag document is
    // created (e.g. on a fresh database). Read from AI_FEATURE_ENABLED
    // in backend/.env. Defaults to false if unset — a fresh deployment
    // never silently activates AI. After creation, this value is
    // irrelevant; the database document is authoritative forever after,
    // toggled only via the Admin Panel (or a direct DB edit).
    getSeedValue: () => aiConfig.STARTUP_DEFAULT_ENABLED,
  },
};

class FeatureFlagRepository {
  async findAll() {
    return FeatureFlag.find().sort({ key: 1 }).exec();
  }

  async findByKey(key) {
    return FeatureFlag.findOne({ key }).exec();
  }

  async getOrCreate(key) {
    let flag = await FeatureFlag.findOne({ key }).exec();
    if (!flag) {
      const known = KNOWN_FLAGS[key];
      const seedValue = known ? known.getSeedValue() : false;
      flag = await FeatureFlag.create({
        key,
        enabled: seedValue,
        description: known ? known.description : undefined,
      });
    }
    return flag;
  }

  async setEnabled(key, enabled, modifiedByUserId) {
    return FeatureFlag.findOneAndUpdate(
      { key },
      {
        key,
        enabled,
        lastModifiedBy: modifiedByUserId,
        description: KNOWN_FLAGS[key]?.description,
      },
      { new: true, upsert: true }
    ).exec();
  }

  /**
   * Called once at server startup (see server.js) so every known flag
   * document exists before the Admin Panel or the AI gateway ever
   * needs to read one — no more relying on lazy first-request
   * creation, and no more manual mongosh document creation required.
   */
  async ensureKnownFlagsExist() {
    const results = [];
    for (const key of Object.keys(KNOWN_FLAGS)) {
      const flag = await this.getOrCreate(key);
      results.push({ key: flag.key, enabled: flag.enabled });
    }
    return results;
  }
}

module.exports = new FeatureFlagRepository();