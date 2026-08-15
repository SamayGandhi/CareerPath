/**
 * user.model.js
 * -----------------------------------------
 * Core identity/auth Mongoose model. Deliberately kept thin — no
 * domain/profile data lives here (see profiles module, Phase 2) — so
 * auth concerns never mix with business data.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_ROLES, USER_TYPES, ACCOUNT_STATUS, AUTH_PROVIDERS } = require('../../config/constants');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: function () {
        return this.authProvider === AUTH_PROVIDERS.LOCAL;
      },
      select: false,
    },
    authProvider: {
      type: String,
      enum: Object.values(AUTH_PROVIDERS),
      default: AUTH_PROVIDERS.LOCAL,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.STUDENT,
    },
    userType: {
      type: String,
      enum: Object.values(USER_TYPES),
      required: [true, 'User type is required'],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    accountStatus: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.ACTIVE,
    },
    lastLoginAt: {
      type: Date,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    emailVerificationTokenHash: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, accountStatus: 1 });

/**
 * Pre-save hook: hash password only if it was modified (prevents
 * re-hashing an already-hashed password on unrelated updates).
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method: compare a plaintext candidate password against the
 * stored hash. Kept on the model since it's a thin, schema-tied
 * operation — actual auth orchestration logic lives in auth.service.js.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Ensures sensitive fields never leak into JSON responses even if a
 * document is accidentally serialized without explicit field selection.
 */
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.passwordResetTokenHash;
  delete obj.passwordResetExpires;
  delete obj.emailVerificationTokenHash;
  delete obj.emailVerificationExpires;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;