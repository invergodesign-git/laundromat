"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type IntroContextValue = {
  /** True after splash finishes (or is skipped). ScrollTriggers should wait on this. */
  ready: boolean;
  markReady: () => void;
};

const IntroContext = createContext<IntroContextValue | null>(null);

export function IntroProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  const value = useMemo(() => ({ ready, markReady }), [ready, markReady]);
  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>;
}

export function useIntro() {
  const ctx = useContext(IntroContext);
  if (!ctx) {
    return { ready: true, markReady: () => undefined };
  }
  return ctx;
}
