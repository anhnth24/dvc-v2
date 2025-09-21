// use-local-storage skeleton
export function useLocalStorage<T>(_key: string, initial: T) {
  return [initial, (_v: T) => { void _v; }] as const;
}
