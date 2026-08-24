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

/**
 * The getServerSideProps redirect for a signed-out visitor, carrying where they
 * were headed so /login can return them there. Without the `next` hop, anyone
 * following a shared link to a gated page landed on /dashboard instead.
 *
 * `resolvedUrl` is trusted (Next builds it from the matched route), but it is
 * run through the same same-origin check as any client-supplied value.
 */
export function loginRedirect(resolvedUrl: string) {
  const next = safeNextPath({ next: resolvedUrl });
  return {
    redirect: {
      destination: next ? `/login?next=${encodeURIComponent(next)}` : "/login",
      permanent: false,
    },
  };
}
