/**
 * Hook that keeps a ref in sync with the latest value.
 * Useful for accessing current values inside event handlers
 * without adding them to effect dependency arrays.
 */
import { useEffect, useRef, type MutableRefObject } from 'react';

export function useLatestRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
