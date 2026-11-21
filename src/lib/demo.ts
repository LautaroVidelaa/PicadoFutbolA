// Datos de ejemplo para la versión conceptual. Se reemplazan por datos reales de la base
// cuando existan las funciones de crear partidos y equipos.

export type TeamColor = "team1" | "team2" | "team3";

export type MatchSide = { name: string; color: TeamColor };
export type Convocado = {
  name: string;
  state: "confirmado" | "pendiente";
  hasAccount: boolean;
  position: string;
};

export type DemoMatch = {
  id: string;
  status: "proximo" | "jugado";
  title: string;
  date: string;
  time: string;
  venue: string;
  format: string;
  home: MatchSide;
  away: MatchSide;
  score?: [number, number];
  confirmed: number;
  needed: number;
  mine?: { goals: number; assists: number; rating: number; mvp: boolean };
};

const A: MatchSide = { name: "Los Pibes del Parque", color: "team1" };

export const MATCHES: DemoMatch[] = [
  {
    id: "sabado-20hs",
    status: "proximo",
    title: "Sábado de picado",
    date: "Sáb 14 nov",
    time: "20:00",
    venue: "Cancha El Potrero, Palermo",
    format: "Fútbol 5",
    home: A,
    away: { name: "Viernes FC", color: "team2" },
    confirmed: 8,
    needed: 10,
  },
  {
    id: "oficina-martes",
    status: "proximo",
    title: "Revancha de oficina",
    date: "Mar 17 nov",
    time: "19:30",
    venue: "Complejo La Boca",
    format: "Fútbol 7",
    home: { name: "Oficina United", color: "team3" },
    away: { name: "Los Pibes del Parque", color: "team1" },
    confirmed: 6,
    needed: 14,
  },
  {
    id: "h1",
    status: "jugado",
    title: "Final del torneo relámpago",
    date: "Dom 8 nov",
    time: "18:00",
    venue: "Cancha El Potrero, Palermo",
    format: "Fútbol 5",
    home: A,
    away: { name: "Viernes FC", color: "team2" },
    score: [4, 2],
    confirmed: 10,
    needed: 10,
    mine: { goals: 2, assists: 1, rating: 8.4, mvp: true },
  },
  {
    id: "h2",
    status: "jugado",
    title: "Picado del miércoles",
    date: "Mié 4 nov",
    time: "21:00",
    venue: "Complejo La Boca",
    format: "Fútbol 7",
    home: { name: "Oficina United", color: "team3" },
    away: A,
    score: [3, 3],
    confirmed: 14,
    needed: 14,
    mine: { goals: 1, assists: 0, rating: 7.1, mvp: false },
  },
  {
    id: "h3",
    status: "jugado",
    title: "Sábado de picado",
    date: "Sáb 31 oct",
    time: "20:00",
    venue: "Cancha El Potrero, Palermo",
    format: "Fútbol 5",
    home: A,
    away: { name: "Viernes FC", color: "team2" },
    score: [1, 2],
    confirmed: 10,
    needed: 10,
    mine: { goals: 0, assists: 1, rating: 6.4, mvp: false },
  },
  {
    id: "h4",
    status: "jugado",
    title: "Amistoso con el barrio",
    date: "Dom 25 oct",
    time: "17:00",
    venue: "Club Atlético Chacarita",
    format: "Fútbol 11",
    home: { name: "Barrio Norte", color: "team2" },
    away: A,
    score: [0, 2],
    confirmed: 22,
    needed: 22,
    mine: { goals: 1, assists: 1, rating: 7.8, mvp: false },
  },
];

export const CONVOCATORIA: Convocado[] = [
  { name: "Nico", state: "confirmado", hasAccount: true, position: "MED" },
  { name: "Mati", state: "confirmado", hasAccount: true, position: "DEL" },
  { name: "Fede", state: "confirmado", hasAccount: true, position: "DEF" },
  { name: "Juan", state: "confirmado", hasAccount: false, position: "ARQ" },
  { name: "Tomi", state: "confirmado", hasAccount: true, position: "MED" },
  { name: "Santi", state: "confirmado", hasAccount: false, position: "DEF" },
  { name: "Facu", state: "confirmado", hasAccount: true, position: "DEL" },
  { name: "Joaco", state: "confirmado", hasAccount: true, position: "MED" },
  { name: "Agus", state: "pendiente", hasAccount: false, position: "DEF" },
  { name: "Lucho", state: "pendiente", hasAccount: true, position: "DEL" },
];

export type FormationPlayer = { n: number; name: string; x: number; y: number; gk?: boolean };

// Posiciones sobre la cancha completa (x: 0 a 1 de izquierda a derecha, y: 0 a 1 de arriba a abajo)
export const FORMATION_HOME: FormationPlayer[] = [
  { n: 1, name: "Juan", x: 0.07, y: 0.5, gk: true },
  { n: 4, name: "Fede", x: 0.24, y: 0.5 },
  { n: 8, name: "Nico", x: 0.38, y: 0.26 },
  { n: 10, name: "Mati", x: 0.38, y: 0.74 },
  { n: 9, name: "Vos", x: 0.41, y: 0.5 },
];
export const FORMATION_AWAY: FormationPlayer[] = [
  { n: 1, name: "Gus", x: 0.93, y: 0.5, gk: true },
  { n: 5, name: "Pablo", x: 0.76, y: 0.5 },
  { n: 7, name: "Leo", x: 0.62, y: 0.26 },
  { n: 11, name: "Rama", x: 0.62, y: 0.74 },
  { n: 9, name: "Ivo", x: 0.59, y: 0.5 },
];

