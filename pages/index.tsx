import Header from "@/components/layout/Header";
import {
  BORDER_INK,
  BRICK,
  FONT_SANS,
  FONT_SERIF,
  INK,
  OLIVE,
  SHADOW_HARD,
  TINT_MUSTARD,
  TINT_OLIVE,
} from "@/styles/theme";
import { Box, Button, OutlinedInput, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import React from "react";

import { authOptions } from "./api/auth/[...nextauth]";

const styles = {
  root: {
    backgroundColor: "background.default",
    minHeight: "100vh",
    overflowX: "hidden" as const,
    display: "flex",
    flexDirection: "column" as const,
  },

  content: {
    display: "flex",
    flexDirection: "column" as const,
    flexGrow: 1,
  },

  hero: {
    padding: "72px 32px 52px",
    maxWidth: "860px",
    margin: "0 auto",
    width: "100%",
    textAlign: "center" as const,
  },

  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: TINT_OLIVE,
    border: BORDER_INK,
    boxShadow: SHADOW_HARD,
    color: INK,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    fontFamily: FONT_SANS,
    padding: "5px 14px",
    borderRadius: "999px",
    marginBottom: "28px",
  },

  eyebrowDot: {
    width: "6px",
    height: "6px",
    backgroundColor: OLIVE,
    borderRadius: "50%",
    flexShrink: 0,
  },

  headline: {
    fontFamily: FONT_SERIF,
    fontSize: "clamp(38px, 6vw, 62px)",
    fontWeight: 900,
    lineHeight: 1.05,
    color: "text.primary",
    margin: "0 0 20px",
    letterSpacing: "-1px",
  },

  headlineEm: {
    fontStyle: "italic",
    color: BRICK,
  },

  subhead: {
    fontFamily: FONT_SANS,
    fontSize: "17px",
    fontWeight: 400,
    color: "text.secondary",
    lineHeight: 1.75,
    maxWidth: "520px",
    margin: "0 auto 44px",
  },

  ctaRow: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap" as const,
    marginBottom: "60px",
  },

  dividerWrap: {
    padding: "0 32px",
    maxWidth: "860px",
    margin: "0 auto",
    width: "100%",
  },

  divider: {
    width: "100%",
    height: "1px",
    background: "rgba(51,39,26,0.18)",
  },

  modes: {
    padding: "48px 32px",
    maxWidth: "860px",
    margin: "0 auto",
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
  },

  modeCard: (featured: boolean) => ({
    backgroundColor: featured ? TINT_OLIVE : "background.paper",
    border: BORDER_INK,
    borderRadius: "13px",
    boxShadow: SHADOW_HARD,
    padding: "28px",
    cursor: "default",
  }),

  modeTag: (amber: boolean) => ({
    display: "inline-block",
    fontFamily: FONT_SANS,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: INK,
    backgroundColor: amber ? TINT_MUSTARD : TINT_OLIVE,
    border: `1.5px solid ${INK}`,
    padding: "3px 10px",
    borderRadius: "999px",
    marginBottom: "16px",
  }),

  modeIcon: {
    fontSize: "28px",
    display: "block",
    marginBottom: "12px",
    lineHeight: 1,
  },

  modeTitle: {
    fontFamily: FONT_SERIF,
    fontSize: "22px",
    fontWeight: 700,
    color: "text.primary",
    margin: "0 0 10px",
  },

  modeDesc: {
    fontFamily: FONT_SANS,
    fontSize: "14px",
    fontWeight: 400,
    color: "text.secondary",
    lineHeight: 1.65,
    margin: 0,
  },

  features: {
    padding: "0 32px 52px",
    maxWidth: "860px",
    margin: "0 auto",
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  },

  featCard: {
    padding: "20px",
    borderRadius: "13px",
    backgroundColor: "background.paper",
    border: BORDER_INK,
    boxShadow: SHADOW_HARD,
  },

  featIcon: {
    width: "32px",
    height: "32px",
    backgroundColor: TINT_MUSTARD,
    border: `1.5px solid ${INK}`,
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
    marginBottom: "12px",
  },

  featTitle: {
    fontFamily: FONT_SERIF,
    fontSize: "16px",
    fontWeight: 700,
    color: "text.primary",
    margin: "0 0 6px",
  },

  featDesc: {
    fontFamily: FONT_SANS,
    fontSize: "13px",
    color: "text.secondary",
    lineHeight: 1.55,
    margin: 0,
  },

  roomSection: {
    padding: "0 32px 60px",
    maxWidth: "860px",
    margin: "0 auto",
    width: "100%",
  },

  roomBox: {
    backgroundColor: "background.paper",
    border: BORDER_INK,
    borderRadius: "13px",
    boxShadow: SHADOW_HARD,
    padding: "28px 32px",
    display: "flex",
    alignItems: "center",
    gap: "24px",
    flexWrap: "wrap" as const,
  },

  roomText: {
    flex: 1,
    minWidth: "200px",
  },

  roomTitle: {
    fontFamily: FONT_SERIF,
    fontSize: "18px",
    fontWeight: 700,
    color: "text.primary",
    margin: "0 0 4px",
  },

  roomSub: {
    fontFamily: FONT_SANS,
    fontSize: "13px",
    color: "text.secondary",
    margin: 0,
  },

  roomInputRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap" as const,
  },
};

