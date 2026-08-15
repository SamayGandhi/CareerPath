/**
 * profile.repository.js
 * -----------------------------------------
 * Data-access layer for the Profile model.
 */

const Profile = require('./profile.model');

class ProfileRepository {
  async create(profileData) {
    const profile = new Profile(profileData);
    return profile.save();
  }

  async findByUserId(userId) {
    return Profile.findOne({ userId }).exec();
  }

  async findByUserIdPopulated(userId) {
    return Profile.findOne({ userId })
      .populate('targetCareerPathId', 'title slug')
      .populate('currentSkills.skillId', 'skillName slug category')
      .exec();
  }

  async existsByUserId(userId) {
    const count = await Profile.countDocuments({ userId });
    return count > 0;
  }

  async updateByUserId(userId, updateData) {
    const profile = await Profile.findOne({ userId });
    if (!profile) return null;

    Object.assign(profile, updateData);
    return profile.save(); // triggers pre-save completion % recompute
  }

  async save(profileDocument) {
    return profileDocument.save();
  }
}

module.exports = new ProfileRepository();