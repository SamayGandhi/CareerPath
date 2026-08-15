/**
 * RecommendationCard.jsx
 * -----------------------------------------
 * Per approved UX spec: score badge, course details, expandable
 * "Why this?" transparency panel.
 * BATCH 4 UPDATE (visual only): refined expand/collapse transition and
 * meta-row icon treatment. ALL data (reasons[], ruleBreakdown[]) and
 * expand-state logic unchanged.
 */

import { useState } from 'react';
import { ChevronDown, ExternalLink, Clock, Star } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Badge from '../../../components/ui/atoms/Badge';
import Button from '../../../components/ui/atoms/Button';
import ScoreBadge from './ScoreBadge';
import { classNames, formatCurrency } from '../../../utils';

const RULE_LABELS = {
  skillGapCoverage: 'Skill Gap Coverage',
  budgetFit: 'Budget Fit',
  platformReputation: 'Platform Reputation',
  courseRelevance: 'Course Relevance',
  timeCommitment: 'Time Commitment',
  careerGoalAlignment: 'Career Goal Alignment',
};

export default function RecommendationCard({ recommendedCourse }) {
  const [expanded, setExpanded] = useState(false);
  const course = recommendedCourse.courseId;

  if (!course) return null;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex gap-4">
        <ScoreBadge score={recommendedCourse.score} />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-text-primary">{course.title}</h3>
              {course.platformId?.name && (
                <p className="text-xs text-text-tertiary">{course.platformId.name}</p>
              )}
            </div>
            <Badge variant="neutral">{course.level}</Badge>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
            {course.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-warning text-warning" /> {course.rating.toFixed(1)}
              </span>
            )}
            {course.durationHours && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {course.durationHours}h
              </span>
            )}
            <span className="font-medium text-text-primary">
              {formatCurrency(course.price?.amount, course.price?.currency)}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-1 self-start text-sm font-medium text-brand transition-colors duration-150 hover:text-brand-hover"
      >
        Why this?{' '}
        <ChevronDown
          className={classNames('h-4 w-4 transition-transform duration-200', expanded && 'rotate-180')}
        />
      </button>

      {expanded && (
        <div className="animate-fade-in-up flex flex-col gap-3 rounded-md border border-brand/20 bg-brand-subtle p-4">
          {recommendedCourse.reasons?.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {recommendedCourse.reasons.map((reason, i) => (
                <li key={i} className="flex gap-2 text-sm text-text-primary">
                  <span className="text-brand">•</span> {reason}
                </li>
              ))}
            </ul>
          )}

          {recommendedCourse.ruleBreakdown?.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                Score Breakdown
              </p>
              <div className="flex flex-col gap-1.5">
                {recommendedCourse.ruleBreakdown.map((rule) => (
                  <div key={rule.ruleName} className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">
                      {RULE_LABELS[rule.ruleName] || rule.ruleName}
                    </span>
                    <span className="font-medium text-text-primary">+{rule.contribution}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <a href={course.externalUrl} target="_blank" rel="noopener noreferrer">
        <Button variant="secondary" size="sm" fullWidth>
          View Course <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </a>
    </Card>
  );
}