import { useEffect } from "react";

// ─── usePageTitle ──────────────────────────────────────────────────────────────
// Updates the browser tab title for each page
const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} · SplitEase` : "SplitEase";
  }, [title]);
};

export default usePageTitle;
