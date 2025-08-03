import React, { useState, useRef, isValidElement } from 'react';
import { createPortal } from 'react-dom';

interface WordTooltipProps {
  children: React.ReactNode;
  tooltip: React.ReactNode;
}

export default function WordTooltip({ children, tooltip }: WordTooltipProps) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const hasTooltipContent = () => {
    if (!tooltip) return false;

    if (typeof tooltip === 'string') {
      return tooltip.trim().length > 0;
    }

    if (isValidElement(tooltip)) {
      const element = tooltip as React.ReactElement<{ children?: React.ReactNode }>;
      const tooltipString = React.Children.toArray(element.props.children)
        .join('')
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .trim();
      return tooltipString.length > 0;
    }

    return true;
  };

  function handleMouseEnter(e: React.MouseEvent<HTMLSpanElement>) {
    if (!hasTooltipContent()) return;

    const rect = (e.target as HTMLSpanElement).getBoundingClientRect();
    setCoords({ x: rect.left + rect.width / 2, y: rect.top });
    setShow(true);
  }

  function handleMouseLeave() {
    setShow(false);
  }

  if (!hasTooltipContent()) {
    return <span>{children}</span>;
  }

  return (
    <>
      <span
        ref={ref}
        className="relative group cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>
      {show &&
        createPortal(
          <div
            className="fixed z-50 bg-serika-dark--bg-color text-serika-dark--text-color border border-serika-dark--sub-color rounded-lg p-3 shadow-lg text-xs"
            style={{
              left: coords.x,
              top: coords.y - 12,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
            }}
          >
            {tooltip}
          </div>,
          document.body
        )}
    </>
  );
}
