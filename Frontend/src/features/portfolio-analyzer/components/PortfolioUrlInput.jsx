/**
 * PortfolioUrlInput.jsx — BATCH 5 (visual only)
 * Refined example-URL chips. ALL URL validation logic unchanged.
 */

import Input from '../../../components/ui/atoms/Input';
import { Globe } from 'lucide-react';

const EXAMPLE_URLS = [
  'https://yourname.vercel.app',
  'https://yourname.netlify.app',
  'https://yourname.github.io',
];

export function isValidPortfolioUrl(value) {
  if (!value || !value.trim()) return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function PortfolioUrlInput({ value, onChange, onSubmit, disabled, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary">Portfolio URL</label>

      <div className="relative">
        <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          placeholder="https://yourportfolio.vercel.app"
          disabled={disabled}
          error={!!error}
          className="pl-9"
          autoComplete="off"
        />
      </div>

      <p className="text-xs text-text-tertiary">
        Enter the full, public URL of your portfolio website, including{' '}
        <span className="font-medium text-text-secondary">https://</span>
      </p>

      {error && <span className="text-xs text-danger">{error}</span>}

      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-xs text-text-tertiary">Examples:</span>
        {EXAMPLE_URLS.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => onChange(url)}
            className="rounded-full border border-border-subtle px-2.5 py-0.5 text-xs text-text-secondary transition-all duration-150 hover:border-brand hover:bg-brand-subtle hover:text-brand"
          >
            {url}
          </button>
        ))}
      </div>
    </div>
  );
}