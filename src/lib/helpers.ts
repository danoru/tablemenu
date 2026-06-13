// Café Press accent inks — solid screen-print colors that read on light surfaces
const ACCENT_PALETTE = [
  "#c0452c", // brick
  "#d9a036", // mustard
  "#6b7f3f", // olive
  "#3f7f77", // teal
  "#8e5a78", // plum
  "#c68b4e", // wood tan
];

export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return ACCENT_PALETTE[Math.abs(hash) % ACCENT_PALETTE.length];
}

export function gameColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return ACCENT_PALETTE[Math.abs(hash) % ACCENT_PALETTE.length];
}

export function initials(name: string): string {
  const words = name.split(" ").filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
