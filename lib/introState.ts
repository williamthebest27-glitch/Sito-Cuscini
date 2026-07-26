/**
 * Remembers whether the opening logo + film sequence has already played in
 * this browsing session, so it only runs on the very first visit — not every
 * time the visitor navigates back to the home page.
 *
 * Uses sessionStorage: the intro replays only when a brand-new session starts
 * (e.g. a fresh tab), never on in-session navigation or reloads.
 */
export const INTRO_KEY = "dt:intro-played";

export function hasIntroPlayed(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(INTRO_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export function markIntroPlayed(): void {
  try {
    window.sessionStorage.setItem(INTRO_KEY, "1");
    // Inject a style (once) so any later client navigation back to the home
    // page hides the overlay instantly — with no hydration-affecting DOM change.
    if (!document.getElementById("dt-intro-skip")) {
      const s = document.createElement("style");
      s.id = "dt-intro-skip";
      s.textContent = ".intro{display:none!important}";
      document.head.appendChild(s);
    }
  } catch {
    /* storage unavailable — intro simply plays again */
  }
}
