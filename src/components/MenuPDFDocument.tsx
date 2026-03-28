import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { LibraryGame } from "@pages/api/games/library";

interface CourseConfig {
  readonly id: string;
  readonly icon: string;
  readonly label: string;
  readonly subtitle: string;
}

export interface MenuSelection {
  [courseId: string]: LibraryGame[];
}

export interface MenuPdfDocumentProps {
  menu: MenuSelection;
  courses: readonly CourseConfig[];
}

// Remove fonts temporarily to troubleshoot PDF rendering.

// Font.register({
//   family: "Playfair Display",
//   fonts: [
//     {
//       src: "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtXK-F2qC0s.woff",
//       fontWeight: 400,
//     },
//     {
//       src: "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtXK-F2qO0s.woff",
//       fontWeight: 700,
//     },
//     {
//       src: "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXBYf9lW4e5j5hNKc1UJGTaY7gFiA.woff",
//       fontWeight: 400,
//       fontStyle: "italic",
//     },
//   ],
// });

// Font.register({
//   family: "DM Sans",
//   fonts: [
//     {
//       src: "https://fonts.gstatic.com/s/dmsans/v15/rP2Hp2ywxg089UriCZOIHQ.woff",
//       fontWeight: 300,
//     },
//     {
//       src: "https://fonts.gstatic.com/s/dmsans/v15/rP2Fp2ywxg089UriASitCBimCw.woff",
//       fontWeight: 400,
//     },
//     {
//       src: "https://fonts.gstatic.com/s/dmsans/v15/rP2Cp2ywxg089UriAWCrCBimCw.woff",
//       fontWeight: 500,
//     },
//   ],
// });

// ─── Colour palette (matches MenuPage) ────────────────────────────────────────

