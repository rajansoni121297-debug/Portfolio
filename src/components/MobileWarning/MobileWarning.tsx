"use client";

import { useEffect, useState } from "react";

export function MobileWarning() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if viewport is mobile width and hasn't been dismissed in this session
    const checkMobile = () => {
      // Catch mostly all mobile agents including Safari and Chrome mobile
      const isMobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobi|mobi/i.test(navigator.userAgent);
      
      // Secondary check for narrow screens with touch capabilities (e.g. some iPads or unrecognized agents)
      const isNarrowAndTouch = window.innerWidth <= 850 && 
        (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
        
      const isDismissed = sessionStorage.getItem("mobile-warning-dismissed");

      // Triggers if UserAgent matches mobile OR screen size/touch match
      if ((isMobileAgent || isNarrowAndTouch) && !isDismissed) {
        setIsVisible(true);
      }
    };

    // Delay slightly to prevent jarring flashes, but much faster than before
    const timer = setTimeout(checkMobile, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("mobile-warning-dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="mobile-warning-overlay">
      <div className="mobile-warning-modal">
        <div className="mw-glow"></div>
        <span className="mw-emoji">📱</span>
        <h2 className="mw-title">Hold up, tiny screen!</h2>
        <p className="mw-text">
           This portfolio was meticulously engineered for an immersive Desktop experience. 
           You can still look around, but for the optimal &ldquo;Vibe&rdquo; (and to avoid finger cramps), 
           grab your nearest Laptop or PC.
        </p>
        <button className="mw-btn" onClick={handleDismiss}>
          I'm fearless, let me in
        </button>
      </div>
    </div>
  );
}
