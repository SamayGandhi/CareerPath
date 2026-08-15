/**
 * QuestionCard.jsx
 * -----------------------------------------
 * Renders one question, dispatching to the correct answer-type
 * component.
 * BATCH 4 UPDATE (visual only): entrance animation on question change
 * (keyed by question._id so it re-triggers per question), refined
 * badge/heading spacing. Dispatch logic and props unchanged.
 */

import Card from '../../../components/ui/molecules/Card';
import Badge from '../../../components/ui/atoms/Badge';
import ProficiencySelectAnswer from './ProficiencySelectAnswer';
import ProficiencySliderAnswer from './ProficiencySliderAnswer';
import YesNoAnswer from './YesNoAnswer';

export default function QuestionCard({ question, value, onChange }) {
  return (
    <Card key={question._id} className="animate-fade-in-up flex flex-col gap-5">
      {question.skillId?.skillName && <Badge variant="brand">{question.skillId.skillName}</Badge>}
      <h2 className="text-lg font-semibold leading-snug text-text-primary">{question.questionText}</h2>

      {question.questionType === 'proficiencySelect' && (
        <ProficiencySelectAnswer options={question.options || []} value={value} onChange={onChange} />
      )}
      {question.questionType === 'proficiencySlider' && (
        <ProficiencySliderAnswer value={value} onChange={onChange} />
      )}
      {question.questionType === 'yesNo' && <YesNoAnswer value={value} onChange={onChange} />}
    </Card>
  );
}