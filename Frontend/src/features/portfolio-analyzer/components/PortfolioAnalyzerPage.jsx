/**
 * PortfolioAnalyzerPage.jsx — BATCH 5 (visual only)
 * Refined header icon treatment. ALL validation/analyze flow
 * unchanged.
 */

import { useState } from 'react';
import { Globe } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Button from '../../../components/ui/atoms/Button';
import Badge from '../../../components/ui/atoms/Badge';
import AiEnhancedBadge from '../../../components/ui/atoms/AiEnhancedBadge';
import CompletenessScoreGauge from './CompletenessScoreGauge';
import DetectedSectionsChecklist from './DetectedSectionsChecklist';
import PortfolioUrlInput, { isValidPortfolioUrl } from './PortfolioUrlInput';
import { portfolioAnalyzerApi } from '../portfolioAnalyzer.api';
import { useToast } from '../../../components/feedback/Toast';

export default function PortfolioAnalyzerPage() {
  const { showToast } = useToast();
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setValidationError('Please enter a portfolio URL.');
      return;
    }
    if (!isValidPortfolioUrl(trimmed)) {
      setValidationError('Please enter a full, valid URL starting with http:// or https://');
      return;
    }
    setValidationError(null);
    setAnalyzing(true);
    try {
      const { data } = await portfolioAnalyzerApi.analyze(trimmed);
      setAnalysis(data.analysis);
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
          <Globe className="h-5 w-5 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Portfolio Analyzer</h1>
          <p className="text-text-secondary">
            Check your portfolio&apos;s completeness and see what&apos;s detected.
          </p>
        </div>
      </div>

      <Card className="flex flex-col gap-3">
        <PortfolioUrlInput
          value={url}
          onChange={(val) => {
            setUrl(val);
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="flex items-center justify-center">
              <CompletenessScoreGauge score={analysis.completenessScore} />
            </Card>

            <Card>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">Detected Sections</h3>
              <DetectedSectionsChecklist detectedSections={analysis.detectedSections} />
            </Card>
          </div>

          {analysis.aiEnhancementStatus === 'success' && analysis.aiFeedback && (
            <Card className="flex flex-col gap-2">
              <AiEnhancedBadge />
              <p className="text-sm leading-relaxed text-text-primary">{analysis.aiFeedback}</p>
            </Card>
          )}

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">Tech Stack Detected</h3>
              <span className="text-xs text-text-tertiary">{analysis.projectCount} project(s) detected</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analysis.techStackDetected?.length > 0 ? (
                analysis.techStackDetected.map((tech) => (
                  <Badge key={tech} variant="brand">
                    {tech}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-text-tertiary">No recognizable technologies detected.</p>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}