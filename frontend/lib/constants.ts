export const STORAGE_KEY = "aurelion_inbox";
export const TTL_MS = 15 * 60 * 1000;
export const TTL_SECONDS = TTL_MS / 1000;
export const MAX_MESSAGES = 50;

/** Custom username validation */
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/;

export const ADJECTIVES = [
  "swift", "calm", "bold", "keen", "wise", "warm", "cool", "soft",
  "dark", "pure", "vast", "rare", "deep", "free", "fair", "glad",
];

export const NOUNS = [
  "fox", "owl", "elm", "ark", "sun", "moon", "star", "wave",
  "pine", "rune", "flux", "echo", "hive", "core", "node", "zinc",
];
