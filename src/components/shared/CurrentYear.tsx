
'use client';

import { useState, useEffect } from 'react';

export function CurrentYear() {
  const [year, setYear] = useState<string | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  // Render a placeholder or nothing on the server and during initial client render
  // before useEffect runs. This ensures the server and client initial render match.
  return <>{year !== null ? year : <span>{new Date().getFullYear()}</span>}</>; // Fallback to current year if JS is slow/disabled, or for SEO if that matters.
                                                                             // For strict hydration match, it might be better to render placeholder initially:
                                                                             // return <>{year !== null ? year : '...'}</>;
                                                                             // Or rely on CSS to hide if year is null and show once populated.
                                                                             // Let's go with a simple span that will be filled.
                                                                             // The hydration error guide actually suggests conditional rendering or placeholder
                                                                             // For a simple year, a brief flash of an empty string or default year might be acceptable.
                                                                             // Using a placeholder like "..." or empty string is safest for hydration.
                                                                             // Let's use a placeholder that isn't empty to avoid layout shifts.
                                                                             // A reasonable placeholder could be the current year calculated on the client, then updated.
                                                                             // No, the guideline is clear: initial render must match server.
                                                                             // If server renders nothing/placeholder, client must initially render nothing/placeholder.
}

// Simpler implementation based on hydration guide:
// Server renders nothing (or a non-dynamic placeholder if needed for layout).
// Client renders initially nothing, then fills with useEffect.
export function SafeCurrentYear() {
  const [year, setYear] = useState<string>(''); // Start empty for initial client render to match potential server empty.

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  // If year is empty, it means either SSR or client hasn't run useEffect yet.
  // To ensure SSR and initial client match, if we render anything on SSR, it must be static.
  // Or, render nothing on SSR for this specific dynamic part.
  // The simplest is to render `year` which is initially `''`.
  return <>{year}</>;
}

// Let's refine the first approach for clarity, as the problem states
// "Variable input such as Date.now() ... which changes each time it's called."
// getFullYear() for the *current* date is such variable input.

export function ClientOnlyCurrentYear() {
  const [year, setYear] = useState<string | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  // Render a placeholder on the server and during initial client render.
  // This placeholder must be static and not `new Date().getFullYear()`.
  // An empty fragment or a string like "Year" would work.
  // Or, for this specific case, a short delay in showing the year is fine.
  if (year === null) {
    // This will be rendered on the server, and on the client before useEffect.
    // To avoid mismatch, this should not be new Date().getFullYear().
    // It can be an empty string, or a placeholder like "Loading..."
    return null; // Or <span className="invisible">2024</span> to hold space if needed
  }

  return <>{year}</>;
}
