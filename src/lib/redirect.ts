/** Returns `query.next` if it's a same-origin path, else null. Rejects absolute URLs and `//evil.com` protocol-relative URLs. */
export function safeNextPath(query: {
  [key: string]: string | string[] | undefined;
}): string | null {
  const next = query.next;
  if (typeof next !== "string") return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//")) return null;
  return next;
}
