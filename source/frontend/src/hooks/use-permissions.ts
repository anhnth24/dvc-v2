// use-permissions skeleton
export function usePermissions() {
  return { has: (perm: string) => { void perm; return false; } } as const;
}
