import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { setAttendanceAction } from "@/app/actions/matches";

// "Voy" / "No voy" del propio jugador
export default function AttendanceButtons({
  matchId,
  playerId,
  current,
}: {
  matchId: string;
  playerId: string;
  current: "PENDING" | "CONFIRMED" | "DECLINED";
}) {
  return (
    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
      <form action={setAttendanceAction.bind(null, matchId, playerId, "CONFIRMED")}>
        <Button type="submit" size="large" variant={current === "CONFIRMED" ? "contained" : "outlined"} color={current === "CONFIRMED" ? "primary" : "inherit"} aria-pressed={current === "CONFIRMED"}>
          Voy
        </Button>
      </form>
      <form action={setAttendanceAction.bind(null, matchId, playerId, "DECLINED")}>
        <Button type="submit" size="large" variant={current === "DECLINED" ? "contained" : "outlined"} color={current === "DECLINED" ? "primary" : "inherit"} aria-pressed={current === "DECLINED"}>
          No voy
        </Button>
      </form>
    </Box>
  );
}
