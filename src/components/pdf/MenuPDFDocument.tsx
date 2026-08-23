import type { LibraryGame } from "@pages/api/games/library";
import {
  Circle,
  Document,
  Font,
  Image,
  Page,
  Polygon,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";

import { initials } from "@/lib/helpers";
import { playersLabel, priceLabel, ratingLabel, spiceLevel } from "@/lib/menu/format";
import { menuStats, playHoursLabel, sawtoothPoints, splitSections } from "@/lib/menu/layout";
import type { MenuSelection, SectionAccent, SectionConfig } from "@/lib/menu/types";

export interface MenuPdfDocumentProps {
  menu: MenuSelection;
  sections: readonly SectionConfig[];
  tastingNotes?: Record<string, string>;
  /** gameId → same-origin image URL (or data URI). Games without one get a monogram tile. */
  covers?: Record<string, string>;
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
  paperDim: "rgba(255,251,240,0.78)",
  paperFaint: "rgba(255,251,240,0.62)",
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

// ─── Geometry: one Letter page BY CONSTRUCTION ──────────────────────────────
// Generation caps the menu at 12 games (HARD_CAP), and the two-column split
// puts at most 6 rows in a column (see splitSections). With the fixed sizes
// below the worst case — every section full, longest names, 2-line notes —
// tops out well inside a single page (verified by scripts/pdfverify), so
// there is no density switching. All big blocks are wrap={false}: overflow
// would warn, never spill to page 2 silently.
const PAGE_W = 612;
const CONTENT_PAD = 34;
const COL_PAD = 13; // inner gap on each side of the column divider
const RIBBON_W = (PAGE_W - CONTENT_PAD * 2) / 2 - COL_PAD; // full column width
const RIBBON_H = 16;
const BANNER_W = 176;
const BANNER_H = 18;
const SAW_H = 9;
const COVER = 30;

/** Flag-ribbon outline (notched ends) filling a w×h box. */
function ribbonPoints(w: number, h: number): string {
  const notch = h / 2;
  return `0,0 ${w},0 ${w - notch},${h / 2} ${w},${h} 0,${h} ${notch},${h / 2}`;
}

const s = StyleSheet.create({
  page: {
    backgroundColor: C.paper,
    paddingBottom: 44, // reserves the footer band
    fontFamily: "Space Grotesk",
    color: C.ink,
  },

  // Masthead — full-bleed ink band with stat badges, sawtooth bottom edge
  masthead: {
    backgroundColor: C.ink,
    paddingTop: 26,
    paddingBottom: 20,
    paddingHorizontal: 100,
  },
  kicker: {
    fontFamily: "Space Grotesk",
    fontWeight: 700,
    fontSize: 7,
    color: C.paperFaint,
    letterSpacing: 3,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 6,
  },
  title: {
    fontFamily: "Fraunces",
    fontStyle: "italic",
    fontWeight: 900,
    fontSize: 26,
    color: C.paper,
    textAlign: "center",
    lineHeight: 1.05,
    marginBottom: 5,
  },
  titleDate: {
    fontFamily: "Space Grotesk",
    fontWeight: 500,
    fontSize: 8.5,
    color: C.paperDim,
    letterSpacing: 1,
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: 26,
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeRing: { position: "absolute", top: 0, left: 0 },
  badgeValue: {
    fontFamily: "Fraunces",
    fontWeight: 900,
    fontSize: 14,
    color: C.paper,
    lineHeight: 1,
  },
  badgeLabel: {
    fontFamily: "Space Grotesk",
    fontWeight: 700,
    fontSize: 5,
    color: C.paperFaint,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 2,
  },

  // Course columns
  content: { paddingHorizontal: CONTENT_PAD, paddingTop: 22 },
  columns: { flexDirection: "row" },
  colLeft: {
    flex: 1,
    paddingRight: COL_PAD,
    borderRightWidth: 0.75,
    borderRightColor: C.leader,
    borderRightStyle: "dotted",
  },
  colRight: { flex: 1, paddingLeft: COL_PAD },

  section: { marginBottom: 18 },
  ribbon: { height: RIBBON_H, marginBottom: 7 },
  ribbonText: {
    position: "absolute",
    top: 4.5,
    left: 0,
    right: 0,
    fontFamily: "Space Grotesk",
    fontWeight: 700,
    fontSize: 7.5,
    color: C.paper,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Fraunces",
    fontStyle: "italic",
    fontWeight: 700,
    fontSize: 8,
    color: C.faint,
    textAlign: "center",
    marginBottom: 9,
  },

  // Game rows
  row: { flexDirection: "row", marginBottom: 10 },
  cover: {
    width: COVER,
    height: COVER,
    borderWidth: 1.2,
    borderColor: C.ink,
    borderRadius: 5,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginRight: 8,
  },
  coverImage: { width: "100%", height: "100%", objectFit: "cover" },
  coverInitials: { fontFamily: "Fraunces", fontWeight: 900, fontSize: 9.5 },
  rowBody: { flex: 1 },
  nameLine: { flexDirection: "row", alignItems: "flex-end" },
  gameName: {
    fontFamily: "Fraunces",
    fontWeight: 700,
    fontSize: 10.5,
    color: C.ink,
    lineHeight: 1.15,
    flexShrink: 1,
    maxWidth: 148, // keeps the dotted leader + time clear of long names
  },
  leader: {
    flexGrow: 1,
    flexShrink: 0,
    borderBottomWidth: 1,
    borderBottomColor: C.leader,
    borderBottomStyle: "dotted",
    marginHorizontal: 5,
    marginBottom: 2,
    minWidth: 12,
  },
  time: {
    fontFamily: "Space Grotesk",
    fontWeight: 700,
    fontSize: 7.5,
    color: C.ink,
    flexShrink: 0,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 },
  metaText: { fontFamily: "Space Grotesk", fontWeight: 500, fontSize: 7, color: C.muted },
  specialty: {
    fontFamily: "Space Grotesk",
    fontWeight: 700,
    fontSize: 6,
    color: C.mustardDark,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  spiceRow: { flexDirection: "row", gap: 1.5, alignItems: "center" },
  tasting: {
    fontFamily: "Fraunces",
    fontStyle: "italic",
    fontWeight: 700,
    fontSize: 8.2,
    color: C.muted,
    lineHeight: 1.32,
    marginTop: 2.5,
  },
  emptyText: {
    fontFamily: "Fraunces",
    fontStyle: "italic",
    fontWeight: 700,
    fontSize: 9.5,
    color: C.faint,
    textAlign: "center",
    paddingVertical: 4,
  },

  // Today's Special — double-framed feature box with an overlapping banner
  specialBox: {
    marginTop: 22,
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: 10,
    paddingTop: 17,
    paddingBottom: 13,
    paddingHorizontal: 16,
  },
  specialInner: {
    position: "absolute",
    top: 2.5,
    left: 2.5,
    right: 2.5,
    bottom: 2.5,
    borderWidth: 0.75,
    borderColor: C.ink,
    opacity: 0.3,
    borderRadius: 7,
  },
  bannerWrap: { position: "absolute", top: -9, left: 0, right: 0, alignItems: "center" },
  banner: { width: BANNER_W, height: BANNER_H },
  bannerText: {
    position: "absolute",
    top: 5.5,
    left: 0,
    right: 0,
    fontFamily: "Space Grotesk",
    fontWeight: 700,
    fontSize: 7.5,
    color: C.paper,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    textAlign: "center",
  },
  specialGames: { flexDirection: "row", marginTop: 6 },
  specialEntry: { flex: 1, paddingHorizontal: 6 },

  closing: {
    fontFamily: "Fraunces",
    fontStyle: "italic",
    fontWeight: 700,
    fontSize: 8,
    color: C.faint,
    textAlign: "center",
    marginTop: 18,
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: CONTENT_PAD,
    right: CONTENT_PAD,
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
  footerMark: { width: 4, height: 4, backgroundColor: C.brick, transform: "rotate(45deg)" },
});

function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Badge({ side, value, label }: { side: "left" | "right"; value: string; label: string }) {
  return (
    <View style={[s.badge, side === "left" ? { left: 30 } : { right: 30 }]}>
      <Svg height={54} style={s.badgeRing} viewBox="0 0 54 54" width={54}>
        <Circle cx={27} cy={27} fill="none" r={25.5} stroke="#d2ccc1" strokeWidth={1.5} />
        <Circle
          cx={27}
          cy={27}
          fill="none"
          r={22.5}
          stroke="#d2ccc1"
          strokeDasharray="1.5,2.5"
          strokeWidth={0.75}
        />
      </Svg>
      <Text style={s.badgeValue}>{value}</Text>
      <Text style={s.badgeLabel}>{label}</Text>
    </View>
  );
}

function Ribbon({ label }: { label: string }) {
  return (
    <View style={s.ribbon}>
      <Svg height={RIBBON_H} viewBox={`0 0 ${RIBBON_W} ${RIBBON_H}`} width={RIBBON_W}>
        <Polygon fill={C.ink} points={ribbonPoints(RIBBON_W, RIBBON_H)} />
      </Svg>
      <Text style={s.ribbonText}>{label}</Text>
    </View>
  );
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

function Cover({
  game,
  tint,
  color,
  src,
  size = COVER,
}: {
  game: LibraryGame;
  tint: string;
  color: string;
  src?: string;
  size?: number;
}) {
  return (
    <View style={[s.cover, { width: size, height: size, backgroundColor: tint }]}>
      {src ? (
        <Image src={src} style={s.coverImage} />
      ) : (
        <Text style={[s.coverInitials, { color }]}>{initials(game.name)}</Text>
      )}
    </View>
  );
}

function GameRow({
  game,
  tastingNotes,
  covers,
  accent,
  coverSize,
}: {
  game: LibraryGame;
  tastingNotes?: Record<string, string>;
  covers?: Record<string, string>;
  accent: { tint: string; color: string };
  coverSize?: number;
}) {
  const time = priceLabel(game);
  const players = playersLabel(game);
  const spice = spiceLevel(game);
  const rating = ratingLabel(game);
  const tasting = tastingNotes?.[String(game.gameId)];
  return (
    <View style={s.row} wrap={false}>
      <Cover
        color={accent.color}
        game={game}
        size={coverSize}
        src={covers?.[String(game.gameId)]}
        tint={accent.tint}
      />
      <View style={s.rowBody}>
        <View style={s.nameLine}>
          <Text style={[s.gameName, { maxLines: 1, textOverflow: "ellipsis" }]}>{game.name}</Text>
          <View style={s.leader} />
          {time ? <Text style={s.time}>{time}</Text> : null}
        </View>
        <View style={s.metaRow}>
          {players ? <Text style={s.metaText}>{players}</Text> : null}
          <SpiceDots color={accent.color} level={spice} />
          {rating ? <Text style={[s.metaText, { color: C.mustardDark }]}>{rating}</Text> : null}
          {game.isFavorite ? <Text style={s.specialty}>★ House specialty</Text> : null}
        </View>
        {tasting ? <Text style={[s.tasting, { maxLines: 2 }]}>{tasting}</Text> : null}
      </View>
    </View>
  );
}

function Section({
  section,
  games,
  tastingNotes,
  covers,
}: {
  section: SectionConfig;
  games: LibraryGame[];
  tastingNotes?: Record<string, string>;
  covers?: Record<string, string>;
}) {
  const accent = ACCENTS[section.accent];
  return (
    <View style={s.section} wrap={false}>
      <Ribbon label={section.label} />
      {section.subtitle ? <Text style={s.subtitle}>{section.subtitle}</Text> : null}
      {games.length > 0 ? (
        games.map((game) => (
          <GameRow
            key={game.gameId ?? game.name}
            accent={accent}
            covers={covers}
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

function SpecialBox({
  section,
  games,
  tastingNotes,
  covers,
}: {
  section: SectionConfig;
  games: LibraryGame[];
  tastingNotes?: Record<string, string>;
  covers?: Record<string, string>;
}) {
  const accent = ACCENTS[section.accent];
  return (
    <View style={s.specialBox} wrap={false}>
      <View style={s.specialInner} />
      <View style={s.bannerWrap}>
        <View style={s.banner}>
          <Svg height={BANNER_H} viewBox={`0 0 ${BANNER_W} ${BANNER_H}`} width={BANNER_W}>
            <Polygon fill={C.ink} points={ribbonPoints(BANNER_W, BANNER_H)} />
          </Svg>
          <Text style={s.bannerText}>{section.label}</Text>
        </View>
      </View>
      {section.subtitle ? (
        <Text style={[s.subtitle, { fontSize: 8.5 }]}>{section.subtitle}</Text>
      ) : null}
      {games.length > 0 ? (
        <View style={s.specialGames}>
          {games.map((game) => (
            <View key={game.gameId ?? game.name} style={s.specialEntry}>
              <GameRow
                accent={accent}
                covers={covers}
                coverSize={32}
                game={game}
                tastingNotes={tastingNotes}
              />
            </View>
          ))}
        </View>
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
  covers,
  date,
}: MenuPdfDocumentProps) {
  const today = date ?? new Date();
  const { left, right, special } = splitSections(sections, menu);
  const { count, minutes } = menuStats(sections, menu);
  const hours = playHoursLabel(minutes);
  const [hoursValue, ...hoursUnit] = hours.split(" ");

  return (
    <Document author="Tablekeeper" subject="Game Night Menu" title="The Menu — Tablekeeper">
      <Page size="LETTER" style={s.page}>
        <View style={s.masthead}>
          <Text style={s.kicker}>Tablekeeper · An Evening of Games</Text>
          <Text style={s.title}>Tonight&apos;s Programme</Text>
          <Text style={s.titleDate}>{formatLongDate(today)}</Text>
          <Badge label="games" side="left" value={String(count)} />
          {hours ? (
            <Badge label={`${hoursUnit.join(" ")} play`} side="right" value={hoursValue} />
          ) : null}
        </View>
        <Svg height={SAW_H} viewBox={`0 0 ${PAGE_W} ${SAW_H}`} width={PAGE_W}>
          <Polygon fill={C.ink} points={sawtoothPoints(PAGE_W, SAW_H)} />
        </Svg>

        <View style={s.content}>
          <View style={s.columns} wrap={false}>
            <View style={s.colLeft}>
              {left.map((section) => (
                <Section
                  key={section.id}
                  covers={covers}
                  games={menu[section.id] ?? []}
                  section={section}
                  tastingNotes={tastingNotes}
                />
              ))}
            </View>
            <View style={s.colRight}>
              {right.map((section) => (
                <Section
                  key={section.id}
                  covers={covers}
                  games={menu[section.id] ?? []}
                  section={section}
                  tastingNotes={tastingNotes}
                />
              ))}
            </View>
          </View>

          {special ? (
            <SpecialBox
              covers={covers}
              games={menu[special.id] ?? []}
              section={special}
              tastingNotes={tastingNotes}
            />
          ) : null}
          <Text style={s.closing}>
            — Substitutions gladly accommodated · ask your table keeper —
          </Text>
        </View>

        <View fixed style={s.footer}>
          <Text style={s.footerText}>Bon Jeu</Text>
          <View style={s.footerMark} />
          <Text style={s.footerText}>Generated by Tablekeeper</Text>
        </View>
      </Page>
    </Document>
  );
}
