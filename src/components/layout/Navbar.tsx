import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

function getPages(session: any) {
  if (session) {
    return [
      {
        id: 1,
        title: session.user.username,
        link: `/users/${session.user.username}`,
      },
      { id: 2, title: "TableGen", link: "/tablegen" },
      { id: 3, title: "Users", link: "/users" },
      { id: 4, title: "Logout", link: "/api/auth/signout" },
    ];
  } else {
    return [
      { id: 1, title: "Login", link: "/login" },
      { id: 2, title: "Create Account", link: "/register" },
      { id: 3, title: "TableGen", link: "/tablegen" },
      { id: 4, title: "Users", link: "/users" },
    ];
  }
}

function Navbar() {
  const theme = useTheme();
  const { data: session, status } = useSession();
  const pages = getPages(session);

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  if (status === "loading") {
    return null;
  }

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: theme.palette.primary.main,
        height: { xs: "9vh", md: "8vh" },
        width: "100vw",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              aria-controls="menu-appbar"
              aria-haspopup="true"
              aria-label="account of current user"
              color="inherit"
              size="large"
              onClick={handleOpenNavMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              keepMounted
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              id="menu-appbar"
              open={Boolean(anchorElNav)}
              sx={{
                display: { xs: "block", md: "none" },
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              onClose={handleCloseNavMenu}
            >
              {pages.map((page) => (
                <MenuItem key={page.id} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">
                    <Link href={page.link}>{page.title}</Link>
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box sx={{ display: "flex", flexGrow: 1, mr: 2 }}>
            <Link href="/">
              <Image alt="Tablekeeper" height={100} src="/images/logo.svg" width={100} />
            </Link>
          </Box>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexGrow: 1,
            }}
          >
            {pages.map((page) => (
              <Button key={page.id} onClick={handleCloseNavMenu}>
                <Link
                  href={page.link}
                  style={{ color: theme.palette.secondary.main, textDecoration: "none" }}
                >
                  {page.title}
                </Link>
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;
