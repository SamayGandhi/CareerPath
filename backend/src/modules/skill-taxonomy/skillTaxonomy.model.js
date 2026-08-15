/**
 * skillTaxonomy.model.js
 * -----------------------------------------
 * The canonical, admin-maintained graph of all skills in the system —
 * the backbone that makes the Skill Gap Engine (Phase 5) "rule-based"
 * rather than guesswork. `prerequisiteSkillIds` is a self-referencing
 * array forming the dependency graph later consumed by the Roadmap
 * Sequencer's topological sort (Phase 8).
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const SKILL_CATEGORIES = [
  'programming',
  'dataScience',
  'design',
  'softSkill',
  'tool',
  'domainKnowledge',
  'marketing',
  'business',
  'other',
];

const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

const skillTaxonomySchema = new Schema(
  {
    skillName: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      unique: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      enum: SKILL_CATEGORIES,
      required: [true, 'Skill category is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    prerequisiteSkillIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'SkillTaxonomy' }],
      default: [],
    },
    relatedCareerPathIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'CareerPath' }],
      default: [],
    },
    difficultyLevel: {
      type: String,
      enum: DIFFICULTY_LEVELS,
      required: [true, 'Difficulty level is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

skillTaxonomySchema.index({ slug: 1 }, { unique: true });
skillTaxonomySchema.index({ category: 1 });
skillTaxonomySchema.index({ relatedCareerPathIds: 1 });
skillTaxonomySchema.index({ skillName: 'text', description: 'text' });

/**
 * Prevents a skill from listing itself as its own prerequisite —
 * a basic sanity guard against an obviously broken graph edge.
 * Full cycle-detection across the whole graph is a heavier operation
 * intentionally deferred to the Roadmap Sequencer (Phase 8), which
 * already performs topological sorting and can surface cycles there.
 */
skillTaxonomySchema.pre('save', function (next) {
  if (this.prerequisiteSkillIds.some((id) => id.equals(this._id))) {
    return next(new Error('A skill cannot be its own prerequisite'));
  }
  next();
});

const SkillTaxonomy = mongoose.model('SkillTaxonomy', skillTaxonomySchema);

module.exports = SkillTaxonomy;