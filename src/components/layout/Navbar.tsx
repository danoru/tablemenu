import {
  BRICK,
  FONT_SANS,
  FONT_SERIF,
  INK,
  PLUM,
  SHADOW_HARD,
  SHADOW_HARD_HOVER,
  SURFACE,
  TEXT_DIM,
} from "@/styles/theme";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, Button, Container, Divider, IconButton, Menu, MenuItem } from "@mui/material";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";

interface NavPage {
  id: number;
  title: string;
  link?: string;
  action?: () => void;
  variant?: "tab" | "primary" | "muted";
}

function getPages(session: any, onSignOut: () => void): NavPage[] {
  if (session) {
    return [
      { id: 1, title: "Games", link: "/games", variant: "tab" },
      { id: 2, title: "Menu", link: "/menu", variant: "tab" },
      { id: 3, title: "Players", link: "/players", variant: "tab" },
      { id: 4, title: "Sign out", action: onSignOut, variant: "muted" },
    ];
  }

  return [
    { id: 1, title: "Menu", link: "/menu", variant: "tab" },
    { id: 2, title: "Games", link: "/games", variant: "tab" },
    { id: 3, title: "Players", link: "/players", variant: "tab" },
    { id: 4, title: "Sign in", link: "/login", variant: "muted" },
    { id: 5, title: "Create account", link: "/register", variant: "primary" },
  ];
}

const stickerSx = {
  backgroundColor: SURFACE,
  border: `2px solid ${INK}`,
  boxShadow: SHADOW_HARD,
  transition: "transform 0.12s ease, box-shadow 0.12s ease, background-color 0.12s ease",
};

const stickerHoverSx = {
  boxShadow: SHADOW_HARD_HOVER,
  transform: "translate(-2px, -2px)",
};

export default function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

  function handleSignOut() {
    signOut({ callbackUrl: "/" });
  }

  const pages = getPages(session, handleSignOut);
  const username: string | undefined = (session?.user as any)?.username;

  function isActive(link?: string) {
    if (!link) return false;
    return router.pathname === link || router.pathname.startsWith(`${link}/`);
  }

  function handleOpenNavMenu(event: React.MouseEvent<HTMLElement>) {
    setAnchorElNav(event.currentTarget);
  }

  function handleCloseNavMenu() {
    setAnchorElNav(null);
  }

  function handlePageClick(page: NavPage) {
    handleCloseNavMenu();
    if (page.action) {
      page.action();
    } else if (page.link) {
      router.push(page.link);
    }
  }

  if (status === "loading") return null;

  return (
    <Box component="nav" sx={{ width: "100%" }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: { xs: "72px", md: "84px" },
            gap: 2,
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <Box
              sx={{
                ...stickerSx,
                borderRadius: "10px",
                padding: "6px 14px",
                fontFamily: FONT_SERIF,
                fontStyle: "italic",
                fontSize: "20px",
                fontWeight: 900,
                color: INK,
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
                transform: "rotate(-1.5deg)",
                "&:hover": {
                  ...stickerHoverSx,
                  transform: "rotate(-1.5deg) translate(-2px, -2px)",
                },
              }}
            >
              Table
              <Box component="span" sx={{ color: BRICK }}>
                keeper
              </Box>
            </Box>
          </Link>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: "10px",
            }}
          >
            {pages.map((page) => {
              if (page.variant === "primary") {
                return (
                  <Button
                    key={page.id}
                    variant="contained"
                    onClick={() => handlePageClick(page)}
                    sx={{
                      fontSize: "14px",
                      ml: "4px",
                      padding: "7px 22px",
                    }}
                  >
                    {page.title}
                  </Button>
                );
              }

              if (page.variant === "muted") {
                return (
                  <Button
                    key={page.id}
                    onClick={() => handlePageClick(page)}
                    sx={{
                      background: "transparent",
                      borderRadius: "999px",
                      color: TEXT_DIM,
                      fontFamily: FONT_SANS,
                      fontSize: "14px",
                      fontWeight: 500,
                      padding: "7px 14px",
                      textTransform: "none",
                      "&:hover": {
                        background: "rgba(51,39,26,0.06)",
                        color: INK,
                      },
                    }}
                  >
                    {page.title}
                  </Button>
                );
              }

              const active = isActive(page.link);
              return (
                <Box
                  key={page.id}
                  component="button"
                  onClick={() => handlePageClick(page)}
                  sx={{
                    ...stickerSx,
                    backgroundColor: active ? BRICK : SURFACE,
                    borderRadius: "999px",
                    color: active ? SURFACE : INK,
                    cursor: "pointer",
                    fontFamily: FONT_SANS,
                    fontSize: "14px",
                    fontWeight: 700,
                    padding: "8px 22px",
                    "&:hover": stickerHoverSx,
                  }}
                >
                  {page.title}
                </Box>
              );
            })}

            {session && username && (
              <Link href={`/players/${username}`} style={{ textDecoration: "none" }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    ml: "6px",
                    borderRadius: "50%",
                    border: `2px solid ${INK}`,
                    backgroundColor: PLUM,
                    color: SURFACE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONT_SERIF,
                    fontSize: "17px",
                    fontWeight: 900,
                    transition: "transform 0.12s ease, box-shadow 0.12s ease",
                    "&:hover": {
                      boxShadow: SHADOW_HARD,
                      transform: "translate(-1px, -1px)",
                    },
                  }}
                >
                  {username.charAt(0).toUpperCase()}
                </Box>
              </Link>
            )}
          </Box>

          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              aria-controls="mobile-nav-menu"
              aria-haspopup="true"
              aria-label="Open navigation menu"
              onClick={handleOpenNavMenu}
              sx={{
                ...stickerSx,
                borderRadius: "10px",
                color: INK,
                "&:hover": { ...stickerHoverSx, backgroundColor: SURFACE },
              }}
            >
              <MenuIcon />
            </IconButton>

            <Menu
              keepMounted
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              id="mobile-nav-menu"
              open={Boolean(anchorElNav)}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              onClose={handleCloseNavMenu}
              sx={{
                "& .MuiPaper-root": {
                  minWidth: "200px",
                  mt: "10px",
                },
              }}
            >
              {session && username && (
                <MenuItem
                  onClick={() => {
                    handleCloseNavMenu();
                    router.push(`/players/${username}`);
                  }}
                  sx={{ fontWeight: 700, color: INK, padding: "10px 20px" }}
                >
                  {username}
                </MenuItem>
              )}
              {pages.map((page, index) => {
                const isPrimary = page.variant === "primary";

                return (
                  <Box key={page.id}>
                    {!session && index === 3 && <Divider sx={{ my: "4px" }} />}
                    <MenuItem
                      onClick={() => handlePageClick(page)}
                      sx={{
                        fontWeight: isPrimary ? 700 : 500,
                        color: isPrimary ? BRICK : undefined,
                        padding: "10px 20px",
                      }}
                    >
                      {page.title}
                    </MenuItem>
                  </Box>
                );
              })}
            </Menu>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
