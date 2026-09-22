#!/usr/bin/env node
/**
 * Build static export and publish `out/` to Vercel temporary hosting.
 * Claim the printed URL once to keep it forever.
 */
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

console.log("Building static export…");
execSync("npm run build", { cwd: ROOT, stdio: "inherit" });

console.log("Deploying out/ to Vercel (temporary / claimable)…");
const raw = execSync("npx --yes vercel deploy --temporary --yes --json", {
  cwd: join(ROOT, "out"),
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
});

const lines = raw.trim().split("\n");
let json = null;
for (let i = lines.length - 1; i >= 0; i--) {
  try {
    json = JSON.parse(lines[i]);
    if (json?.deployment?.url) break;
  } catch {
    /* continue */
  }
}

if (!json?.deployment?.url) {
  writeFileSync(join(ROOT, "publish-result.json"), raw);
  console.error("Could not parse deploy result");
  process.exit(1);
}

const url = json.deployment.url.startsWith("http")
  ? json.deployment.url
  : `https://${json.deployment.url}`;
const claimUrl = json.deployment.claimUrl;
const expiresAt = json.deployment.expiresAt
  ? new Date(json.deployment.expiresAt).toISOString()
  : null;
const stableTunnel = "https://invitacion-joselyn-enrique.loca.lt";

const result = {
  url,
  claimUrl,
  expiresAt,
  stableTunnel,
  publishedAt: new Date().toISOString(),
};
writeFileSync(join(ROOT, "publish-result.json"), JSON.stringify(result, null, 2));

writeFileSync(
  join(ROOT, "PUBLIC_URL.md"),
  `# Link público

## Principal (subdominio fijo — se auto-recupera)

${stableTunnel}

Mantener vivo: \`npm run keep:public\`

## Vercel (permanente al reclamar una vez)

- Invitación: ${url}
- **Reclamar (1 clic):** ${claimUrl || "(ver publish-result.json)"}
${expiresAt ? `- Caduca sin reclamar: ${expiresAt}` : ""}

Tras reclamar, comparte solo el link \`.vercel.app\` — ya no depende de este servidor.
`,
);

console.log("\nStable tunnel:", stableTunnel);
console.log("Vercel URL:", url);
if (claimUrl) console.log("Claim forever:", claimUrl);
