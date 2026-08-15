/**
 * GithubUsernameInput.jsx — BATCH 5 (visual only)
 * Refined suggestion-dropdown styling. ALL validation regex, recent/
 * popular suggestion logic (from the earlier UX-polish batch), and
 * keyboard navigation are byte-identical.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, Github, Sparkles } from 'lucide-react';
import Input from '../../../components/ui/atoms/Input';
import { classNames } from '../../../utils';

const POPULAR_USERNAMES = ['torvalds', 'gaearon', 'sindresorhus', 'addyosmani', 'yyx990803', 'tj'];
const RECENT_STORAGE_KEY = 'recentGithubUsernames';
const MAX_RECENT = 5;
const MAX_SUGGESTIONS = 6;

const GITHUB_USERNAME_PATTERN = /^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38}$/;

export function isValidGithubUsername(value) {
  return Boolean(value && GITHUB_USERNAME_PATTERN.test(value.trim()));
}

export function getRecentGithubUsernames() {
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentGithubUsername(username) {
  try {
    const existing = getRecentGithubUsernames().filter((u) => u.toLowerCase() !== username.toLowerCase());
    const updated = [username, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // non-fatal
  }
}

export default function GithubUsernameInput({ value, onChange, onSubmit, disabled, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const recent = useMemo(() => getRecentGithubUsernames(), [isOpen]);

  const suggestions = useMemo(() => {
    const query = (value || '').trim().toLowerCase();
    const combined = [
      ...recent.map((u) => ({ username: u, isRecent: true })),
      ...POPULAR_USERNAMES.filter((u) => !recent.some((r) => r.toLowerCase() === u.toLowerCase())).map((u) => ({
        username: u,
        isRecent: false,
      })),
    ];
    const filtered = query ? combined.filter((s) => s.username.toLowerCase().startsWith(query)) : combined;
    return filtered.slice(0, MAX_SUGGESTIONS);
  }, [value, recent]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [value, isOpen]);

  const selectSuggestion = (username) => {
    onChange(username);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (isOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((i) => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
        return;
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }
      if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[highlightedIndex].username);
        return;
      }
    }
    if (e.key === 'Enter') {
      setIsOpen(false);
      onSubmit();
    }
  };

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary">GitHub Username</label>

      <div className="relative">
        <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. gaearon, torvalds"
          disabled={disabled}
          error={!!error}
          className="pl-9"
          autoComplete="off"
        />

        {isOpen && suggestions.length > 0 && (
          <div className="animate-fade-in-up absolute z-20 mt-1.5 w-full overflow-hidden rounded-md border border-border-subtle bg-surface shadow-md">
            {suggestions.map((s, index) => (
              <button
                key={s.username}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(s.username)}
                className={classNames(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors duration-150',
                  index === highlightedIndex
                    ? 'bg-brand-subtle text-brand'
                    : 'text-text-secondary hover:bg-surface-secondary'
                )}
              >
                {s.isRecent ? (
                  <Clock className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
                )}
                {s.username}
                {s.isRecent && <span className="ml-auto text-xs text-text-tertiary">Recent</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-text-tertiary">
        Enter a public GitHub username only — not a profile URL or email address.
      </p>

      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}