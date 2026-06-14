export const actors = ["john.doe", "jane.smith", "alex.lee"] as const;

export type Actor = (typeof actors)[number];
