import { useCallback, useLayoutEffect, useRef, useState } from "react";

function getScrollHints(element: HTMLDivElement) {
  const hasOverflow = element.scrollWidth > element.clientWidth + 1;
  return {
    left: hasOverflow && element.scrollLeft > 1,
    right: hasOverflow && element.scrollLeft + element.clientWidth < element.scrollWidth - 1
  };
}

export function useModeScrollHints(observedItemsCount: number) {
  const modeScrollRef = useRef<HTMLDivElement>(null);
  const [scrollHints, setScrollHints] = useState({ left: false, right: false });
  const scrollMeasureFrameRef = useRef<number | null>(null);
  const scrollMeasureTimeoutRefs = useRef<number[]>([]);

  const updateScrollHints = useCallback(() => {
    const element = modeScrollRef.current;
    if (!element) {
      const timeoutId = window.setTimeout(() => {
        const delayedElement = modeScrollRef.current;
        if (delayedElement) {
          setScrollHints(getScrollHints(delayedElement));
        }
      }, 100);
      scrollMeasureTimeoutRefs.current.push(timeoutId);
      return;
    }

    setScrollHints(getScrollHints(element));
  }, []);

  const clearScheduledScrollHintUpdates = useCallback(() => {
    if (scrollMeasureFrameRef.current) {
      window.cancelAnimationFrame(scrollMeasureFrameRef.current);
      scrollMeasureFrameRef.current = null;
    }
    scrollMeasureTimeoutRefs.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    scrollMeasureTimeoutRefs.current = [];
  }, []);

  const scheduleScrollHintUpdate = useCallback(() => {
    clearScheduledScrollHintUpdates();
    scrollMeasureFrameRef.current = window.requestAnimationFrame(() => {
      scrollMeasureFrameRef.current = null;
      updateScrollHints();
    });
    scrollMeasureTimeoutRefs.current = [80, 240].map((delay) =>
      window.setTimeout(updateScrollHints, delay)
    );
  }, [clearScheduledScrollHintUpdates, updateScrollHints]);

  const scrollModes = useCallback(
    (direction: -1 | 1) => {
      const element = modeScrollRef.current;
      if (!element) return;
      element.scrollBy({ left: direction * 220, behavior: "smooth" });
      window.setTimeout(updateScrollHints, 280);
    },
    [updateScrollHints]
  );

  useLayoutEffect(() => {
    updateScrollHints();
    scheduleScrollHintUpdate();
    const element = modeScrollRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(scheduleScrollHintUpdate);
    resizeObserver.observe(element);
    Array.from(element.children).forEach((child) => resizeObserver.observe(child));
    window.addEventListener("resize", scheduleScrollHintUpdate);

    return () => {
      clearScheduledScrollHintUpdates();
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleScrollHintUpdate);
    };
  }, [
    clearScheduledScrollHintUpdates,
    observedItemsCount,
    scheduleScrollHintUpdate,
    updateScrollHints
  ]);

  return {
    modeScrollRef,
    scrollHints,
    updateScrollHints,
    scheduleScrollHintUpdate,
    scrollModes
  };
}
