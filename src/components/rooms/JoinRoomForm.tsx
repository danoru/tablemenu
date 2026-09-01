import { BRICK, FONT_SANS } from "@/styles/theme";
import { Box, Button, OutlinedInput, Typography } from "@mui/material";
import { useRouter } from "next/router";
import React from "react";

/**
 * Code entry for a signed-in player. The landing page has its own copy of this
 * funnel, but signed-in visitors are redirected straight to /dashboard and so
 * never see it — without this they have no way to act on a code a host sent
 * them.
 */
export default function JoinRoomForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/rooms/${trimmed}/join`, { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // The room page renders the roster for members and a "request sent"
        // preview for anyone still waiting on an invite-only host.
        router.push(`/rooms/${trimmed}`);
        return;
      }

      setError(
        res.status === 404
          ? "No table with that code. Check it and try again."
          : (data.error ?? "Couldn't join that table. Try again.")
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}
      >
        <OutlinedInput
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
          }}
          placeholder="ENTER CODE"
          inputProps={{ maxLength: 6, "aria-label": "Room code" }}
          error={!!error}
          sx={{
            fontFamily: FONT_SANS,
            fontSize: "15px",
            fontWeight: 700,
            letterSpacing: "3px",
            width: compact ? "150px" : "170px",
            "& input": { textAlign: "center", padding: "10px 12px" },
            "& input::placeholder": { letterSpacing: "1px", fontSize: "13px" },
            "&.Mui-error .MuiOutlinedInput-notchedOutline": { borderColor: "error.main" },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !code.trim()}
          sx={{ fontSize: "14px", padding: "10px 20px", whiteSpace: "nowrap" }}
        >
          {loading ? "Joining…" : "Join table"}
        </Button>
      </Box>

      {error && (
        <Typography sx={{ fontFamily: FONT_SANS, fontSize: "13px", color: BRICK, mt: "8px" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
