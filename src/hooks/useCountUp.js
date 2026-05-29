import { useEffect, useRef, useState } from "react";

export default function useCountUp(target, duration = 1200, decimals = 0) {
  const [value, setValue]   = useState(0);
  const startTime = useRef(null);
  const frameRef  = useRef(null);

  useEffect(() => {
    const numTarget = parseFloat(target) || 0;
    if (numTarget === 0) { setValue(0); return; }

    startTime.current = null;

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed  = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * numTarget).toFixed(decimals)));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, decimals]);

  return value;
}
