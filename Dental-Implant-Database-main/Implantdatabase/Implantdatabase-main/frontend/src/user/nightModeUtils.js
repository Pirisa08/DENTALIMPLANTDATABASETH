// Utility for toggling and persisting night mode
export function getInitialNightMode() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('nightMode');
    if (saved !== null) return saved === 'true';
    // Default: always start in light mode
    return false;
  }
  return false;
}

export function setNightMode(val) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nightMode', val ? 'true' : 'false');
  }
}
