/**
 * SeverityBadge.jsx
 * -----------------------------------------
 * Maps a gap severity value (critical/moderate/minor/none) to the
 * approved Design System's data-viz color mapping (A.1): critical ->
 * Rose/danger, moderate -> Amber/warning, minor -> Sky/info,
 * none/mastered -> Teal/success.
 */

import Badge from '../atoms/Badge';

const SEVERITY_CONFIG = {
  critical: { variant: 'danger', label: 'Critical' },
  moderate: { variant: 'warning', label: 'Moderate' },
  minor: { variant: 'info', label: 'Minor' },
  none: { variant: 'success', label: 'Mastered' },
};

export default function SeverityBadge({ severity }) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.none;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}