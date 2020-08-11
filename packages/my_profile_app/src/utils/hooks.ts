import { useEffect, useMemo, useState } from 'react';
import { Json } from './type';

export const useFetchedJsonData = (url: string): Json | undefined => {
  const [data, setData] = useState<Json | undefined>(undefined);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetch(url)
      .then((response) => response.json())
      .then(setData);
  }, [url, setData]);

  return data;
};

export const useFetchedText = (url: string): string | undefined => {
  const [data, setData] = useState<string | undefined>(undefined);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetch(url)
      .then((response) => response.text())
      .then(setData);
  }, [url, setData]);

  return data;
};

export const useValueWithDefault = <T>(
  nullableValue: T | undefined,
  defaultValue: T
): T => {
  const value = useMemo(
    () => (nullableValue === undefined ? defaultValue : nullableValue),
    [nullableValue, defaultValue]
  );
  return value;
};
