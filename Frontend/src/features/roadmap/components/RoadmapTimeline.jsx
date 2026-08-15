/**
 * RoadmapTimeline.jsx
 * -----------------------------------------
 * Vertical connected timeline of stage nodes.
 * BATCH 4 UPDATE (visual only): refined connector-line/node treatment
 * with a gradient node for the active stage, staggered entrance.
 * Props/mapping logic unchanged.
 */

import RoadmapStageCard from './RoadmapStageCard';
import { classNames } from '../../../utils';

export default function RoadmapTimeline({ stages, currentStageIndex, onStatusChange, updatingStageId }) {
  return (
    <div className="relative flex flex-col gap-6">
      {stages.map((stage, index) => (
        <div
          key={stage.stageId}
          className="animate-fade-in-up relative pl-8"
          style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
        >
          {index < stages.length - 1 && (
            <div className="absolute left-[9px] top-6 h-full w-0.5 bg-border-subtle" />
          )}
          <div
            className={classNames(
              'absolute left-0 top-1.5 h-5 w-5 rounded-full border-2 transition-colors duration-200',
              stage.status === 'completed'
                ? 'border-success bg-success'
                : index === currentStageIndex
                  ? 'border-brand bg-gradient-to-br from-brand to-accent'
                  : 'border-border-strong bg-surface'
            )}
          />
          <RoadmapStageCard
            stage={stage}
            isActive={index === currentStageIndex}
            onStatusChange={onStatusChange}
            updating={updatingStageId === stage.stageId}
          />
        </div>
      ))}
    </div>
  );
}