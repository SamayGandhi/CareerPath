/**
 * GithubAnalyzerPage.jsx — BATCH 5 (visual only)
 * Refined header/profile-card treatment. ALL validation, analyze, and
 * addRecentGithubUsername logic unchanged.
 */

import { useState } from 'react';
import { Github } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Button from '../../../components/ui/atoms/Button';
import Badge from '../../../components/ui/atoms/Badge';
import AiEnhancedBadge from '../../../components/ui/atoms/AiEnhancedBadge';
import LanguageDonutChart from './LanguageDonutChart';
import RepoQualityChecklist from './RepoQualityChecklist';
import GithubUsernameInput, { isValidGithubUsername, addRecentGithubUsername } from './GithubUsernameInput';
import { githubAnalyzerApi } from '../githubAnalyzer.api';
import { useToast } from '../../../components/feedback/Toast';

export default function GithubAnalyzerPage() {
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [validationError, setValidationError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setValidationError('Please enter a GitHub username.');
      return;
    }
    if (!isValidGithubUsername(trimmed)) {
      setValidationError(
        'That doesn\u2019t look like a valid GitHub username (letters, numbers, and single hyphens only).'
      );
      return;
    }
    setValidationError(null);
    setAnalyzing(true);
    try {
      const { data } = await githubAnalyzerApi.analyze(trimmed);
      setAnalysis(data.analysis);
      addRecentGithubUsername(trimmed);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-8">
      <div className="animate-fade-in-up flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-subtle">
          <Github className="h-5 w-5 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">GitHub Analyzer</h1>
          <p className="text-text-secondary">
            Analyze a public GitHub profile&apos;s languages and repository quality signals.
          </p>
        </div>
      </div>

      <Card className="flex flex-col gap-3">
        <GithubUsernameInput
          value={username}
          onChange={(val) => {
            setUsername(val);
            if (validationError) setValidationError(null);
          }}
          onSubmit={handleAnalyze}
          disabled={analyzing}
          error={validationError}
        />
        <Button onClick={handleAnalyze} isLoading={analyzing} className="self-start">
          Analyze
        </Button>
      </Card>

      {analysis && (
        <>
          <Card className="animate-fade-in-up flex items-center gap-4">
            {analysis.profileSnapshot?.avatarUrl && (
              <img
                src={analysis.profileSnapshot.avatarUrl}
                alt=""
                className="h-16 w-16 rounded-full ring-2 ring-border-subtle"
              />
            )}
            <div>
              <h2 className="font-semibold text-text-primary">{analysis.githubUsername}</h2>
              <p className="text-sm text-text-tertiary">
                {analysis.profileSnapshot?.publicRepoCount} public repos ·{' '}
                {analysis.profileSnapshot?.followerCount} followers
              </p>
            </div>
          </Card>

          {analysis.aiEnhancementStatus === 'success' && analysis.aiSummary && (
            <Card className="flex flex-col gap-2">
              <AiEnhancedBadge />
              <p className="text-sm leading-relaxed text-text-primary">{analysis.aiSummary}</p>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <h3 className="mb-2 text-sm font-semibold text-text-primary">Language Usage</h3>
              <LanguageDonutChart languageDistribution={analysis.languageDistribution || []} />
            </Card>

            <Card>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Repo Quality Signals</h3>
              <RepoQualityChecklist repoQualitySignals={analysis.repoQualitySignals} />
            </Card>
          </div>

          {analysis.inferredSkills?.length > 0 && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Inferred Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {analysis.inferredSkills.map((s) => (
                  <Badge key={s.skillId?._id || s.skillId} variant="brand">
                    {s.skillName}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}