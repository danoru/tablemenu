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
};

// Tint fills per course id — same coding as the web menu sheet
const COURSE_TINTS: Record<string, string> = {
  appetizer: "#e2e8d4", // olive
  entree: "#f4d9d2", // brick
  epic: "#ecdce6", // plum
  dessert: "#d9e6e2", // teal
};

const s = StyleSheet.create({
  page: {
    backgroundColor: C.paper,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 36,
    fontFamily: "Space Grotesk",
    color: C.ink,
  },

  // bold sticker frame around the whole sheet
  frame: {
    flex: 1,
    borderWidth: 2.5,
    borderColor: C.ink,
    borderRadius: 12,
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 48,
  },

  brand: {
    fontFamily: "Space Grotesk",
    fontSize: 8,
    fontWeight: 700,
    color: C.brick,
    letterSpacing: 3,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 12,
  },
  title: {
    fontFamily: "Fraunces",
    fontStyle: "italic",
    fontWeight: 900,
    fontSize: 34,
    color: C.ink,
    textAlign: "center",
    lineHeight: 1.05,
    marginBottom: 8,
  },
  titleDate: {
    fontFamily: "Space Grotesk",
    fontWeight: 500,
    fontSize: 9,
    color: C.muted,
    textAlign: "center",
    marginBottom: 18,
  },

  doubleRuleBold: { height: 2, backgroundColor: C.ink, marginBottom: 2.5 },
  doubleRuleHair: { height: 0.75, backgroundColor: C.ink, opacity: 0.35, marginBottom: 26 },

  course: {
    marginBottom: 0,
  },
  courseChipRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 7,
  },
  courseChip: {
    borderWidth: 1.5,
    borderColor: C.ink,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  courseChipText: {
    fontFamily: "Space Grotesk",
    fontWeight: 700,
    fontSize: 9,
    color: C.ink,
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  courseSubtitle: {
    fontFamily: "Fraunces",
    fontStyle: "italic",
    fontWeight: 700,
    fontSize: 10,
    color: C.faint,
    textAlign: "center",
    marginBottom: 14,
  },

  gameRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  gameName: {
    fontFamily: "Fraunces",
    fontWeight: 700,
    fontSize: 13,
    color: C.ink,
    lineHeight: 1.25,
    maxWidth: 320,
  },
  gameLeader: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: C.leader,
    borderBottomStyle: "dotted",
    marginHorizontal: 6,
    marginBottom: 2.5,
    minWidth: 16,
  },
  gameMeta: {
    fontFamily: "Space Grotesk",
    fontWeight: 500,
    fontSize: 8,
    color: C.muted,
    marginBottom: 1,
  },
  gameTasting: {
    fontFamily: "Fraunces",
    fontStyle: "italic",
    fontWeight: 700,
    fontSize: 9.5,
    color: C.muted,
    lineHeight: 1.4,
    textAlign: "left",
    paddingHorizontal: 16,
    marginTop: -6,
    marginBottom: 10,
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
    marginVertical: 18,
  },
  dividerDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    backgroundColor: C.brick,
  },
  dividerDotSmall: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: C.brick,
    opacity: 0.55,
  },

  footer: {
    position: "absolute",
    bottom: 54,
    left: 84,
    right: 84,
    paddingTop: 10,
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
  footerMark: {
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    backgroundColor: C.brick,
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
  if (min && max && min !== max) return `${min}–${max}p`;
  if (max) return `${max}p`;
  if (min) return `${min}+p`;
  return "";
}

function formatGameMeta(game: LibraryGame): string {
  const parts: string[] = [];
  const players = formatPlayers(game.minPlayers ?? null, game.maxPlayers ?? null);
  const playtime = formatPlaytime(game.minPlaytime ?? null, game.maxPlaytime ?? null);
  if (players) parts.push(players);
  if (playtime) parts.push(playtime);
  return parts.join(" · ");
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
  return text.replace(/[\p{Extended_Pictographic}️]/gu, "").trim();
}

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
    <View wrap={false}>
      <View style={s.gameRow}>
        <Text style={s.gameName}>{game.name}</Text>
        <View style={s.gameLeader} />
        {meta ? <Text style={s.gameMeta}>{meta}</Text> : null}
      </View>
      {tasting ? <Text style={s.gameTasting}>{tasting}</Text> : null}
    </View>
  );
}

function CourseSection({
  course,
  games,
  tastingNotes,
}: {
  course: CourseConfig;
  games: LibraryGame[];
  tastingNotes?: Record<string, string>;
}) {
  const label = stripEmojis(course.label);
  const tint = COURSE_TINTS[course.id] ?? C.paper;
  return (
    <View style={s.course} wrap={false}>
      <View style={s.courseChipRow}>
        <View style={[s.courseChip, { backgroundColor: tint }]}>
          <Text style={s.courseChipText}>{label}</Text>
        </View>
      </View>
      {course.subtitle ? (
        <Text style={s.courseSubtitle}>{stripEmojis(course.subtitle)}</Text>
      ) : null}
      {games.length > 0 ? (
        games.map((game) => (
          <GameRow key={game.gameId ?? game.name} game={game} tastingNotes={tastingNotes} />
        ))
      ) : (
        <Text style={s.emptyText}>— Left to the chef&apos;s discretion —</Text>
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
        <View style={s.frame}>
          <Text style={s.brand}>Tablekeeper · An Evening of Games</Text>
          <Text style={s.title}>Tonight&apos;s Programme</Text>
          <Text style={s.titleDate}>{formatLongDate(today)}</Text>

          <View style={s.doubleRuleBold} />
          <View style={s.doubleRuleHair} />

          {courses.map((course, idx) => (
            <View key={course.id}>
              {idx > 0 ? (
                <View style={s.dividerRow}>
                  <View style={s.dividerDotSmall} />
                  <View style={s.dividerDot} />
                  <View style={s.dividerDotSmall} />
                </View>
              ) : null}
              <CourseSection
                course={course}
                games={menu[course.id] ?? []}
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
