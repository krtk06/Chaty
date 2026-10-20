import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Adapted from "AI Streaming Text" by Cameron Kelliher (elements-)
 * via 21st.dev — typewriter/streaming reveal for assistant replies.
 */
export function StreamingText({
  text,
  speed = 12,
  mode = "word",
  showCursor = true,
  onComplete,
  className,
}) {
  const [progress, setProgress] = React.useState(0);
  const [trackedText, setTrackedText] = React.useState(text);

  // Reset when the text changes (render-time state adjustment).
  if (trackedText !== text) {
    setTrackedText(text);
    setProgress(0);
  }

  const tokens = React.useMemo(
    () => (text ? (mode === "word" ? text.split(/(\s+)/) : text.split("")) : []),
    [text, mode]
  );
  const displayedText = tokens.slice(0, progress).join("");
  const isComplete = tokens.length === 0 || progress >= tokens.length;

  const onCompleteRef = React.useRef(onComplete);
  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  React.useEffect(() => {
    if (tokens.length === 0) return;

    let currentIndex = 0;
    let lastTime = 0;
    let cancelled = false;
    let completed = false;

    const animate = (time) => {
      if (cancelled) return;
      if (time - lastTime >= speed) {
        lastTime = time;
        if (currentIndex < tokens.length) {
          currentIndex++;
          setProgress(currentIndex);
        } else {
          if (!completed) {
            completed = true;
            onCompleteRef.current?.();
          }
          return;
        }
      }
      requestAnimationFrame(animate);
    };

    const frameId = requestAnimationFrame(animate);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [tokens, speed]);

  return (
    <span data-slot="streaming-text" className={cn("relative", className)}>
      <span className="whitespace-pre-wrap">{displayedText}</span>
      {showCursor && !isComplete && (
        <span className="ml-0.5 inline-block h-[1.1em] w-[2px] animate-pulse bg-[#fc7819] align-middle" />
      )}
    </span>
  );
}

export default StreamingText;
