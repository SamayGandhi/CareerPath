/**
 * user.repository.js
 * -----------------------------------------
 * Sole data-access layer for the User model. Services never call
 * User.find() directly — they call these repository methods. This
 * isolates Mongoose-specific query logic and makes the service layer
 * unit-testable with a mocked repository.
 */

const User = require('./user.model');

class UserRepository {
  async create(userData) {
    const user = new User(userData);
    return user.save();
  }

  async findById(id, { includePassword = false } = {}) {
    const query = User.findById(id);
    if (includePassword) query.select('+passwordHash');
    return query.exec();
  }

  async findByEmail(email, { includePassword = false } = {}) {
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) query.select('+passwordHash');
    return query.exec();
  }

  async findByEmailVerificationTokenHash(tokenHash) {
    return User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
    })
      .select('+emailVerificationTokenHash +emailVerificationExpires')
      .exec();
  }

  async findByPasswordResetTokenHash(tokenHash) {
    return User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    })
      .select('+passwordResetTokenHash +passwordResetExpires')
      .exec();
  }

  async existsByEmail(email) {
    const count = await User.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  }

  async updateById(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async save(userDocument) {
    return userDocument.save();
  }

  async findAll({ filter = {}, page = 1, limit = 20, sort = { createdAt: -1 } } = {}) {
    const skip = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      User.countDocuments(filter),
    ]);
    return { items, totalItems };
  }
}

module.exports = new UserRepository();