import { GOLD, GOLD_LIGHT } from "@/styles/theme";
import { Box, Button, OutlinedInput, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import React from "react";

import { authOptions } from "./api/auth/[...nextauth]";

const styles = {
  root: {
    backgroundColor: "background.primary",
    minHeight: "100vh",
    position: "relative" as const,
    overflowX: "hidden" as const,
    display: "flex",
    flexDirection: "column" as const,
  },

  ambientTop: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    background:
      "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(34,85,48,0.22) 0%, transparent 70%)",
    pointerEvents: "none" as const,
    zIndex: 0,
  },

  ambientBottom: {
    position: "absolute" as const,
    bottom: 0,
    right: 0,
    width: "60%",
    height: "50%",
    background:
      "radial-gradient(ellipse 60% 50% at 80% 100%, rgba(180,110,30,0.07) 0%, transparent 70%)",
    pointerEvents: "none" as const,
    zIndex: 0,
  },

  content: {
    position: "relative" as const,
    zIndex: 1,
    display: "flex",
    flexDirection: "column" as const,
    flexGrow: 1,
  },

  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 32px",
    borderBottom: "1px solid rgba(180,140,60,0.15)",
  },

  logo: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "22px",
    fontWeight: 900,
    color: GOLD,
    letterSpacing: "-0.3px",
    userSelect: "none" as const,
  },

  logoFaded: {
    color: "rgba(232,201,122,0.4)",
    fontWeight: 700,
  },

  navRight: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
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
    background: "rgba(34,85,48,0.3)",
    border: "1px solid rgba(60,160,80,0.25)",
    color: "secondary.light",
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "1.2px",
    textTransform: "uppercase" as const,
    fontFamily: "'DM Sans', sans-serif",
    padding: "5px 14px",
    borderRadius: "20px",
    marginBottom: "28px",
  },

  eyebrowDot: {
    width: "6px",
    height: "6px",
    backgroundColor: "secondary.light",
    borderRadius: "50%",
    flexShrink: 0,
  },

  headline: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(38px, 6vw, 62px)",
    fontWeight: 900,
    lineHeight: 1.05,
    color: "#f0e6cc",
    margin: "0 0 20px",
    letterSpacing: "-1px",
  },

  headlineEm: {
    fontStyle: "italic",
    color: GOLD,
  },

  subhead: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "17px",
    fontWeight: 300,
    color: "rgba(232,223,200,0.6)",
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
    background: "linear-gradient(to right, transparent, rgba(180,140,60,0.2), transparent)",
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
    background: featured ? "rgba(34,85,48,0.12)" : "rgba(255,255,255,0.03)",
    border: featured ? "1px solid rgba(60,160,80,0.25)" : "1px solid rgba(180,140,60,0.14)",
    borderRadius: "12px",
    padding: "28px",
    transition: "border-color 0.2s",
    cursor: "default",
  }),

  modeTag: (amber: boolean) => ({
    display: "inline-block",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
    color: amber ? GOLD : "secondary.light",
    background: amber ? "rgba(180,110,30,0.25)" : "rgba(34,85,48,0.4)",
    border: amber ? "1px solid rgba(180,140,60,0.25)" : "1px solid rgba(60,160,80,0.2)",
    padding: "3px 10px",
    borderRadius: "20px",
    marginBottom: "16px",
  }),

  modeIcon: {
    fontSize: "28px",
    display: "block",
    marginBottom: "12px",
    lineHeight: 1,
  },

  modeTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "22px",
    fontWeight: 700,
    color: "#f0e6cc",
    margin: "0 0 10px",
  },

  modeDesc: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    fontWeight: 300,
    color: "rgba(232,223,200,0.55)",
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
    borderRadius: "10px",
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(180,140,60,0.1)",
  },

  featIcon: {
    width: "32px",
    height: "32px",
    background: "rgba(180,110,30,0.2)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
    marginBottom: "12px",
  },

  featTitle: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    fontWeight: 500,
    color: "#e8dfc8",
    margin: "0 0 6px",
  },

  featDesc: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px",
    color: "rgba(232,223,200,0.45)",
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
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(180,140,60,0.18)",
    borderRadius: "12px",
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
    fontFamily: "'Playfair Display', serif",
    fontSize: "18px",
    fontWeight: 700,
    color: "#f0e6cc",
    margin: "0 0 4px",
  },

  roomSub: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px",
    color: "rgba(232,223,200,0.4)",
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
        router.push(`/room/${roomCode.toUpperCase()}`);
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
      <Head>
        <title>Tablekeeper — Board game night, sorted</title>
        <meta
          name="description"
          content="Stop arguing about what to play. Tablekeeper picks the perfect game for your group in seconds."
        />
      </Head>

      <Box sx={styles.root}>
        <Box sx={styles.ambientTop} />
        <Box sx={styles.ambientBottom} />

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
                onClick={() => router.push("/register")}
                sx={{
                  background: "#c8962a",
                  border: "none",
                  borderRadius: "8px",
                  color: "background.default",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "15px",
                  fontWeight: 500,
                  padding: "13px 28px",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "primary.light",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s",
                }}
              >
                Build my library
              </Button>
              <Button
                onClick={() => router.push("/tablegen")}
                sx={{
                  background: "transparent",
                  border: "1px solid rgba(180,140,60,0.35)",
                  borderRadius: "8px",
                  color: GOLD_LIGHT,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "15px",
                  fontWeight: 500,
                  padding: "13px 28px",
                  textTransform: "none",
                  "&:hover": { background: "rgba(180,140,60,0.1)" },
                }}
              >
                Quick gen — no account
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
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: "7px",
                    color: "#e8dfc8",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "15px",
                    fontWeight: 500,
                    letterSpacing: "3px",
                    textAlign: "center",
                    width: "160px",
                    "& input": { textAlign: "center", padding: "10px 14px" },
                    "& input::placeholder": {
                      color: "rgba(232,223,200,0.25)",
                      letterSpacing: "1px",
                      fontSize: "13px",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: error ? "rgba(220,80,80,0.5)" : "rgba(180,140,60,0.25)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: error ? "rgba(220,80,80,0.7)" : "rgba(180,140,60,0.45)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(180,140,60,0.6)",
                    },
                  }}
                />
                <Button
                  type="submit"
                  disabled={loading || !roomCode.trim()}
                  sx={{
                    background: "#c8962a",
                    borderRadius: "7px",
                    color: "background.default",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    fontWeight: 500,
                    padding: "10px 20px",
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    "&:hover": { backgroundColor: "primary.light" },
                    "&.Mui-disabled": {
                      background: "rgba(200,150,42,0.35)",
                      color: "rgba(15,12,8,0.5)",
                    },
                  }}
                >
                  {loading ? "Finding…" : "Join table"}
                </Button>
              </Box>

              {error && (
                <Typography
                  sx={{
                    width: "100%",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    color: "rgba(220,100,100,0.9)",
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
