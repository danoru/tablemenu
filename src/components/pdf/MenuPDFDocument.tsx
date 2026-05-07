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
  tastingNotes?: Record<string, string>;
  date?: Date;
}

Font.register({
  family: "Cormorant Garamond",
  fonts: [
    { src: "/fonts/cormorant-garamond-regular.ttf", fontWeight: 400 },
    { src: "/fonts/cormorant-garamond-italic.ttf", fontWeight: 400, fontStyle: "italic" },
    { src: "/fonts/cormorant-garamond-medium.ttf", fontWeight: 500 },
    { src: "/fonts/cormorant-garamond-medium-italic.ttf", fontWeight: 500, fontStyle: "italic" },
  ],
});

Font.register({
  family: "Inter",
  fonts: [
    { src: "/fonts/inter-regular.ttf", fontWeight: 400 },
    { src: "/fonts/inter-medium.ttf", fontWeight: 500 },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const C = {
  paper: "#fdfcf8", // warm white (mostly invisible on print)
  ink: "#1a1410", // body
  inkSoft: "#1a1410",
  accent: "#6b1f2a", // burgundy — prints to a clean dark gray
  muted: "#6b6256", // captions, course descriptions
  hair: "#1a1410", // hairline rules (full ink)
};
const s = StyleSheet.create({
  page: {
    backgroundColor: C.paper,
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 72,
    fontFamily: "Cormorant Garamond",
    color: C.ink,
  },

  topRule: { height: 1, backgroundColor: C.hair, marginBottom: 3 },
  topRuleHair: { height: 0.5, backgroundColor: C.hair, opacity: 0.4, marginBottom: 22 },

  brandRow: {
    textAlign: "center",
    marginBottom: 18,
  },
  brand: {
    fontFamily: "Inter",
    fontSize: 7.5,
    fontWeight: 500,
    color: C.accent,
    letterSpacing: 3,
    textTransform: "uppercase",
    textAlign: "center",
  },
  title: {
    fontFamily: "Cormorant Garamond",
    fontStyle: "italic",
    fontWeight: 400,
    fontSize: 56,
    color: C.ink,
    textAlign: "center",
    lineHeight: 1,
    marginBottom: 12,
  },
  titleDeck: {
    fontFamily: "Cormorant Garamond",
    fontStyle: "italic",
    fontSize: 12,
    color: C.muted,
    textAlign: "center",
    lineHeight: 1.4,
  },
  titleDate: {
    fontFamily: "Cormorant Garamond",
    fontStyle: "italic",
    fontSize: 11,
    color: C.muted,
    textAlign: "center",
    marginTop: 4,
  },

  ornamentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    marginBottom: 4,
  },
  ornamentRule: { flex: 1, height: 0.5, backgroundColor: C.hair, opacity: 0.45 },
  ornamentMark: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.accent,
    marginHorizontal: 12,
  },

  programmeRow: {
    textAlign: "center",
    marginTop: 14,
    marginBottom: 22,
  },
  programmeLabel: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 8,
    color: C.ink,
    letterSpacing: 3,
    textTransform: "uppercase",
    textAlign: "center",
  },

  course: {
    marginBottom: 22,
  },
  courseHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 4,
  },
  numeral: {
    fontFamily: "Cormorant Garamond",
    fontStyle: "italic",
    fontSize: 12,
    color: C.accent,
    marginRight: 10,
  },
  courseLabel: {
    fontFamily: "Cormorant Garamond",
    fontStyle: "italic",
    fontWeight: 500,
    fontSize: 26,
    color: C.ink,
    textAlign: "center",
  },
  courseSubtitle: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 7.5,
    color: C.muted,
    letterSpacing: 2,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 10,
  },
  courseNote: {
    fontFamily: "Cormorant Garamond",
    fontStyle: "italic",
    fontSize: 11,
    color: C.muted,
    textAlign: "center",
    lineHeight: 1.5,
    marginHorizontal: 60,
    marginBottom: 12,
  },
  courseInnerOrnament: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  courseInnerRule: {
    width: 40,
    height: 0.5,
    backgroundColor: C.hair,
    opacity: 0.45,
  },
  courseInnerMark: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: C.accent,
    marginHorizontal: 10,
  },

  game: {
    marginBottom: 12,
    paddingHorizontal: 30,
  },
  gameName: {
    fontFamily: "Cormorant Garamond",
    fontStyle: "italic",
    fontWeight: 500,
    fontSize: 16,
    color: C.ink,
    textAlign: "center",
  },
  gameTasting: {
    fontFamily: "Cormorant Garamond",
    fontStyle: "italic",
    fontSize: 11,
    color: C.ink,
    opacity: 0.78,
    lineHeight: 1.5,
    textAlign: "center",
    marginTop: 3,
    marginHorizontal: 24,
  },
  gameMeta: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 7,
    color: C.accent,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    textAlign: "center",
    marginTop: 5,
  },

  emptyText: {
    fontFamily: "Cormorant Garamond",
    fontStyle: "italic",
    fontSize: 11,
    color: C.muted,
    textAlign: "center",
    paddingVertical: 6,
  },

  footer: {
    position: "absolute",
    bottom: 36,
    left: 72,
    right: 72,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: C.hair,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 7,
    color: C.muted,
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  footerMark: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.muted,
  },
});

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

