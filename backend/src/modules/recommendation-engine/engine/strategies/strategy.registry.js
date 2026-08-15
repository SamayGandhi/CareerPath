/**
 * strategy.registry.js
 * -----------------------------------------
 * Central lookup mapping each USER_TYPES enum value to its strategy
 * definition. This is the single point of extension when a new user
 * type or strategy is introduced (Open/Closed Principle) — the rule
 * engine itself never branches on userType directly.
 */

const schoolStudentStrategy = require('./schoolStudent.strategy');
const collegeStudentStrategy = require('./collegeStudent.strategy');
const fresherStrategy = require('./fresher.strategy');
const workingProfessionalStrategy = require('./workingProfessional.strategy');
const careerSwitcherStrategy = require('./careerSwitcher.strategy');
const selfLearnerStrategy = require('./selfLearner.strategy');

const STRATEGY_REGISTRY = {
  schoolStudent: schoolStudentStrategy,
  collegeStudent: collegeStudentStrategy,
  fresher: fresherStrategy,
  workingProfessional: workingProfessionalStrategy,
  careerSwitcher: careerSwitcherStrategy,
  selfLearner: selfLearnerStrategy,
};

/**
 * @param {string} userType
 * @returns {{ userType: string, weights: Record<string, number> }}
 */
function getStrategyForUserType(userType) {
  const strategy = STRATEGY_REGISTRY[userType];
  if (!strategy) {
    // Defensive fallback — should never trigger given enum validation
    // upstream, but guarantees the engine never crashes on an unknown type.
    return selfLearnerStrategy;
  }
  return strategy;
}

module.exports = { getStrategyForUserType, STRATEGY_REGISTRY };