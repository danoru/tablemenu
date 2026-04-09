import GameArt from "@/components/games/GameArt";
import GameDetailFriendActivity from "@/components/games/GameDetailFriendActivity";
import GameDetailPlayHistory from "@/components/games/GameDetailPlayHistory";
import StarRating from "@/components/ui/StarRating";
import StatPill from "@/components/ui/StatPill";
import { authOptions } from "@/lib/authOptions";
import {
  AMBER_DIM,
  BG_BLUE,
  BG_GREEN,
  BLUE,
  BORDER_AMBER,
  BORDER_BLUE,
  BORDER_GREEN,
  FONT_SANS,
  FONT_SERIF,
  RED,
  TEXT_DIM,
  TEXT_FAINT,
} from "@/styles/theme";
import AddIcon from "@mui/icons-material/Add";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CheckIcon from "@mui/icons-material/Check";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PeopleIcon from "@mui/icons-material/People";
import TimerIcon from "@mui/icons-material/Timer";
import StarIcon from "@mui/icons-material/Star";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  TextareaAutosize,
  Tooltip,
  Typography,
} from "@mui/material";
import { LibraryGame } from "@pages/api/games/library";
import { UserGameRatings, UserGames } from "@prisma/client";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth";
import React from "react";

interface PlaySession {
  id: number;
  playedAt: string;
  durationMin: number | null;
  notes: string | null;
  won: boolean | null;
  roomName: string | null;
  roomCode: string | null;
}

interface FriendEntry {
  id: number;
  username: string;
  image: string | null;
}

interface FriendActivity {
  owns: FriendEntry[];
  wantToPlay: FriendEntry[];
  favorited: FriendEntry[];
}

interface GameDetail extends LibraryGame {
  userGame: Pick<UserGames, "notes" | "weight" | "isWishlist" | "isFavorite"> | null;
  userRating: Pick<UserGameRatings, "stars" | "review"> | null;
  playSessions: PlaySession[];
}

interface Props {
  game: GameDetail;
  isSelf: boolean;
  isInLibrary: boolean;
  friendActivity: FriendActivity;
}

function formatPlaytime(min: number, max: number) {
  if (min === max) return `${min} min`;
  return `${min}–${max} min`;
}
function complexityLabel(c: number) {
  if (c < 1.5) return "Light";
  if (c < 2.5) return "Medium-Light";
  if (c < 3.5) return "Medium";
  if (c < 4.2) return "Medium-Heavy";
  return "Heavy";
}

function complexityColor(c: number) {
  if (c < 1.5) return "secondary.light";
  if (c < 2.5) return "#8dd47a";
  if (c < 3.5) return "#c8962a";
  if (c < 4.2) return "#e0823a";
  return "#e05c5c";
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontFamily: FONT_SANS,
        fontSize: "11px",
        fontWeight: 600,
        color: "primary.main",
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        mb: "16px",
      }}
    >
      {children}
    </Typography>
  );
}

