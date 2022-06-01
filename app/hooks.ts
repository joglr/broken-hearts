import type { RefObject} from "react";
import { useEffect, useState } from "react";

export function useDimensions(ref: RefObject<any>) {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const measure = () => {
      if (ref.current) {
        setDimensions(ref.current.getBoundingClientRect());
      }
    };

    measure();
    window.addEventListener('resize', measure);

    return () => {
      window.removeEventListener('resize', measure);
    };
  }, [ref]);

  return dimensions;
}
