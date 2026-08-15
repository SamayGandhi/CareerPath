/**
 * ResumeUploadCard.jsx — BATCH 5 (visual only)
 * Refined resume-link row treatment. ALL upload logic unchanged.
 */

import { useRef, useState } from 'react';
import { FileText, UploadCloud } from 'lucide-react';
import Card from '../../../components/ui/molecules/Card';
import Button from '../../../components/ui/atoms/Button';
import { profileApi } from '../profile.api';
import { useToast } from '../../../components/feedback/Toast';

export default function ResumeUploadCard({ profile, onUpdated }) {
  const { showToast } = useToast();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      await profileApi.uploadResume(file);
      onUpdated({ ...profile, resumeUploaded: true });
      showToast('Resume uploaded successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="flex flex-col gap-3">
      <h3 className="font-semibold text-text-primary">Resume</h3>

      {profile.resumeUploaded ? (
        <a
          href={profile.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-md border border-border-subtle px-3 py-2.5 text-sm text-text-primary transition-all duration-150 hover:border-brand/40 hover:bg-brand-subtle/50"
        >
          <FileText className="h-4 w-4 text-brand" /> View current resume
        </a>
      ) : (
        <p className="text-sm text-text-tertiary">No resume uploaded yet.</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} isLoading={uploading}>
        <UploadCloud className="h-4 w-4" /> {profile.resumeUploaded ? 'Replace Resume' : 'Upload Resume'}
      </Button>
    </Card>
  );
}