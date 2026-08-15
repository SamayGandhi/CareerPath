/**
 * ResumeUploadZone.jsx — BATCH 5 (visual only)
 * Refined drag-active state and icon treatment. ALL MIME validation
 * and file-select behavior unchanged.
 */

import { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileText } from 'lucide-react';
import { classNames } from '../../../utils';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export default function ResumeUploadZone({ onFileSelected, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      if (!ALLOWED_TYPES.includes(file.type)) return;
      setSelectedFile(file);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={classNames(
        'flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-10 text-center transition-all duration-200',
        isDragging ? 'border-brand bg-brand-subtle scale-[1.01]' : 'border-border-strong hover:border-brand/50',
        disabled && 'pointer-events-none opacity-60'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {selectedFile ? (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-subtle">
            <FileText className="h-7 w-7 text-brand" />
          </div>
          <p className="font-medium text-text-primary">{selectedFile.name}</p>
          <p className="text-xs text-text-tertiary">Click to choose a different file</p>
        </>
      ) : (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-secondary">
            <UploadCloud className="h-7 w-7 text-text-tertiary" />
          </div>
          <p className="font-medium text-text-primary">Drag & drop your resume here</p>
          <p className="text-xs text-text-tertiary">PDF, DOC, or DOCX — max 5MB</p>
        </>
      )}
    </div>
  );
}