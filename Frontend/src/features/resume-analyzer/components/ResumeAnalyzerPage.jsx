/**
 * ResumeAnalyzerPage.jsx — BATCH 5 (visual only)
 * Refined header icon treatment. ALL upload/analyze/reset flow
 * unchanged.
 */

import { useState } from 'react';
import { FileText } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Button from '../../../components/ui/atoms/Button';
import ResumeUploadZone from './ResumeUploadZone';
import ResumeAnalysisResults from './ResumeAnalysisResults';
import { resumeAnalyzerApi } from '../resumeAnalyzer.api';
import { useToast } from '../../../components/feedback/Toast';

export default function ResumeAnalyzerPage() {
  const { showToast } = useToast();
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    if (!file) {
      showToast('Please select a resume file first.', 'error');
      return;
    }
    setAnalyzing(true);
    try {
      const { data } = await resumeAnalyzerApi.analyze(file);
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
          <FileText className="h-5 w-5 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Resume Analyzer</h1>
          <p className="text-text-secondary">
            Get an ATS score and see exactly which skills your resume demonstrates.
          </p>
        </div>
      </div>

      {!analysis && (
        <Card className="flex flex-col gap-4">
          <ResumeUploadZone onFileSelected={setFile} disabled={analyzing} />
          <Button onClick={handleAnalyze} isLoading={analyzing} disabled={!file} fullWidth>
            {analyzing ? 'Analyzing your resume...' : 'Analyze Resume'}
          </Button>
        </Card>
      )}

      {analysis && (
        <>
          <ResumeAnalysisResults analysis={analysis} />
          <Button
            variant="secondary"
            onClick={() => {
              setAnalysis(null);
              setFile(null);
            }}
          >
            Analyze Another Resume
          </Button>
        </>
      )}
    </div>
  );
}