const C = {
  bg: "#0f0c08",
  bgCard: "#1c1810",
  gold: "#e8c97a",
  goldFaded: "#9a8550",
  amber: "#c8962a",
  text: "#f0e6cc",
  textDim: "#b8a880",
  textFaint: "#6e6248",
  border: "#3a3020",
  white: "#ffffff",
  black: "#000000",
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 56,
    // fontFamily: "DM Sans",
  },

  // ── Cover header
  coverDecorLine: {
    height: 1,
    backgroundColor: C.goldFaded,
    marginBottom: 20,
  },
  coverTitle: {
    // fontFamily: "Playfair Display",
    fontStyle: "italic",
    fontSize: 24,
    color: C.text,
    textAlign: "center",
    letterSpacing: 0,
    lineHeight: 1.1,
  },
  coverSubtitle: {
    // fontFamily: "DM Sans",
    fontWeight: 300,
    fontSize: 12,
    color: C.textDim,
    textAlign: "center",
    marginTop: 8,
    letterSpacing: 1,
  },
  coverDate: {
    // fontFamily: "DM Sans",
    fontWeight: 300,
    fontSize: 10,
    color: C.textFaint,
    textAlign: "center",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  coverDecorLineBottom: {
    height: 1,
    backgroundColor: C.goldFaded,
    marginTop: 20,
    marginBottom: 20,
  },

  // ── Programme label
  programmeLabel: {
    // fontFamily: "DM Sans",
    fontWeight: 300,
    fontSize: 9,
    color: C.goldFaded,
    textAlign: "center",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 18,
  },

  // ── Course section
  courseSection: {
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: C.border,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: C.bgCard,
  },
  courseHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 2,
  },
  courseIcon: {
    // fontFamily: "DM Sans",
    fontSize: 14,
    marginRight: 8,
    color: C.text,
  },
  courseLabel: {
    // fontFamily: "Playfair Display",
    fontWeight: 700,
    fontSize: 18,
    color: C.gold,
    letterSpacing: -0.2,
  },
  courseSubtitle: {
    // fontFamily: "DM Sans",
    fontWeight: 300,
    fontSize: 10,
    color: C.textDim,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  courseDivider: {
    height: 0.5,
    backgroundColor: C.border,
    marginBottom: 12,
  },

  // ── Game row
  gameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  gameBullet: {
    // fontFamily: "Playfair Display",
    fontStyle: "italic",
    fontSize: 10,
    color: C.goldFaded,
    marginRight: 8,
    marginTop: 1,
  },
  gameDetails: {
    flex: 1,
  },
  gameName: {
    // fontFamily: "Playfair Display",
    fontWeight: 400,
    fontSize: 14,
    color: C.text,
    lineHeight: 1.2,
  },
  gameMeta: {
    // fontFamily: "DM Sans",
    fontWeight: 300,
    fontSize: 9,
    color: C.textDim,
    marginTop: 2,
    letterSpacing: 0.2,
  },

  // ── Empty course
  emptyText: {
    // fontFamily: "DM Sans",
    fontWeight: 300,
    fontStyle: "italic",
    fontSize: 11,
    color: C.textFaint,
  },

  // ── Footer
  footer: {
    position: "absolute",
    bottom: 32,
    left: 72,
    right: 72,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: C.border,
  },
  footerText: {
    // fontFamily: "DM Sans",
    fontWeight: 300,
    fontSize: 8,
    color: C.textFaint,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginHorizontal: 12,
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPlaytime(min: number | null, max: number | null): string {
  if (!min && !max) return "";
  if (min && max && min !== max) return `${min}–${max} min`;
  if (max) return `${max} min`;
  if (min) return `${min}+ min`;
  return "";
}

function formatPlayers(min: number | null, max: number | null): string {
  if (!min && !max) return "";
  if (min && max && min !== max) return `${min}–${max} players`;
  if (max) return `${max} players`;
  if (min) return `${min}+ players`;
  return "";
}

function formatGameMeta(game: LibraryGame): string {
  const parts: string[] = [];
  const players = formatPlayers(game.minPlayers ?? null, game.maxPlayers ?? null);
  const playtime = formatPlaytime(game.minPlaytime ?? null, game.maxPlaytime ?? null);
  if (players) parts.push(players);
  if (playtime) parts.push(playtime);
  return parts.join("  ·  ");
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
function stripEmojis(text: string): string {
  return text.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "").trim();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GameRow({ game }: { game: LibraryGame }) {
  const meta = formatGameMeta(game);
  return (
    <View style={s.gameRow}>
      <View style={s.gameDetails}>
        <Text style={s.gameName}>{game.name}</Text>
        {meta ? <Text style={s.gameMeta}>{meta}</Text> : null}
      </View>
    </View>
  );
}

function CourseSection({ course, games }: { course: CourseConfig; games: LibraryGame[] }) {
  return (
    <View style={s.courseSection}>
      <View style={s.courseHeaderRow}>
        <Text style={s.courseLabel}> {stripEmojis(course.label)}</Text>
      </View>
      <View style={s.courseDivider} />
      {games.length > 0 ? (
        games.map((game) => <GameRow key={game.gameId ?? game.name} game={game} />)
      ) : (
        <Text style={s.emptyText}>No games in this course</Text>
      )}
    </View>
  );
}

// ─── Main document ────────────────────────────────────────────────────────────

export default function MenuPdfDocument({ menu, courses }: MenuPdfDocumentProps) {
  return (
    <Document title="The Menu — Tablekeeper" author="Tablekeeper" subject="Game Night Menu">
      <Page size="LETTER" style={s.page}>
        {/* ── Header ── */}
        <View style={s.coverDecorLine} />
        <Text style={s.coverTitle}>The Menu</Text>
        <Text style={s.coverSubtitle}>A curated evening of games</Text>
        <Text style={s.coverDate}>{formatDate()}</Text>
        <View style={s.coverDecorLineBottom} />

        {/* ── Programme label ── */}
        <Text style={s.programmeLabel}>Tonight's Programme</Text>

        {/* ── Courses ── */}
        {courses.map((course) => (
          <CourseSection key={course.id} course={course} games={menu[course.id] ?? []} />
        ))}

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <View style={s.footerLine} />
          <Text style={s.footerText}>Generated by Tablekeeper</Text>
          <View style={s.footerLine} />
        </View>
      </Page>
    </Document>
  );
}
