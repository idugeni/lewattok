const ADJECTIVES = [
  "swift", "calm", "bold", "keen", "wise", "warm", "cool", "soft",
  "dark", "pure", "vast", "rare", "deep", "free", "fair", "glad",
];

const NOUNS = [
  "fox", "owl", "elm", "ark", "sun", "moon", "star", "wave",
  "pine", "rune", "flux", "echo", "hive", "core", "node", "zinc",
];

function getDomain(): string {
  return process.env.NEXT_PUBLIC_APP_DOMAIN ?? "mail.aurelion.dev";
}

export function generateRandomAddress(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  return `${adj}.${noun}${suffix}@${getDomain()}`;
}

export function extractLocalPart(email: string): string {
  return email.split("@")[0] ?? "";
}
