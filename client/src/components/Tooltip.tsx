import React, { useRef, useEffect, useState } from "react";

interface ControlLabelProps {
  label: string;
  children: React.ReactNode;
}

const Tooltip = ({ label, children }: ControlLabelProps) => {
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState({
    left: "50%",
    transform: "translateX(-50%)",
  });

  useEffect(() => {
    if (tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;

      // Adjust position if tooltip is near the edges
      if (tooltipRect.left < 0) {
        setPosition({ left: "0", transform: "translateX(0)" });
      } else if (tooltipRect.right > screenWidth) {
        setPosition({ left: "100%", transform: "translateX(-100%)" });
      }
    }
  }, [label]);

  return (
    <div className="group relative flex items-center">
      {children}
      <span
        ref={tooltipRef}
        className="absolute bottom-full mb-2 text-charcoal-9 text-sm rounded-lg shadow-lg 
          opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out text-center 
          whitespace-nowrap min-w-[100px] max-w-[200px] bg-white p-2"
        style={position}
      >
        {label}
      </span>
    </div>
  );
};

export default Tooltip;
