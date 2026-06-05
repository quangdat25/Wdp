import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const nodeRef = useRef(null);

  useEffect(() => {
    // Cleanup previous animations
    const ctx = gsap.context(() => {
      // Fade in and slide up slightly
      gsap.fromTo(
        nodeRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    });

    return () => ctx.revert();
  }, [location.pathname]); // Re-run animation when route changes

  return (
    <div ref={nodeRef} style={{ width: '100%', minHeight: '100%' }}>
      {children}
    </div>
  );
};

export default PageTransition;
