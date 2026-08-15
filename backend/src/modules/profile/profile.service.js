/**
 * profile.service.js
 * -----------------------------------------
 * Business logic for the Profile module.
 * UPDATED (Phase 5): increments skillsVersion whenever currentSkills
 * changes, so the Skill Gap Engine can stamp reports with the exact
 * profile state they were generated against.
 */

const path = require('path');
const ApiError = require('../../shared/errors/ApiError');
const profileRepository = require('./profile.repository');
const careerPathService = require('../career-path/careerPath.service');

class ProfileService {
  async getMyProfile(userId) {
    const profile = await profileRepository.findByUserIdPopulated(userId);
    if (!profile) {
      throw ApiError.notFound(
        'Profile not found. Please complete onboarding first.',
        'PROFILE_NOT_FOUND'
      );
    }
    return profile;
  }

  async createProfile(userId, profileData) {
    const exists = await profileRepository.existsByUserId(userId);
    if (exists) {
      throw ApiError.conflict('A profile already exists for this user', 'PROFILE_ALREADY_EXISTS');
    }

    return profileRepository.create({ userId, ...profileData });
  }

  async updateMyProfile(userId, updateData) {
    const profile = await profileRepository.updateByUserId(userId, updateData);
    if (!profile) {
      throw ApiError.notFound('Profile not found', 'PROFILE_NOT_FOUND');
    }
    return profile;
  }

  async updateTargetCareerPath(userId, careerPathId) {
    await careerPathService.assertExistsAndActive(careerPathId);

    const profile = await profileRepository.updateByUserId(userId, {
      targetCareerPathId: careerPathId,
    });
    if (!profile) {
      throw ApiError.notFound('Profile not found', 'PROFILE_NOT_FOUND');
    }
    return profile;
  }

  async updateSkillProficiency(userId, { skillId, proficiency }) {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      throw ApiError.notFound('Profile not found', 'PROFILE_NOT_FOUND');
    }

    const existingSkillIndex = profile.currentSkills.findIndex(
      (s) => s.skillId.toString() === skillId
    );

    if (existingSkillIndex >= 0) {
      profile.currentSkills[existingSkillIndex].proficiency = proficiency;
    } else {
      profile.currentSkills.push({ skillId, proficiency, verified: false });
    }

    profile.skillsVersion += 1;
    await profileRepository.save(profile);
    return profile;
  }

  async mergeAssessedSkills(userId, derivedSkills, assessmentId) {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      throw ApiError.notFound(
        'Profile not found. Please complete your profile before taking an assessment.',
        'PROFILE_NOT_FOUND'
      );
    }

    for (const derived of derivedSkills) {
      const skillIdStr = derived.skillId.toString();
      const existingIndex = profile.currentSkills.findIndex(
        (s) => s.skillId.toString() === skillIdStr
      );

      if (existingIndex >= 0) {
        profile.currentSkills[existingIndex].proficiency = derived.proficiency;
        profile.currentSkills[existingIndex].verified = true;
      } else {
        profile.currentSkills.push({
          skillId: derived.skillId,
          proficiency: derived.proficiency,
          verified: true,
        });
      }
    }

    profile.lastAssessmentId = assessmentId;
    profile.skillsVersion += 1;
    await profileRepository.save(profile);
    return profile;
  }

  async uploadResume(userId, file) {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      throw ApiError.notFound('Profile not found', 'PROFILE_NOT_FOUND');
    }

    const relativePath = path.join('uploads', 'resumes', file.filename).replace(/\\/g, '/');
    const baseUrl = process.env.SERVER_BASE_URL || '';
    profile.resumeUrl = `${baseUrl}/${relativePath}`;
    profile.resumeUploaded = true;
    await profileRepository.save(profile);

    return { resumeUrl: profile.resumeUrl };
  }

  async adminGetProfileByUserId(userId) {
    const profile = await profileRepository.findByUserIdPopulated(userId);
    if (!profile) {
      throw ApiError.notFound('Profile not found for this user', 'PROFILE_NOT_FOUND');
    }
    return profile;
  }
}

module.exports = new ProfileService();