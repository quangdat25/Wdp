import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

const PageTransition = ({ children }) => {
  const location = useLocation();
  const nodeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        nodeRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power3.out" }
      );
    });

    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <div ref={nodeRef} style={{ width: "100%", minHeight: "100%" }}>
      {children}
    </div>
  );
};

export default PageTransition;