function formatWeight(w: number | null | undefined): string {
  if (w == null) return "";
  return `weight ${w.toFixed(1)} / 5`;
}

function formatGameMeta(game: LibraryGame): string {
  const parts: string[] = [];
  const players = formatPlayers(game.minPlayers ?? null, game.maxPlayers ?? null);
  const playtime = formatPlaytime(game.minPlaytime ?? null, game.maxPlaytime ?? null);
  const weight = formatWeight((game as any).weight ?? null);
  if (players) parts.push(players);
  if (playtime) parts.push(playtime);
  if (weight) parts.push(weight);
  return parts.join("   ·   ");
}

function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function stripEmojis(text: string): string {
  return text.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "").trim();
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function GameRow({
  game,
  tastingNotes,
}: {
  game: LibraryGame;
  tastingNotes?: Record<string, string>;
}) {
  const meta = formatGameMeta(game);
  const noteKey = (game.gameId as unknown as string) ?? game.name;
  const tasting = tastingNotes?.[noteKey];
  return (
    <View style={s.game} wrap={false}>
      <Text style={s.gameName}>{game.name}</Text>
      {tasting ? <Text style={s.gameTasting}>{tasting}</Text> : null}
      {meta ? <Text style={s.gameMeta}>{meta}</Text> : null}
    </View>
  );
}

function CourseSection({
  course,
  games,
  index,
  tastingNotes,
}: {
  course: CourseConfig;
  games: LibraryGame[];
  index: number;
  tastingNotes?: Record<string, string>;
}) {
  const numeral = ROMAN[index] ?? `${index + 1}`;
  const label = stripEmojis(course.label);
  return (
    <View style={s.course} wrap={false}>
      <View style={s.courseHeaderRow}>
        <Text style={s.numeral}>{numeral}.</Text>
        <Text style={s.courseLabel}>{label}</Text>
      </View>
      {course.subtitle ? (
        <Text style={s.courseSubtitle}>{stripEmojis(course.subtitle)}</Text>
      ) : null}
      <View style={s.courseInnerOrnament}>
        <View style={s.courseInnerRule} />
        <View style={s.courseInnerMark} />
        <View style={s.courseInnerRule} />
      </View>
      {games.length > 0 ? (
        games.map((game) => (
          <GameRow key={game.gameId ?? game.name} game={game} tastingNotes={tastingNotes} />
        ))
      ) : (
        <Text style={s.emptyText}>— Course left to the chef's discretion —</Text>
      )}
    </View>
  );
}

export default function MenuPdfDocument({
  menu,
  courses,
  tastingNotes,
  date,
}: MenuPdfDocumentProps) {
  const today = date ?? new Date();
  return (
    <Document title="The Menu — Tablekeeper" author="Tablekeeper" subject="Game Night Menu">
      <Page size="LETTER" style={s.page}>
        {/* Title plate */}
        <View style={s.topRule} />
        <View style={s.topRuleHair} />

        <View style={s.brandRow}>
          <Text style={s.brand}>Tablekeeper · An Evening of Games</Text>
        </View>

        <Text style={s.title}>The Menu</Text>
        <Text style={s.titleDeck}>A curated tasting, in four courses</Text>
        <Text style={s.titleDate}>{formatLongDate(today)}</Text>

        <View style={s.ornamentRow}>
          <View style={s.ornamentRule} />
          <View style={s.ornamentMark} />
          <View style={s.ornamentRule} />
        </View>

        <View style={s.programmeRow}>
          <Text style={s.programmeLabel}>Tonight's Programme</Text>
        </View>

        {courses.map((course, idx) => (
          <CourseSection
            key={course.id}
            course={course}
            games={menu[course.id] ?? []}
            index={idx}
            tastingNotes={tastingNotes}
          />
        ))}

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Bon Jeu</Text>
          <View style={s.footerMark} />
          <Text style={s.footerText}>Generated by Tablekeeper.</Text>
        </View>
      </Page>
    </Document>
  );
}
