/**
 * AiEnhancedBadge.jsx
 * -----------------------------------------
 * The consistent visual language meaning "this content was AI-
 * assisted" across the whole product, per approved Design System
 * (A.7): subtle Indigo->Sky gradient border wrapping a small "AI
 * Enhanced" label. Used as a small inline marker next to AI-generated
 * text blocks — never implies the underlying rule-based data is AI-
 * generated, only that this specific piece of prose was.
 */

import { Sparkles } from 'lucide-react';

export default function AiEnhancedBadge() {
  return (
    <div className="ai-enhanced-border inline-block">
      <div className="flex items-center gap-1 rounded-[11px] bg-surface px-2 py-0.5">
        <Sparkles className="h-3 w-3 text-brand" />
        <span className="text-xs font-medium text-text-secondary">AI Enhanced</span>
      </div>
    </div>
  );
}