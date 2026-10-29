// Courier names offered in the forms. The services check them again against their own application.yaml.
export const COURIERS: string[] = String(import.meta.env.VITE_COURIERS ?? 'Courier A,Courier B')
  .split(',')
  .map((c) => c.trim())
  .filter(Boolean);

export const PAGE_SIZE = 20;
