import { playersLabel, priceLabel, ratingLabel, spiceLevel } from "@/lib/menu/format";
import type { MenuSelection, SectionAccent, SectionConfig } from "@/lib/menu/types";
import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { LibraryGame } from "@pages/api/games/library";

export interface MenuPdfDocumentProps {
  menu: MenuSelection;
  sections: readonly SectionConfig[];
  tastingNotes?: Record<string, string>;
  date?: Date;
}

Font.register({
  family: "Fraunces",
  fonts: [
    { src: "/fonts/fraunces-700.ttf", fontWeight: 700 },
    { src: "/fonts/fraunces-700-italic.ttf", fontWeight: 700, fontStyle: "italic" },
    { src: "/fonts/fraunces-900.ttf", fontWeight: 900 },
    { src: "/fonts/fraunces-900-italic.ttf", fontWeight: 900, fontStyle: "italic" },
  ],
});

Font.register({
  family: "Space Grotesk",
  fonts: [
    { src: "/fonts/space-grotesk-400.ttf", fontWeight: 400 },
    { src: "/fonts/space-grotesk-500.ttf", fontWeight: 500 },
    { src: "/fonts/space-grotesk-700.ttf", fontWeight: 700 },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

// Café Press print palette — mirrors src/styles/theme.ts
const C = {
  paper: "#fffbf0",
  ink: "#33271a",
  muted: "rgba(51,39,26,0.65)",
  faint: "rgba(51,39,26,0.45)",
  leader: "rgba(51,39,26,0.4)",
  brick: "#c0452c",
  mustardDark: "#a87a20",
};

const ACCENTS: Record<SectionAccent, { tint: string; color: string }> = {
  olive: { tint: "#e2e8d4", color: "#6b7f3f" },
  brick: { tint: "#f4d9d2", color: "#c0452c" },
  plum: { tint: "#ecdce6", color: "#8e5a78" },
  mustard: { tint: "#f3e4c2", color: "#a87a20" },
  teal: { tint: "#d9e6e2", color: "#3f7f77" },
};

// ─── Density: one Letter page BY CONSTRUCTION ───────────────────────────────
// Generation caps at 12 games, so two static tiers keyed on total item count
// keep even the worst case (every section full, longest names + 2-line notes)
// within a single page — no measure-and-rerender. The frame is wrap={false},
// so the geometry below must fit; game names are clamped to one line.
interface Density {
  framePadV: number;
  framePadH: number;
  brandMb: number;
  title: number;
  titleMb: number;
  dateMb: number;
  headRuleMb: number;
  chipFs: number;
  chipPadV: number;
  chipMb: number;
  subtitle: number;
  subtitleMb: number;
  gameName: number;
  meta: number;
  tasting: number;
  tastingMaxLines: number;
  rowGap: number;
  dividerMy: number;
}

const COMFORTABLE: Density = {
  framePadV: 13,
  framePadH: 44,
  brandMb: 3,
  title: 24,
  titleMb: 2,
  dateMb: 5,
  headRuleMb: 5,
  chipFs: 8.5,
  chipPadV: 2,
  chipMb: 2.5,
  subtitle: 8.5,
  subtitleMb: 3,
  gameName: 11.5,
  meta: 7,
  tasting: 8,
  tastingMaxLines: 2,
  rowGap: 3,
  dividerMy: 3.5,
};

const COMPACT: Density = {
  framePadV: 12,
  framePadH: 40,
  brandMb: 3,
  title: 22,
  titleMb: 2,
  dateMb: 5,
  headRuleMb: 5,
  chipFs: 7.5,
  chipPadV: 2,
  chipMb: 2,
  subtitle: 8,
  subtitleMb: 2.5,
  gameName: 10.5,
  meta: 6.5,
  tasting: 7,
  tastingMaxLines: 1,
  rowGap: 1.5,
  dividerMy: 3,
};

// The break-point is set from the empirical single-page capacity of each tier
// (see scripts/pdfverify): comfortable holds its 2-line notes up to 8 games;
// above that we switch to the 1-line compact tier, which fits the 12-game cap.
function densityFor(count: number): Density {
  return count <= 8 ? COMFORTABLE : COMPACT;
}

const s = StyleSheet.create({
  page: {
    backgroundColor: C.paper,
    paddingTop: 36,
    paddingBottom: 44, // single source of bottom spacing — reserves the footer band
    paddingHorizontal: 36,
    fontFamily: "Space Grotesk",
    color: C.ink,
  },
  frame: {
    borderWidth: 2.5,
    borderColor: C.ink,
    borderRadius: 12,
  },
  brand: {
    fontFamily: "Space Grotesk",
    fontWeight: 700,
    fontSize: 8,
    color: C.brick,
    letterSpacing: 3,
    textTransform: "uppercase",
    textAlign: "center",
  },
  title: {
    fontFamily: "Fraunces",
    fontStyle: "italic",
    fontWeight: 900,
    color: C.ink,
    textAlign: "center",
    lineHeight: 1.05,
  },
  titleDate: {
    fontFamily: "Space Grotesk",
    fontWeight: 500,
    fontSize: 9,
    color: C.muted,
    textAlign: "center",
  },
  doubleRuleBold: { height: 2, backgroundColor: C.ink, marginBottom: 2.5 },
  doubleRuleHair: { height: 0.75, backgroundColor: C.ink, opacity: 0.35 },

  chipRow: { flexDirection: "row", justifyContent: "center" },
  chip: {
    borderWidth: 1.5,
    borderColor: C.ink,
    borderRadius: 999,
    paddingHorizontal: 16,
  },
  chipText: {
    fontFamily: "Space Grotesk",
    fontWeight: 700,
    color: C.ink,
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  subtitle: {
    fontFamily: "Fraunces",
    fontStyle: "italic",
    fontWeight: 700,
    color: C.faint,
    textAlign: "center",
  },
  gameRow: { flexDirection: "row", alignItems: "flex-end" },
  gameName: {
    fontFamily: "Fraunces",
    fontWeight: 700,
    color: C.ink,
    lineHeight: 1.15,
    flexShrink: 1,
    maxWidth: 360, // keep the dotted leader + price clear when names run long
  },
  specialty: {
    fontFamily: "Space Grotesk",
    fontWeight: 700,
    fontSize: 6.5,
    color: C.mustardDark,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  leader: {
    flexGrow: 1,
    flexShrink: 0,
    borderBottomWidth: 1,
    borderBottomColor: C.leader,
    borderBottomStyle: "dotted",
    marginHorizontal: 6,
    marginBottom: 2.5,
    minWidth: 16,
  },
  price: { fontFamily: "Space Grotesk", fontWeight: 700, color: C.ink, marginBottom: 1 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 2 },
  metaText: { fontFamily: "Space Grotesk", fontWeight: 500, color: C.muted },
  spiceRow: { flexDirection: "row", gap: 1.5, alignItems: "center" },
  tasting: {
    fontFamily: "Fraunces",
    fontStyle: "italic",
    fontWeight: 700,
    color: C.muted,
    lineHeight: 1.3,
    marginTop: 1.5,
  },
  emptyText: {
    fontFamily: "Fraunces",
    fontStyle: "italic",
    fontWeight: 700,
    fontSize: 10.5,
    color: C.faint,
    textAlign: "center",
    paddingVertical: 4,
  },
  dividerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  dividerDot: { width: 3.5, height: 3.5, borderRadius: 1.75, backgroundColor: C.brick },
  dividerDotSmall: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: C.brick,
    opacity: 0.55,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 84,
    right: 84,
    paddingTop: 7,
    borderTopWidth: 0.75,
    borderTopColor: C.ink,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontFamily: "Space Grotesk",
    fontWeight: 700,
    fontSize: 7,
    color: C.muted,
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  footerMark: { width: 3.5, height: 3.5, borderRadius: 1.75, backgroundColor: C.brick },
});

function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function SpiceDots({ level, color }: { level: number; color: string }) {
  if (level <= 0) return null;
  return (
    <View style={s.spiceRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <View
          key={i}
          style={{
            width: 3,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: i < level ? color : "transparent",
            borderWidth: 0.5,
            borderColor: i < level ? color : C.faint,
          }}
        />
      ))}
    </View>
  );
}

function GameRow({
  game,
  tastingNotes,
  accent,
  d,
}: {
  game: LibraryGame;
  tastingNotes?: Record<string, string>;
  accent: string;
  d: Density;
}) {
  const price = priceLabel(game);
  const players = playersLabel(game);
  const spice = spiceLevel(game);
  const rating = ratingLabel(game);
  const tasting = tastingNotes?.[String(game.gameId)];
  return (
    <View wrap={false} style={{ marginBottom: d.rowGap }}>
      <View style={s.gameRow}>
        <Text style={[s.gameName, { fontSize: d.gameName, maxLines: 1, textOverflow: "ellipsis" }]}>
          {game.name}
          {game.isFavorite ? <Text style={s.specialty}>{"   ★ House specialty"}</Text> : null}
        </Text>
        <View style={s.leader} />
        {price ? <Text style={[s.price, { fontSize: d.meta + 1 }]}>{price}</Text> : null}
      </View>
      <View style={s.metaRow}>
        {players ? <Text style={[s.metaText, { fontSize: d.meta }]}>{players}</Text> : null}
        <SpiceDots color={accent} level={spice} />
        {rating ? (
          <Text style={[s.metaText, { fontSize: d.meta, color: C.mustardDark }]}>{rating}</Text>
        ) : null}
      </View>
      {tasting ? (
        <Text
          style={[
            s.tasting,
            { fontSize: d.tasting, maxLines: d.tastingMaxLines, textOverflow: "ellipsis" },
          ]}
        >
          {tasting}
        </Text>
      ) : null}
    </View>
  );
}

function Section({
  section,
  games,
  tastingNotes,
  d,
}: {
  section: SectionConfig;
  games: LibraryGame[];
  tastingNotes?: Record<string, string>;
  d: Density;
}) {
  const { tint, color } = ACCENTS[section.accent];
  return (
    <View wrap={false}>
      <View style={[s.chipRow, { marginBottom: d.chipMb }]}>
        <View style={[s.chip, { backgroundColor: tint, paddingVertical: d.chipPadV }]}>
          <Text style={[s.chipText, { fontSize: d.chipFs }]}>{section.label}</Text>
        </View>
      </View>
      {section.subtitle ? (
        <Text style={[s.subtitle, { fontSize: d.subtitle, marginBottom: d.subtitleMb }]}>
          {section.subtitle}
        </Text>
      ) : null}
      {games.length > 0 ? (
        games.map((game) => (
          <GameRow
            key={game.gameId ?? game.name}
            accent={color}
            d={d}
            game={game}
            tastingNotes={tastingNotes}
          />
        ))
      ) : (
        <Text style={s.emptyText}>— Left to the chef&apos;s discretion —</Text>
      )}
    </View>
  );
}

export default function MenuPdfDocument({
  menu,
  sections,
  tastingNotes,
  date,
}: MenuPdfDocumentProps) {
  const today = date ?? new Date();
  const totalGames = sections.reduce((n, sec) => n + (menu[sec.id]?.length ?? 0), 0);
  const d = densityFor(totalGames);

  return (
    <Document title="The Menu — Tablekeeper" author="Tablekeeper" subject="Game Night Menu">
      <Page size="LETTER" style={s.page}>
        <View
          style={[s.frame, { paddingVertical: d.framePadV, paddingHorizontal: d.framePadH }]}
          wrap={false}
        >
          <Text style={[s.brand, { marginBottom: d.brandMb }]}>
            Tablekeeper · An Evening of Games
          </Text>
          <Text style={[s.title, { fontSize: d.title, marginBottom: d.titleMb }]}>
            Tonight&apos;s Programme
          </Text>
          <Text style={[s.titleDate, { marginBottom: d.dateMb }]}>{formatLongDate(today)}</Text>

          <View style={s.doubleRuleBold} />
          <View style={[s.doubleRuleHair, { marginBottom: d.headRuleMb }]} />

          {sections.map((section, idx) => (
            <View key={section.id}>
              {idx > 0 ? (
                <View style={[s.dividerRow, { marginVertical: d.dividerMy }]}>
                  <View style={s.dividerDotSmall} />
                  <View style={s.dividerDot} />
                  <View style={s.dividerDotSmall} />
                </View>
              ) : null}
              <Section
                d={d}
                games={menu[section.id] ?? []}
                section={section}
                tastingNotes={tastingNotes}
              />
            </View>
          ))}
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Bon Jeu</Text>
          <View style={s.footerMark} />
          <Text style={s.footerText}>Generated by Tablekeeper</Text>
        </View>
      </Page>
    </Document>
  );
}
