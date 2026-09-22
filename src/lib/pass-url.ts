/** Stable static path for digital passes (works with `output: "export"`). */
export function passPath(id: string) {
  return `/pase/ver?id=${encodeURIComponent(id)}`;
}
