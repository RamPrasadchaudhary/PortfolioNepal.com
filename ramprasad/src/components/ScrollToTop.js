import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // Extracts the current pathname from the URL
  const { pathname } = useLocation();

  useEffect(() => {
    // Smoothly scroll to the top-left of the window
    window.scrollTo(0, 0);
  }, [pathname]); // This effect runs every time the pathname changes

  return null;
};

export default ScrollToTop;