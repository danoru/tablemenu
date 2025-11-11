import {
  Alert,
  Box,
  Button,
  FormControl,
  Grid,
  OutlinedInput,
  Paper,
  Snackbar,
  Typography,
  useTheme,
} from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

function HomePage() {
  const theme = useTheme();
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<"success" | "error">("success");
  const [roomCode, setRoomCode] = React.useState("");

  const router = useRouter();

  function handleSnackbarClose() {
    setSnackbarOpen(false);
  }

  async function submitRoomCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isValid = roomCode === "ABCDE";

    if (isValid) {
      setSnackbarSeverity("success");
      setSnackbarMessage("Room found! Redirecting…");
      setSnackbarOpen(true);

      setTimeout(() => {
        router.push(`/room/${roomCode}`);
      }, 1000);
    } else {
      setSnackbarSeverity("error");
      setSnackbarMessage("Invalid room code. Please try again.");
      setSnackbarOpen(true);
    }
  }

  return (
    <>
      <Head>
        <title>Tablekeeper</title>
        <meta content="Find yourself a seat at the table!" name="description" />
      </Head>

      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
          minHeight: "100vh",
          padding: 2,
        }}
      >
        <Paper
          sx={{
            backgroundColor: theme.palette.primary.main,
            borderRadius: "12px",
            boxShadow: "5px 10px 18px #888888",
            color: theme.palette.common.white,
            maxWidth: 600,
            padding: 4,
            width: "100%",
          }}
        >
          <Grid container justifyContent="center" spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography color={theme.palette.secondary.main} textAlign="center" variant="h3">
                Welcome to Tablekeeper!
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography marginBottom={1}>
                Tablekeeper is a web application currently in development to manage your board game
                nights with efficiency and a bit of flair.
              </Typography>

              <Typography marginBottom={1}>
                If you are a <strong>first-time host</strong>, please create an account and start by
                creating your board game library.
              </Typography>

              <Typography marginBottom={1}>
                If you are a <strong>returning host</strong>, please log in to see your board game
                library.
              </Typography>

              <Typography marginBottom={1}>
                If you are a <strong>guest</strong>, please contact your host for your room code to
                enter below.
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box
                component="form"
                onSubmit={submitRoomCode}
                sx={{
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <FormControl fullWidth>
                  <OutlinedInput
                    id="roomCode"
                    name="roomCode"
                    onChange={(event) => setRoomCode(event.target.value)}
                    placeholder="Enter Room Code"
                    type="text"
                    value={roomCode}
                    sx={{
                      backgroundColor: theme.palette.common.white,
                      borderRadius: "6px",
                      color: theme.palette.common.black,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.common.black,
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.secondary.main,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.secondary.main,
                      },
                    }}
                  />
                </FormControl>

                <Button
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    border: `1px solid ${theme.palette.secondary.main}`,
                    borderRadius: "4px",
                    color: theme.palette.common.white,
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: 700,
                    padding: "14px 20px",
                  }}
                  type="submit"
                  variant="contained"
                >
                  Find Your Table
                </Button>
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }} textAlign="center">
              <Typography variant="caption">
                If you'd like to make use of the previous functionality, please visit the TableGen
                page.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Snackbar autoHideDuration={3000} onClose={handleSnackbarClose} open={snackbarOpen}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default HomePage;
