import type { CSSProperties } from "react";
import type { Profile } from "./types";
import { readableOn } from "./utils";

/** Inline CSS variables for a profile. Light/dark palettes live in globals.css. */
export function profileThemeStyle(
  p: Pick<Profile, "primary_color" | "button_style" | "design_theme">
): CSSProperties {
  const radius =
    p.button_style === "pill" ? "999px" : p.button_style === "square" ? "8px" : "16px";
  const tile =
    p.button_style === "pill" ? "26px" : p.button_style === "square" ? "8px" : "18px";
  const themeAccents: Partial<Record<Profile["design_theme"], string>> = {
    "obsidian-gold": "#c9a646",
    "royal-prestige": "#b99aff",
    "ivory-minimal": "#9a7950",
    "emerald-luxe": "#45b58b",
    titanium: "#a9b7c8",
    "artisan-classic": "#8d4e2e",
  };
  const accent = p.design_theme === "classic" ? p.primary_color : (themeAccents[p.design_theme] ?? p.primary_color);
  return {
    "--accent": accent,
    "--on-accent": readableOn(accent),
    "--btn-r": radius,
    "--tile-r": tile,
  } as CSSProperties;
}

export const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "Match phone" },
] as const;

export const BACKGROUND_OPTIONS = [
  { value: "soft", label: "Soft tint" },
  { value: "gradient", label: "Gradient" },
  { value: "mesh", label: "Glow" },
  { value: "dots", label: "Dots" },
] as const;

export const BUTTON_OPTIONS = [
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
  { value: "square", label: "Square" },
] as const;

export const COLOR_PRESETS = [
  "#2347F0",
  "#0F766E",
  "#D6193A",
  "#E0A526",
  "#7C3AED",
  "#0B1220",
  "#EA580C",
  "#DB2777",
];

export const DESIGN_THEME_OPTIONS = [
  { value: "classic", label: "Classic" },
  { value: "obsidian-gold", label: "Obsidian Gold" },
  { value: "royal-prestige", label: "Royal Prestige" },
  { value: "ivory-minimal", label: "Ivory Minimal" },
  { value: "emerald-luxe", label: "Emerald Luxe" },
  { value: "titanium", label: "Titanium" },
  { value: "artisan-classic", label: "Artisan Classic" },
] as const;
