import { dot } from "./dot";
import { DotSchema } from "./dot.schema";

export function loadDot() {
  const result = DotSchema.safeParse(dot);
  if (!result.success) {
    throw new Error(result.error.message);
  }
  return result.data;
}
