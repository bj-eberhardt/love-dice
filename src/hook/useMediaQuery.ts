import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query: string, serverFallback = false): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const mediaQueryList = window.matchMedia(query);

      mediaQueryList.addEventListener("change", onStoreChange);

      return () => {
        mediaQueryList.removeEventListener("change", onStoreChange);
      };
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") {
      return serverFallback;
    }

    return window.matchMedia(query).matches;
  }, [query, serverFallback]);

  const getServerSnapshot = useCallback(() => serverFallback, [serverFallback]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
