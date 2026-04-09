import { FONT_SANS, FONT_SERIF, GOLD, GOLD_FADED, GOLD_LIGHT, TEXT_DIM } from "@/styles/theme";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, Button, Container, Divider, IconButton, Menu, MenuItem } from "@mui/material";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";

interface NavPage {
  id: number;
  title: string;
  link?: string;
  action?: () => void;
  variant?: "default" | "primary" | "muted";
}

function getPages(session: any, onSignOut: () => void): NavPage[] {
  if (session) {
    return [
      {
        id: 1,
        title: session.user?.username,
        link: `/players/${session.user?.username}`,
        variant: "muted",
      },
      { id: 2, title: "Games", link: "/games" },
      { id: 2, title: "Menu", link: "/menu" },
      { id: 3, title: "Players", link: "/players" },
      { id: 4, title: "Sign out", action: onSignOut, variant: "muted" },
    ];
  }

  return [
    { id: 1, title: "Menu", link: "/menu" },
    { id: 2, title: "Games", link: "/games" },
    { id: 3, title: "Players", link: "/players" },
    { id: 4, title: "Sign in", link: "/login", variant: "default" },
    { id: 5, title: "Create account", link: "/register", variant: "primary" },
  ];
}

export default function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

  function handleSignOut() {
    signOut({ callbackUrl: "/" });
  }

  const pages = getPages(session, handleSignOut);

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
    <Box
      component="nav"
      sx={{
        backgroundColor: "background.default",
        borderBottom: "1px solid",
        borderColor: "divider",
        position: "sticky",
        top: 0,
        zIndex: 100,
        width: "100%",
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: { xs: "60px", md: "64px" },
            gap: 2,
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Box
              sx={{
                position: "relative",
                width: 36,
                height: 36,
                mr: 1,
                flexShrink: 0,
              }}
            >
              <Image
                alt="Tablekeeper"
                src="/images/logo.svg"
                fill
                style={{ objectFit: "contain" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </Box>
            <Box
              sx={{
                fontFamily: FONT_SERIF,
                fontSize: "20px",
                fontWeight: 900,
                color: GOLD,
                letterSpacing: "-0.3px",
                lineHeight: 1,
              }}
            >
              Table
              <Box component="span" sx={{ color: GOLD_FADED, fontWeight: 700 }}>
                keeper
              </Box>
            </Box>
          </Link>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: "4px",
            }}
          >
            {pages.map((page) => {
              if (page.variant === "primary") {
                return (
                  <Button
                    key={page.id}
                    onClick={() => handlePageClick(page)}
                    sx={{
                      backgroundColor: "primary.main",
                      borderRadius: "6px",
                      color: "background.default",
                      fontFamily: FONT_SANS,
                      fontSize: "13px",
                      fontWeight: 500,
                      letterSpacing: "0.3px",
                      ml: "4px",
                      padding: "7px 18px",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "primary.light" },
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
                      borderRadius: "6px",
                      color: TEXT_DIM,
                      fontFamily: FONT_SANS,
                      fontSize: "13px",
                      fontWeight: 400,
                      padding: "7px 14px",
                      textTransform: "none",
                      "&:hover": {
                        background: "rgba(255,255,255,0.04)",
                        color: GOLD_LIGHT,
                      },
                    }}
                  >
                    {page.title}
                  </Button>
                );
              }

              return (
                <Button
                  key={page.id}
                  onClick={() => handlePageClick(page)}
                  sx={{
                    background: "transparent",
                    border: page.variant === "default" ? "1px solid rgba(180,140,60,0.3)" : "none",
                    borderRadius: "6px",
                    color: page.variant === "default" ? GOLD_LIGHT : TEXT_DIM,
                    fontFamily: FONT_SANS,
                    fontSize: "13px",
                    fontWeight: 500,
                    padding: "7px 16px",
                    textTransform: "none",
                    "&:hover": {
                      background:
                        page.variant === "default"
                          ? "rgba(180,140,60,0.1)"
                          : "rgba(255,255,255,0.04)",
                      borderColor: "rgba(180,140,60,0.5)",
                      color: GOLD_LIGHT,
                    },
                  }}
                >
                  {page.title}
                </Button>
              );
            })}
          </Box>

          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              aria-controls="mobile-nav-menu"
              aria-haspopup="true"
              aria-label="Open navigation menu"
              onClick={handleOpenNavMenu}
              sx={{
                color: GOLD_LIGHT,
                "&:hover": { background: "rgba(255,255,255,0.06)" },
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
                  backgroundColor: "#1a1610",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "10px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  minWidth: "200px",
                  mt: "8px",
                },
              }}
            >
              {pages.map((page, index) => {
                const isLast = index === pages.length - 1;
                const isPrimary = page.variant === "primary";

                return (
                  <Box key={page.id}>
                    {!session && index === 2 && (
                      <Divider sx={{ borderColor: "divider", my: "4px" }} />
                    )}
                    <MenuItem
                      onClick={() => handlePageClick(page)}
                      sx={{
                        fontFamily: FONT_SANS,
                        fontSize: "14px",
                        fontWeight: isPrimary ? 500 : 400,
                        color: isPrimary
                          ? "primary.main"
                          : page.variant === "muted"
                            ? TEXT_DIM
                            : GOLD_LIGHT,
                        padding: "10px 20px",
                        "&:hover": {
                          background: "rgba(180,140,60,0.08)",
                        },
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
