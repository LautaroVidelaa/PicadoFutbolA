import { createTheme } from "@mui/material/styles";
import { palette as c } from "@/lib/palette";

const display = "var(--font-display), 'Arial Narrow', Impact, sans-serif";
const body = "var(--font-body), system-ui, -apple-system, 'Segoe UI', sans-serif";

const headingBase = {
  fontFamily: display,
  fontWeight: 800,
  lineHeight: 0.95,
  letterSpacing: "0.005em",
  textTransform: "uppercase",
} as const;

export const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: { main: c.brand, contrastText: c.brandText },
    secondary: { main: c.accent, contrastText: c.text },
    error: { main: c.badText },
    background: { default: c.page, paper: c.card },
    text: { primary: c.text, secondary: c.muted },
    divider: c.border,
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: body,
    h1: headingBase,
    h2: headingBase,
    h3: { ...headingBase, lineHeight: 1 },
    h4: { ...headingBase, lineHeight: 1 },
    h5: { ...headingBase, lineHeight: 1.05 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 999,
          whiteSpace: "nowrap",
          fontWeight: 700,
          letterSpacing: "0.005em",
          transition:
            "transform 120ms ease, box-shadow 120ms ease, background-color 160ms ease",
        },
        sizeLarge: { padding: "13px 28px", fontSize: "1.05rem" },
        outlined: { borderWidth: 1.5, "&:hover": { borderWidth: 1.5 } },
      },
      variants: [
        {
          props: { variant: "contained", color: "primary" },
          style: {
            boxShadow: "0 3px 0 0 rgba(14, 26, 58, 0.92)",
            "&:hover": {
              backgroundColor: c.brandHover,
              transform: "translateY(-1px)",
              boxShadow: "0 4px 0 0 rgba(14, 26, 58, 0.92)",
            },
            "&:active": {
              transform: "translateY(2px)",
              boxShadow: "0 1px 0 0 rgba(14, 26, 58, 0.92)",
            },
            "&.Mui-disabled": { boxShadow: "none" },
          },
        },
      ],
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: c.card,
          "& .MuiOutlinedInput-notchedOutline": {
            borderWidth: 1.5,
            borderColor: "color-mix(in srgb, var(--c-text) 28%, transparent)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: c.text },
          "&.Mui-focused": {
            boxShadow: "0 0 0 4px color-mix(in srgb, var(--c-accent) 40%, transparent)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderWidth: 2,
            borderColor: c.text,
          },
        },
      },
    },
    MuiLink: {
      defaultProps: { underline: "always" },
      styleOverrides: {
        root: {
          fontWeight: 700,
          textUnderlineOffset: "3px",
          textDecorationThickness: "1.5px",
        },
      },
    },
  },
});
