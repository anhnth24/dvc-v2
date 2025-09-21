// use-notifications skeleton
export function useNotifications() {
  return { notifications: [] as { id: string; message: string }[] } as const;
}
