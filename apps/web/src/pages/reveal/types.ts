export type RevealType =
  | "findHeart"
  | "bringTogether"
  | "scratchCard"
  | "breakHeart";

export interface RevealMechanismProps {
  onUnlock: () => void;
  config?: RevealConfig;
}

export type RevealConfig = FindHeartConfig | BringTogetherConfig;

export interface FindHeartConfig {
  id: "findHeart";
  count: number; // Number of hearts to show
}

export interface BringTogetherConfig {
  id: "bringTogether";
  snapDistance: number; // Distance threshold for snapping together
}
