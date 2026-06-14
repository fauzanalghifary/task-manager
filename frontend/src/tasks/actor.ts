export const actors = [
  { value: "john.doe", label: "John Doe" },
  { value: "jane.smith", label: "Jane Smith" },
  { value: "alex.lee", label: "Alex Lee" },
] as const;

export type Actor = (typeof actors)[number]["value"];
