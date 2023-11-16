import Store from "./store";
import { useCallback, useEffect, useState } from "react";

export const createStoreBus = <T extends Record<string, unknown>>(toPersist?: {
  local?: [keyof T];
  session?: [keyof T];
}) => {
  const store = Store.getInstance();

  const useStoreBus = <K extends keyof T>(key: K) => {
    const [value, setValue] = useState<T[K]>(() => store.get(key as string));

    const subscriber = useCallback((value: T[K]) => {
      setValue(value);
    }, []);

    useEffect(() => {
      store.subscribe(key as string, subscriber);

      return () => store.unSubscribe(key as string, subscriber);
    }, [key, subscriber]);

    const dispatch = useCallback(
      (newValue: T[K] | ((prev: T[K]) => T[K])) => {
        dispatchWithKey(key, newValue);
      },
      [key]
    );

    return { value, dispatch };
  };

  const isFuction = <K extends keyof T>(
    t: T[K] | ((prev: T[K]) => T[K])
  ): t is (prev: T[K]) => T[K] => typeof t === "function";

  const timerRef: Partial<Record<keyof T, number>> = {};

  const dispatchWithKey = <K extends keyof T>(
    key: keyof T,
    newValue: T[K] | ((prev: T[K]) => T[K])
  ) => {
    if (timerRef[key]) {
      clearTimeout(timerRef[key]);
    }

    timerRef[key] = setTimeout(() => {
      if (isFuction(newValue)) {
        const prev = store.get(key as string);
        store.set(key as string, newValue(prev));
      } else {
        store.set(key as string, newValue);
      }

      delete timerRef[key];
    }, 0);
  };

  const getCached = <K extends keyof T>(key: K): T[K] => {
    return store.get(key as string);
  };

  return { useStoreBus, dispatch: dispatchWithKey, getCached };
};
