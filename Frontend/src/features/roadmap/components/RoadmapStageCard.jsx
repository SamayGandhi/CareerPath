/**
 * RoadmapStageCard.jsx
 * -----------------------------------------
 * Single stage node per approved UX spec.
 * BATCH 4 UPDATE (visual only): refined status-icon treatment (soft
 * colored circle per state), smoother locked-state dimming, refined
 * linked-course link hover. ALL status logic, lock/unlock enforcement
 * (Batch 4 backend fix), and onStatusChange calls are byte-identical.
 */

import { useState } from 'react';
import { Lock, CheckCircle2, Circle, PlayCircle, ChevronDown, ExternalLink } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Badge from '../../../components/ui/atoms/Badge';
import Button from '../../../components/ui/atoms/Button';
import { classNames } from '../../../utils';

const STATUS_CONFIG = {
  locked: { icon: Lock, color: 'text-text-tertiary', bg: 'bg-surface-secondary', badge: 'neutral', label: 'Locked' },
  unlocked: { icon: Circle, color: 'text-brand', bg: 'bg-brand-subtle', badge: 'brand', label: 'Ready to Start' },
  inProgress: { icon: PlayCircle, color: 'text-info', bg: 'bg-info/10', badge: 'info', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', badge: 'success', label: 'Completed' },
};

export default function RoadmapStageCard({ stage, isActive, onStatusChange, updating }) {
  const [expanded, setExpanded] = useState(isActive);
  const config = STATUS_CONFIG[stage.status];
  const Icon = config.icon;
  const isLocked = stage.status === 'locked';

  return (
    <Card
      className={classNames(
        'flex flex-col gap-3 transition-all duration-200',
        isActive && 'border-brand/50 shadow-md',
        isLocked && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={classNames('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full', config.bg)}>
            <Icon className={classNames('h-4.5 w-4.5', config.color)} />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">{stage.title}</h3>
            <p className="text-xs text-text-tertiary">
              Est. {stage.estimatedDurationWeeks} week{stage.estimatedDurationWeeks !== 1 ? 's' : ''}
              {stage.linkedSkillIds?.length > 0 && ` · ${stage.linkedSkillIds.length} skills`}
            </p>
          </div>
        </div>
        <Badge variant={config.badge}>{config.label}</Badge>
      </div>

      {stage.linkedSkillIds?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {stage.linkedSkillIds.map((skill) => (
            <Badge key={skill._id} variant="neutral">
              {skill.skillName}
            </Badge>
          ))}
        </div>
      )}

      {stage.linkedCourseIds?.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1 text-sm font-medium text-brand transition-colors duration-150 hover:text-brand-hover"
          >
            {stage.linkedCourseIds.length} linked course{stage.linkedCourseIds.length > 1 ? 's' : ''}
            <ChevronDown
              className={classNames('h-4 w-4 transition-transform duration-200', expanded && 'rotate-180')}
            />
          </button>
          {expanded && (
            <div className="animate-fade-in-up mt-2 flex flex-col gap-2">
              {stage.linkedCourseIds.map((course) => (
                <a
                  key={course._id}
                  href={course.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2 text-sm transition-all duration-150 hover:border-brand/40 hover:bg-brand-subtle/50"
                >
                  <span className="text-text-primary">{course.title}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-text-tertiary" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {!isLocked && stage.status !== 'completed' && (
        <div className="flex gap-2">
          {stage.status === 'unlocked' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onStatusChange(stage.stageId, 'inProgress')}
              isLoading={updating}
            >
              Start Stage
            </Button>
          )}
          <Button size="sm" onClick={() => onStatusChange(stage.stageId, 'completed')} isLoading={updating}>
            Mark Complete
          </Button>
        </div>
      )}
    </Card>
  );
}