const FEATURES = [
  {
    icon: "📚",
    title: "Smart library",
    desc: "Search 100k+ games via BoardGameGeek. Box art, player counts, and complexity auto-filled.",
  },
  {
    icon: "🎲",
    title: "Weighted randomizer",
    desc: "Favorites get higher odds. Veto a pick and re-roll without restarting.",
  },
  {
    icon: "🍽️",
    title: "The Menu",
    desc: "Appetizers, entrées, and dessert games — a curated lineup for the whole evening.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleRoomSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roomCode.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/rooms/${roomCode.toUpperCase()}`);
      if (res.ok) {
        router.push(`/rooms/${roomCode.toUpperCase()}`);
      } else {
        setError("Room not found. Check your code and try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header
        title="Tablekeeper — Board game night, sorted"
        description="Stop arguing about what to play. Tablekeeper picks the perfect game for your group in seconds."
      />

      <Box sx={styles.root}>
        <Box sx={styles.content}>
          <Box sx={styles.hero}>
            <Box sx={styles.eyebrow}>
              <Box
                sx={{
                  ...styles.eyebrowDot,
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.3 },
                  },
                  animation: "pulse 2s infinite",
                }}
              />
              Board game night, sorted
            </Box>

            <Typography component="h1" sx={styles.headline}>
              Stop arguing.
              <br />
              <em style={styles.headlineEm}>Start playing.</em>
            </Typography>

            <Typography sx={styles.subhead}>
              Tablekeeper manages your game library, matches games to your group size and mood, and
              helps everyone agree on what to play — in seconds.
            </Typography>

            <Box sx={styles.ctaRow}>
              <Button
                variant="contained"
                onClick={() => router.push("/register")}
                sx={{
                  fontSize: "15px",
                  padding: "13px 28px",
                }}
              >
                Build my library
              </Button>
            </Box>
          </Box>

          <Box sx={styles.dividerWrap}>
            <Box sx={styles.divider} />
          </Box>

          <Box sx={styles.modes}>
            <Box sx={styles.modeCard(true)}>
              <Box sx={styles.modeTag(false)}>Quick Gen</Box>
              <Box component="span" sx={styles.modeIcon}>
                ⚡
              </Box>
              <Typography sx={styles.modeTitle}>Tonight, in 10 seconds</Typography>
              <Typography sx={styles.modeDesc}>
                Tell us how many players and how much time you have. We'll pick the perfect game
                from your library — no account needed.
              </Typography>
            </Box>

            <Box sx={styles.modeCard(false)}>
              <Box sx={styles.modeTag(true)}>Game Night Mode</Box>
              <Box component="span" sx={styles.modeIcon}>
                🪑
              </Box>
              <Typography sx={styles.modeTitle}>Invite your whole group</Typography>
              <Typography sx={styles.modeDesc}>
                Create a room, share the code, and combine everyone's libraries. Vote on games,
                browse the menu, and let the table decide.
              </Typography>
            </Box>
          </Box>

          <Box sx={styles.features}>
            {FEATURES.map((f) => (
              <Box key={f.title} sx={styles.featCard}>
                <Box sx={styles.featIcon}>{f.icon}</Box>
                <Typography sx={styles.featTitle}>{f.title}</Typography>
                <Typography sx={styles.featDesc}>{f.desc}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={styles.roomSection}>
            <Box sx={styles.roomBox}>
              <Box sx={styles.roomText}>
                <Typography sx={styles.roomTitle}>Got a room code?</Typography>
                <Typography sx={styles.roomSub}>
                  Your host will share a short code. Enter it to join their table.
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleRoomSubmit} sx={styles.roomInputRow}>
                <OutlinedInput
                  value={roomCode}
                  onChange={(e) => {
                    setRoomCode(e.target.value.toUpperCase());
                    setError("");
                  }}
                  placeholder="ENTER CODE"
                  inputProps={{ maxLength: 6 }}
                  error={!!error}
                  sx={{
                    fontFamily: FONT_SANS,
                    fontSize: "15px",
                    fontWeight: 700,
                    letterSpacing: "3px",
                    textAlign: "center",
                    width: "160px",
                    "& input": { textAlign: "center", padding: "10px 14px" },
                    "& input::placeholder": {
                      letterSpacing: "1px",
                      fontSize: "13px",
                    },
                    "&.Mui-error .MuiOutlinedInput-notchedOutline": {
                      borderColor: "error.main",
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !roomCode.trim()}
                  sx={{
                    fontSize: "14px",
                    padding: "10px 20px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {loading ? "Finding…" : "Join table"}
                </Button>
              </Box>

              {error && (
                <Typography
                  sx={{
                    width: "100%",
                    fontFamily: FONT_SANS,
                    fontSize: "13px",
                    color: "error.main",
                    marginTop: "8px",
                  }}
                >
                  {error}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session) {
    return {
      redirect: { destination: "/dashboard", permanent: false },
    };
  }

  return { props: {} };
};
