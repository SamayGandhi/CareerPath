/**
 * ResumeAnalysisResults.jsx — BATCH 5 (visual only)
 * Refined breakdown-row and skill-badge presentation. ALL AI-panel
 * conditional rendering (aiEnhancementStatus) unchanged.
 */

import Card from '../../../components/ui/molecules/Card';
import Badge from '../../../components/ui/atoms/Badge';
import AiEnhancedBadge from '../../../components/ui/atoms/AiEnhancedBadge';
import AtsScoreGauge from './AtsScoreGauge';

export default function ResumeAnalysisResults({ analysis }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex items-center justify-center">
          <AtsScoreGauge score={analysis.atsScore} />
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-text-primary">ATS Score Breakdown</h3>
          <div className="flex flex-col gap-2">
            {analysis.atsBreakdown?.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{item.label}</span>
                <span className="font-medium text-text-primary">
                  {item.points}/{item.maxPoints}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {analysis.aiEnhancementStatus === 'success' && analysis.aiSuggestions && (
        <Card className="flex flex-col gap-2">
          <AiEnhancedBadge />
          <div className="whitespace-pre-line text-sm leading-relaxed text-text-primary">
            {analysis.aiSuggestions}
          </div>
        </Card>
      )}

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-text-primary">
          Extracted Skills ({analysis.extractedSkills?.length || 0})
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {analysis.extractedSkills?.map((skill) => (
            <Badge key={skill.skillId?._id || skill.skillId} variant="brand">
              {skill.skillName} × {skill.matchCount}
            </Badge>
          ))}
          {(!analysis.extractedSkills || analysis.extractedSkills.length === 0) && (
            <p className="text-sm text-text-tertiary">No recognizable skills detected.</p>
          )}
        </div>
      </Card>

      {analysis.missingSkillsForTarget?.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Missing Skills for Target Role</h3>
          <div className="flex flex-wrap gap-1.5">
            {analysis.missingSkillsForTarget.map((skill) => (
              <Badge key={skill._id} variant="warning">
                {skill.skillName}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}