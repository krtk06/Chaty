import { motion as Motion, useAnimation } from 'motion/react';

const lidVariants = {
  normal: { y: 0 },
  animate: { y: -1.1 },
};

const springTransition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
};

const Delete = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = '#ffffff',
  ...props
}) => {
  const controls = useAnimation();

  return (
    <div
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={() => controls.start('animate')}
      onMouseLeave={() => controls.start('normal')}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <Motion.g
          variants={lidVariants}
          animate={controls}
          transition={springTransition}
        >
          <path d="M3 6h18" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </Motion.g>
        <Motion.path
          d="M19 8v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V8"
          variants={{
            normal: { d: "M19 8v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V8" },
            animate: { d: "M19 9v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V9" },
          }}
          animate={controls}
          transition={springTransition}
        />
        {[10, 14].map((x) => (
          <Motion.line
            key={x}
            x1={x}
            x2={x}
            y1="11"
            y2="17"
            variants={{
              normal: { y1: 11, y2: 17 },
              animate: { y1: 11.5, y2: 17.5 },
            }}
            animate={controls}
            transition={springTransition}
          />
        ))}
      </svg>
    </div>
  );
};

export default Delete;
