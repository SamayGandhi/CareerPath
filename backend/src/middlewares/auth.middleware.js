/**
 * auth.middleware.js
 * -----------------------------------------
 * `authenticate`: verifies the Bearer access token on protected routes
 * and attaches a minimal `req.user` payload.
 * `authorize`: role-based access control guard, used after `authenticate`.
 */

const ApiError = require('../shared/errors/ApiError');
const jwtUtil = require('../modules/auth/jwt.util');
const userRepository = require('../modules/user/user.repository');
const { ACCOUNT_STATUS } = require('../config/constants');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token missing', 'TOKEN_MISSING');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwtUtil.verifyAccessToken(token); // throws on invalid/expired

    // Defense-in-depth: confirm the user still exists and is active,
    // rather than trusting stale JWT claims for the full token lifetime.
    const user = await userRepository.findById(decoded.sub);

    if (!user) {
      throw ApiError.unauthorized('User no longer exists', 'USER_NOT_FOUND');
    }

    if (user.accountStatus !== ACCOUNT_STATUS.ACTIVE) {
      throw ApiError.forbidden('Account is not active', 'ACCOUNT_NOT_ACTIVE');
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      userType: user.userType,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * @param {...string} allowedRoles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required', 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden('You do not have permission to perform this action', 'FORBIDDEN')
      );
    }

    next();
  };
};

module.exports = { authenticate, authorize };