function Card({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
  return (
    <Box
      sx={{
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px",
        padding: "24px",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export default function GameDetailPage({ game, isSelf, isInLibrary, friendActivity }: Props) {
  const router = useRouter();

  const [inLibrary, setInLibrary] = React.useState(isInLibrary);
  const [isFavorite, setIsFavorite] = React.useState(game.userGame?.isFavorite ?? false);
  const [isWantToPlay, setIsWantToPlay] = React.useState(game.userGame?.isWishlist ?? false);
  const [libraryLoading, setLibraryLoading] = React.useState(false);

  const [notes, setNotes] = React.useState(game.userGame?.notes ?? "");
  const [notesSaved, setNotesSaved] = React.useState(false);
  const [notesLoading, setNotesLoading] = React.useState(false);
  const notesTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const [stars, setStars] = React.useState(game.userRating?.stars ?? 0);
  const [review, setReview] = React.useState(game.userRating?.review ?? "");
  const [ratingLoading, setRatingLoading] = React.useState(false);
  const [ratingSaved, setRatingSaved] = React.useState(false);

  const hasFriendActivity =
    friendActivity.owns.length > 0 ||
    friendActivity.wantToPlay.length > 0 ||
    friendActivity.favorited.length > 0;

  async function handleAddToLibrary() {
    setLibraryLoading(true);
    try {
      await fetch("/api/games/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game.gameId }),
      });
      setInLibrary(true);
      setIsWantToPlay(false);
    } finally {
      setLibraryLoading(false);
    }
  }

  async function handleToggleFavorite() {
    const next = !isFavorite;
    setIsFavorite(next);
    await fetch(`/api/games/${game.gameId}/favorite`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: next }),
    });
  }

  async function handleToggleWantToPlay() {
    const next = !isWantToPlay;
    setIsWantToPlay(next);
    await fetch(`/api/games/${game.gameId}/wishlist`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isWishlist: next }),
    });
  }

  function handleNotesChange(value: string) {
    setNotes(value);
    setNotesSaved(false);
    if (notesTimeout.current) clearTimeout(notesTimeout.current);
    notesTimeout.current = setTimeout(async () => {
      setNotesLoading(true);
      await fetch(`/api/games/${game.gameId}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: value }),
      });
      setNotesLoading(false);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    }, 800);
  }

  async function handleSaveRating() {
    setRatingLoading(true);
    try {
      await fetch(`/api/games/${game.gameId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars, review }),
      });
      setRatingSaved(true);
      setTimeout(() => setRatingSaved(false), 2000);
    } finally {
      setRatingLoading(false);
    }
  }

  const hasDescription = !!game.description;
  const hasSessions = game.playSessions.length > 0;
  const hasCategories = game.categories.length > 0;
  const hasMechanics = game.mechanics.length > 0;

  return (
    <>
      <Head>
        <title>{game.name} — Tablekeeper</title>
      </Head>

      <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "60vh",
            background:
              "radial-gradient(ellipse 60% 50% at 50% -5%, rgba(34,85,48,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: "1100px",
            margin: "0 auto",
            padding: { xs: "24px 16px", md: "40px 32px" },
          }}
        >
          <Typography
            onClick={() => router.back()}
            sx={{
              fontFamily: FONT_SANS,
              fontSize: "12px",
              fontWeight: 500,
              color: TEXT_FAINT,
              letterSpacing: "1px",
              textTransform: "uppercase",
              mb: "28px",
              cursor: "pointer",
              "&:hover": { color: TEXT_DIM },
              display: "inline-block",
            }}
          >
            ← Back
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: { xs: "20px", md: "40px" },
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "flex-start" },
              mb: "40px",
            }}
          >
            <Box
              sx={{
                flexShrink: 0,
                width: { xs: "160px", md: "200px" },
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <GameArt game={game} size={200} />
            </Box>

            <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
              {game.yearPublished && (
                <Typography
                  sx={{
                    fontFamily: FONT_SANS,
                    fontSize: "12px",
                    color: "primary.main",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    mb: "8px",
                    fontWeight: 600,
                  }}
                >
                  {game.yearPublished}
                </Typography>
              )}

              <Typography
                sx={{
                  fontFamily: FONT_SERIF,
                  fontSize: { xs: "28px", md: "42px" },
                  fontWeight: 900,
                  color: "text.primary",
                  lineHeight: 1.1,
                  letterSpacing: "-0.5px",
                  mb: "8px",
                }}
              >
                {game.name}
              </Typography>

              {game.designers.length > 0 && (
                <Typography
                  sx={{ fontFamily: FONT_SANS, fontSize: "14px", color: TEXT_DIM, mb: "20px" }}
                >
                  by {game.designers.slice(0, 3).join(", ")}
                </Typography>
              )}

              <Box
                sx={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  justifyContent: { xs: "center", sm: "flex-start" },
                  mb: "20px",
                }}
              >
                <StatPill
                  icon={<PeopleIcon />}
                  label={
                    game.minPlayers === game.maxPlayers
                      ? `${game.minPlayers} players`
                      : `${game.minPlayers}–${game.maxPlayers} players`
                  }
                />
                <StatPill
                  icon={<TimerIcon />}
                  label={formatPlaytime(game.minPlaytime, game.maxPlaytime)}
                />
                {game.complexity != null && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "20px",
                      padding: "6px 14px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: FONT_SANS,
                        fontSize: "13px",
                        color: complexityColor(game.complexity),
                        fontWeight: 600,
                      }}
                    >
                      {game.complexity.toFixed(1)}
                    </Typography>
                    <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_DIM }}>
                      {complexityLabel(game.complexity)}
                    </Typography>
                  </Box>
                )}
                {game.bggRating != null && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "20px",
                      padding: "6px 14px",
                    }}
                  >
                    <StarIcon sx={{ color: "primary.main", fontSize: "15px" }} />
                    <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_DIM }}>
                      {game.bggRating.toFixed(1)} BGG
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  justifyContent: { xs: "center", sm: "flex-start" },
                }}
              >
                {!inLibrary ? (
                  <Button
                    onClick={handleAddToLibrary}
                    disabled={libraryLoading}
                    startIcon={libraryLoading ? <CircularProgress size={14} /> : <AddIcon />}
                    sx={{
                      backgroundColor: "primary.main",
                      borderRadius: "8px",
                      color: "background.default",
                      fontFamily: FONT_SANS,
                      fontSize: "14px",
                      fontWeight: 600,
                      padding: "9px 20px",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "primary.light" },
                    }}
                  >
                    Add to Library
                  </Button>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: BG_GREEN,
                      border: `1px solid ${BORDER_GREEN}`,
                      borderRadius: "8px",
                      padding: "9px 16px",
                    }}
                  >
                    <CheckIcon sx={{ color: "secondary.light", fontSize: "16px" }} />
                    <Typography
                      sx={{
                        fontFamily: FONT_SANS,
                        fontSize: "14px",
                        color: "secondary.light",
                        fontWeight: 500,
                      }}
                    >
                      In Library
                    </Typography>
                  </Box>
                )}

                {isSelf && (
                  <Tooltip title={isFavorite ? "Remove from favorites" : "Mark as favorite"}>
                    <IconButton
                      onClick={handleToggleFavorite}
                      sx={{
                        border: `1px solid ${isFavorite ? "rgba(224,92,92,0.4)" : "divider"}`,
                        borderRadius: "8px",
                        color: isFavorite ? RED : TEXT_FAINT,
                        padding: "9px",
                        transition: "all 0.2s",
                        "&:hover": {
                          color: RED,
                          borderColor: "rgba(224,92,92,0.4)",
                          background: "rgba(224,92,92,0.08)",
                        },
                      }}
                    >
                      {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                  </Tooltip>
                )}

                {isSelf && !inLibrary && (
                  <Tooltip
                    title={isWantToPlay ? "Remove from Want to Play" : "Mark as Want to Play"}
                  >
                    <IconButton
                      onClick={handleToggleWantToPlay}
                      sx={{
                        border: `1px solid ${isWantToPlay ? BORDER_BLUE : "divider"}`,
                        borderRadius: "8px",
                        color: isWantToPlay ? BLUE : TEXT_FAINT,
                        padding: "9px",
                        transition: "all 0.2s",
                        "&:hover": { color: BLUE, borderColor: BORDER_BLUE, background: BG_BLUE },
                      }}
                    >
                      {isWantToPlay ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                  </Tooltip>
                )}

                {game.bggId && (
                  <Tooltip title="View on BoardGameGeek">
                    <IconButton
                      component="a"
                      href={`https://boardgamegeek.com/boardgame/${game.bggId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "8px",
                        color: TEXT_FAINT,
                        padding: "9px",
                        "&:hover": { color: TEXT_DIM, borderColor: BORDER_AMBER },
                      }}
                    >
                      <OpenInNewIcon sx={{ fontSize: "18px" }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 340px" },
              gap: "20px",
              alignItems: "start",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {hasDescription && (
                <Card>
                  <SectionHeading>About</SectionHeading>
                  <Typography
                    sx={{
                      fontFamily: FONT_SANS,
                      fontSize: "14px",
                      color: TEXT_DIM,
                      lineHeight: 1.75,
                    }}
                    dangerouslySetInnerHTML={{ __html: game.description!.replace(/<[^>]+>/g, "") }}
                  />
                </Card>
              )}

              {(hasCategories || hasMechanics) && (
                <Card>
                  {hasCategories && (
                    <>
                      <SectionHeading>Categories</SectionHeading>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          mb: hasMechanics ? "20px" : 0,
                        }}
                      >
                        {game.categories.map((c) => (
                          <Chip
                            key={c}
                            label={c}
                            size="small"
                            sx={{
                              fontFamily: FONT_SANS,
                              fontSize: "12px",
                              background: AMBER_DIM,
                              color: "primary.main",
                              border: `1px solid rgba(200,150,42,0.25)`,
                              borderRadius: "6px",
                              height: "26px",
                            }}
                          />
                        ))}
                      </Box>
                    </>
                  )}
                  {hasCategories && hasMechanics && (
                    <Divider sx={{ borderColor: "divider", mb: "20px" }} />
                  )}
                  {hasMechanics && (
                    <>
                      <SectionHeading>Mechanics</SectionHeading>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {game.mechanics.map((m) => (
                          <Chip
                            key={m}
                            label={m}
                            size="small"
                            sx={{
                              fontFamily: FONT_SANS,
                              fontSize: "12px",
                              background: "rgba(255,255,255,0.04)",
                              color: TEXT_DIM,
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: "6px",
                              height: "26px",
                            }}
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </Card>
              )}

              <Card>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: "16px",
                  }}
                >
                  <SectionHeading>Play History</SectionHeading>
                  {hasSessions && (
                    <Typography
                      sx={{
                        fontFamily: FONT_SANS,
                        fontSize: "12px",
                        color: TEXT_FAINT,
                        mb: "16px",
                      }}
                    >
                      {game.playSessions.length} session{game.playSessions.length !== 1 ? "s" : ""}
                    </Typography>
                  )}
                </Box>
                {!hasSessions ? (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: "32px",
                      border: "1px dashed divider",
                      borderRadius: "8px",
                    }}
                  >
                    <Typography
                      sx={{ fontFamily: FONT_SERIF, fontSize: "16px", color: TEXT_FAINT }}
                    >
                      No plays logged yet
                    </Typography>
                    <Typography
                      sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_FAINT, mt: "4px" }}
                    >
                      Log a game night to track your history
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {game.playSessions.map((s) => (
                      <GameDetailPlayHistory key={s.id} session={s} />
                    ))}
                  </Box>
                )}
              </Card>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {hasFriendActivity && (
                <Card>
                  <SectionHeading>Friends</SectionHeading>
                  <GameDetailFriendActivity
                    label={{ singular: "owns this", plural: "own this" }}
                    friends={friendActivity.owns}
                    accentColor={"secondary.light"}
                    onNavigate={(username) => router.push(`/players/${username}`)}
                  />

                  <GameDetailFriendActivity
                    label={{ singular: "wants to play this", plural: "want to play this" }}
                    friends={friendActivity.wantToPlay}
                    accentColor={BLUE}
                    onNavigate={(username) => router.push(`/players/${username}`)}
                  />

                  <GameDetailFriendActivity
                    label={{
                      singular: "has this as a favorite",
                      plural: "have this as a favorite",
                    }}
                    friends={friendActivity.favorited}
                    accentColor={RED}
                    onNavigate={(username) => router.push(`/players/${username}`)}
                  />
                </Card>
              )}

              {isSelf && inLibrary && (
                <Card>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: "12px",
                    }}
                  >
                    <SectionHeading>My Notes</SectionHeading>
                    <Typography
                      sx={{
                        fontFamily: FONT_SANS,
                        fontSize: "11px",
                        color: notesSaved ? "primary.light" : TEXT_FAINT,
                        transition: "color 0.3s",
                      }}
                    >
                      {notesLoading ? "Saving…" : notesSaved ? "Saved" : "Auto-saves"}
                    </Typography>
                  </Box>
                  <TextareaAutosize
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="House rules, who taught you this game, favorite moments…"
                    minRows={4}
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "8px",
                      color: "text.primary",
                      fontFamily: FONT_SANS,
                      fontSize: "13px",
                      lineHeight: 1.65,
                      padding: "12px",
                      resize: "vertical",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </Card>
              )}

              {isSelf && inLibrary && (
                <Card>
                  <SectionHeading>My Rating</SectionHeading>
                  <Box sx={{ mb: "16px" }}>
                    <StarRating value={stars} onChange={setStars} />
                    {stars > 0 && (
                      <Typography
                        sx={{
                          fontFamily: FONT_SANS,
                          fontSize: "12px",
                          color: TEXT_FAINT,
                          mt: "6px",
                        }}
                      >
                        {
                          [
                            "",
                            "Not for me",
                            "It's okay",
                            "I like it",
                            "Really good",
                            "All-time favourite",
                          ][stars]
                        }
                      </Typography>
                    )}
                  </Box>
                  <TextareaAutosize
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Write a short review…"
                    minRows={3}
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "8px",
                      color: "text.primary",
                      fontFamily: FONT_SANS,
                      fontSize: "13px",
                      lineHeight: 1.65,
                      padding: "12px",
                      resize: "vertical",
                      outline: "none",
                      boxSizing: "border-box",
                      marginBottom: "12px",
                    }}
                  />
                  <Button
                    onClick={handleSaveRating}
                    disabled={ratingLoading || stars === 0}
                    fullWidth
                    sx={{
                      background: stars > 0 ? "primary.main" : "rgba(255,255,255,0.04)",
                      borderRadius: "8px",
                      color: stars > 0 ? "primary.contrastText" : TEXT_FAINT,
                      fontFamily: FONT_SANS,
                      fontSize: "14px",
                      fontWeight: 600,
                      padding: "10px",
                      textTransform: "none",
                      transition: "all 0.2s",
                      "&:hover": {
                        background: stars > 0 ? "primary.light" : "rgba(255,255,255,0.07)",
                      },
                    }}
                  >
                    {ratingLoading ? (
                      <CircularProgress size={16} />
                    ) : ratingSaved ? (
                      "Saved ✓"
                    ) : (
                      "Save Rating"
                    )}
                  </Button>
                </Card>
              )}

              {game.publishers.length > 0 && (
                <Card>
                  <SectionHeading>Publishers</SectionHeading>
                  {game.publishers.slice(0, 5).map((p) => (
                    <Typography
                      key={p}
                      sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: TEXT_DIM, mb: "4px" }}
                    >
                      {p}
                    </Typography>
                  ))}
                </Card>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { gameId } = context.params as { gameId: string };
  const session = await getServerSession(context.req, context.res, authOptions);
  const currentUserId = session ? parseInt((session.user as any).id) : null;

  const { default: prisma } = await import("@data/db");

  const id = parseInt(gameId);
  if (isNaN(id)) return { notFound: true };

  const game = await prisma.games.findUnique({
    where: { id },
    include: {
      users: currentUserId
        ? {
            where: { userId: currentUserId },
            select: { id: true, notes: true, weight: true, isWishlist: true, isFavorite: true },
          }
        : false,
      ratings: currentUserId
        ? { where: { userId: currentUserId }, select: { stars: true, review: true } }
        : false,
    },
  });

  if (!game) return { notFound: true };

  const rawSessions = currentUserId
    ? await prisma.gameSessionGames.findMany({
        where: { gameId: id },
        include: {
          gameSession: {
            include: {
              players: { where: { userId: currentUserId } },
              roomSession: {
                include: {
                  room: { select: { name: true, code: true } },
                },
              },
            },
          },
        },
        orderBy: { gameSession: { playedAt: "desc" } },
      })
    : [];

  const playSessions = rawSessions
    .filter((s) => s.gameSession.players.length > 0)
    .map((s) => ({
      id: s.gameSession.id,
      playedAt: s.gameSession.playedAt.toISOString(),
      durationMin: s.gameSession.durationMin,
      notes: s.gameSession.notes,
      won: s.gameSession.players[0]?.won ?? null,
      roomName: s.gameSession.roomSession?.room?.name ?? null,
      roomCode: s.gameSession.roomSession?.room?.code ?? null,
    }));

  const friendActivity: FriendActivity = { owns: [], wantToPlay: [], favorited: [] };

  if (currentUserId) {
    const friendGames = await prisma.userGames.findMany({
      where: {
        gameId: id,
        user: {
          followedBy: { some: { userId: currentUserId } },
        },
      },
      select: {
        isWishlist: true,
        isFavorite: true,
        user: { select: { id: true, username: true, image: true } },
      },
    });

    for (const fg of friendGames) {
      const entry: FriendEntry = {
        id: fg.user.id,
        username: fg.user.username,
        image: fg.user.image,
      };
      if (!fg.isWishlist) friendActivity.owns.push(entry);
      if (fg.isWishlist) friendActivity.wantToPlay.push(entry);
      if (fg.isFavorite) friendActivity.favorited.push(entry);
    }
  }

  const userGame = currentUserId ? (game.users?.[0] ?? null) : null;
  const userRating = currentUserId ? (game.ratings?.[0] ?? null) : null;
  const isInLibrary = !!userGame && !userGame.isWishlist;

  return {
    props: {
      isSelf: !!currentUserId,
      isInLibrary,
      friendActivity,
      game: {
        userGameId: userGame?.id ?? 0,
        gameId: game.id,
        addedAt: game.addedAt.toISOString(),
        weight: userGame?.weight ?? 1,
        notes: userGame?.notes ?? null,
        isWishlist: userGame?.isWishlist ?? false,
        isFavorite: userGame?.isFavorite ?? false,
        bggId: game.bggId,
        name: game.name,
        description: game.description,
        imageUrl: game.imageUrl,
        minPlayers: game.minPlayers,
        maxPlayers: game.maxPlayers,
        minPlaytime: game.minPlaytime,
        maxPlaytime: game.maxPlaytime,
        complexity: game.complexity,
        bggRating: game.bggRating,
        categories: game.categories,
        yearPublished: game.yearPublished,
        mechanics: game.mechanics,
        designers: game.designers,
        publishers: game.publishers,
        userStars: userRating?.stars ?? null,
        userGame,
        userRating,
        playSessions,
      },
    },
  };
};