export type TeamInfo = {
  name: string;
  color: TeamColor;
  format: string;
  role: string;
  players: number;
  record: [number, number, number];
  last: ("G" | "E" | "P")[];
  /** Tus números en este equipo */
  mine: { pj: number; goals: number; assists: number };
};

export const TEAMS: TeamInfo[] = [
  { name: "Los Pibes del Parque", color: "team1", format: "Fútbol 5", role: "Capitán", players: 12, record: [7, 2, 3], last: ["G", "E", "P", "G", "G"], mine: { pj: 12, goals: 9, assists: 6 } },
  { name: "Oficina United", color: "team3", format: "Fútbol 7", role: "Jugador", players: 16, record: [4, 3, 4], last: ["E", "P", "P", "G", "E"], mine: { pj: 11, goals: 5, assists: 3 } },
  { name: "Barrio Norte", color: "team2", format: "Fútbol 11", role: "Invitado", players: 22, record: [3, 1, 1], last: ["G", "G", "P", "E", "G"], mine: { pj: 5, goals: 3, assists: 2 } },
];

// Evolución del rating (0 a 100) por partido, del más viejo al más nuevo
export const RATING_SERIES = [62, 64, 63, 67, 66, 70, 69, 72, 71, 75, 74, 78];

export const CAREER = {
  matches: 28,
  wins: 14,
  draws: 6,
  losses: 8,
  goals: 17,
  assists: 11,
  mvp: 4,
  rating: 78,
  ratingDelta: 3,
  avg: 7.8,
  avgDelta: 0.4,
  value: "1,2 M",
  teams: 3,
};

export const VALORACIONES = {
  total: 36,
  avg: 7.8,
  items: [
    { label: "Compañerismo", value: 9.1 },
    { label: "Juego limpio", value: 9.4 },
    { label: "Actitud", value: 8.6 },
    { label: "Puntualidad", value: 7.2 },
    { label: "Técnica", value: 7.0 },
  ],
};

export const ACHIEVEMENTS = [
  { title: "Todoterreno", text: "Jugaste en 3 equipos distintos", done: true },
  { title: "Asistidor", text: "10 asistencias en total", done: true },
  { title: "Doblete", text: "2 goles en un mismo partido", done: true },
  { title: "Figura", text: "Elegido MVP 4 veces", done: true },
  { title: "Racha de 5", text: "5 partidos seguidos con gol", done: false },
  { title: "Hat-trick", text: "3 goles en un partido", done: false },
];

export type RankRow = { name: string; team: string; value: number; me?: boolean };
export const RANKINGS: Record<"goles" | "asistencias" | "mvp" | "rating", { label: string; unit: string; rows: RankRow[] }> = {
  goles: {
    label: "Goleadores",
    unit: "goles",
    rows: [
      { name: "Mati", team: "Los Pibes del Parque", value: 24 },
      { name: "Facu", team: "Viernes FC", value: 21 },
      { name: "Vos", team: "Los Pibes del Parque", value: 17, me: true },
      { name: "Ivo", team: "Barrio Norte", value: 15 },
      { name: "Leo", team: "Oficina United", value: 12 },
      { name: "Rama", team: "Viernes FC", value: 9 },
    ],
  },
  asistencias: {
    label: "Asistidores",
    unit: "asist.",
    rows: [
      { name: "Nico", team: "Los Pibes del Parque", value: 19 },
      { name: "Tomi", team: "Oficina United", value: 14 },
      { name: "Vos", team: "Los Pibes del Parque", value: 11, me: true },
      { name: "Joaco", team: "Viernes FC", value: 10 },
      { name: "Pablo", team: "Barrio Norte", value: 7 },
      { name: "Santi", team: "Oficina United", value: 5 },
    ],
  },
  mvp: {
    label: "Figuras",
    unit: "MVP",
    rows: [
      { name: "Nico", team: "Los Pibes del Parque", value: 7 },
      { name: "Mati", team: "Los Pibes del Parque", value: 6 },
      { name: "Facu", team: "Viernes FC", value: 5 },
      { name: "Vos", team: "Los Pibes del Parque", value: 4, me: true },
      { name: "Juan", team: "Oficina United", value: 3 },
      { name: "Fede", team: "Barrio Norte", value: 2 },
    ],
  },
  rating: {
    label: "Rating",
    unit: "pts",
    rows: [
      { name: "Nico", team: "Los Pibes del Parque", value: 81 },
      { name: "Facu", team: "Viernes FC", value: 79 },
      { name: "Vos", team: "Los Pibes del Parque", value: 78, me: true },
      { name: "Mati", team: "Los Pibes del Parque", value: 75 },
      { name: "Juan", team: "Oficina United", value: 72 },
      { name: "Fede", team: "Barrio Norte", value: 69 },
    ],
  },
};

export const MY_TEAM = "Los Pibes del Parque";

/** Resultado desde tu equipo: G ganado, E empatado, P perdido */
export function myOutcome(m: DemoMatch): "G" | "E" | "P" {
  const [h, a] = m.score ?? [0, 0];
  const diff = m.home.name === MY_TEAM ? h - a : a - h;
  return diff > 0 ? "G" : diff === 0 ? "E" : "P";
}
