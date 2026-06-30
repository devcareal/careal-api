// src/components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force browser window to scroll back to the top left coordinate instantly
    window.scrollTo(0, 0);
  }, [pathname]); // Fires every single time the URL path changes

  return null; // This component handles side-effects only; renders no UI
}