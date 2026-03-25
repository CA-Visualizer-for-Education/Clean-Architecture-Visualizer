import { useState, useRef, useEffect } from 'react';

export const useResizableSidebar = (
  initialWidth = 300,
  min = 200,
  max = 600
) => {
  const [width, setWidth] = useState(initialWidth);
  const isResizing = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;

      const newWidth = Math.min(Math.max(e.clientX, min), max);
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [min, max]);

  return {
    width,
    startResizing: () => (isResizing.current = true),
  };
};