"use client";

import { motion as Motion, useAnimation } from "motion/react";

const defaultTransition = {
  type: "spring",
  stiffness: 250,
  damping: 25,
};

const LogoIcon = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#ffffff",
  ...props
}) => {
  const controls = useAnimation();

  return (
    <div
      style={{
        cursor: "pointer",
        userSelect: "none",
        padding: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        stroke={stroke}
        strokeWidth={strokeWidth}
        viewBox="0 0 24 24"
        fill="none"
        width={width}
        height={height}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {[
          { d: "m17 18-6-6 6-6", shift: "2px" },
          { d: "M7 6v12", shift: "-2px" },
        ].map((path) => (
          <Motion.path
            key={path.d}
            variants={{
              normal: { translateX: "0%" },
              animate: { translateX: path.shift },
            }}
            transition={defaultTransition}
            animate={controls}
            initial="normal"
            d={path.d}
          />
        ))}
      </svg>
    </div>
  );
};

export default  LogoIcon;
