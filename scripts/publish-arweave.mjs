#!/usr/bin/env node
/**
 * Build + prepare + publish invitation permanently to Arweave (no claim/login).
 */
import { execSync } from "node:child_process";
import { createReadStream, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { Readable } from "node:stream";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROOT = process.cwd();

function walk(dir, acc = []) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.name === ".vercel" || name.name.endsWith(".map")) continue;
    if (name.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function contentType(file) {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".js") || file.includes(".js.part"))
    return "application/javascript; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".svg")) return "image/svg+xml";
  if (file.endsWith(".jpg") || file.endsWith(".jpeg")) return "image/jpeg";
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".webp")) return "image/webp";
  if (file.endsWith(".gif")) return "image/gif";
  if (file.endsWith(".ico")) return "image/x-icon";
  if (file.endsWith(".txt")) return "text/plain; charset=utf-8";
  if (file.endsWith(".woff2")) return "font/woff2";
  if (file.endsWith(".json")) return "application/json";
  return "application/octet-stream";
}

console.log("Building…");
execSync("npm run build", { cwd: ROOT, stdio: "inherit" });
console.log("Preparing for Arweave…");
execSync("node scripts/prepare-arweave.mjs", { cwd: ROOT, stdio: "inherit" });

const Arweave = require("arweave");
const { TurboFactory } = require("@ardrive/turbo-sdk");

const outDir = join(ROOT, "out");
const files = walk(outDir);
for (const f of files) {
  if (statSync(f).size > 100 * 1024) {
    throw new Error(`File too large: ${f}`);
  }
}

const arweave = Arweave.init({ host: "arweave.net", port: 443, protocol: "https" });
const jwk = await arweave.wallets.generate();
writeFileSync(join(ROOT, "arweave-wallet.json"), JSON.stringify(jwk));
const turbo = TurboFactory.authenticated({ privateKey: jwk });

console.log(`Uploading ${files.length} files…`);
const paths = {};
let i = 0;
for (const abs of files) {
  const rel = relative(outDir, abs).split("\\").join("/");
  i++;
  const res = await turbo.uploadFile({
    fileStreamFactory: () => createReadStream(abs),
    fileSizeFactory: () => statSync(abs).size,
    dataItemOpts: { tags: [{ name: "Content-Type", value: contentType(abs) }] },
  });
  paths[rel] = { id: res.id };
  if (i % 20 === 0) console.log(`${i}/${files.length}`);
}

const manifest = {
  manifest: "arweave/paths",
  version: "0.2.0",
  index: { path: "index.html" },
  paths,
};
const manBuf = Buffer.from(JSON.stringify(manifest));
const man = await turbo.uploadFile({
  fileStreamFactory: () => Readable.from(manBuf),
  fileSizeFactory: () => manBuf.length,
  dataItemOpts: {
    tags: [
      { name: "Content-Type", value: "application/x.arweave-manifest+json" },
      { name: "App-Name", value: "invitacion-joselyn-enrique" },
      { name: "Title", value: "Invitacion Joselyn y Enrique" },
    ],
  },
});

const result = {
  manifestId: man.id,
  url: `https://arweave.net/${man.id}`,
  urlArIo: `https://ar-io.dev/${man.id}`,
  urlTurbo: `https://turbo-gateway.com/${man.id}`,
  indexUrl: `https://ar-io.dev/${man.id}/index.html`,
  publishedAt: new Date().toISOString(),
  permanent: true,
  claimRequired: false,
};
writeFileSync(join(ROOT, "publish-result.json"), JSON.stringify(result, null, 2));
writeFileSync(
  join(ROOT, "PUBLIC_URL.md"),
  `# Link público permanente

**No caduca. No hay que reclamar.**

- ${result.urlArIo}
- ${result.urlTurbo}
- ${result.url} (puede tardar unos minutos en propagar)

Publicado en Arweave el ${result.publishedAt}.
`,
);

console.log("\nPermanent URL:", result.urlArIo);
console.log("Also:", result.urlTurbo);
