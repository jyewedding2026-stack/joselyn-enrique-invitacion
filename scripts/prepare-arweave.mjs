#!/usr/bin/env node
/**
 * Prepare `out/` for free Arweave Turbo uploads (≤100 KiB per file):
 * - strip Next.js polyfills
 * - split oversized JS into part files + a sync loader (webpack-compatible)
 * - prefetch part files so sync XHR hits cache (much faster on Arweave)
 */
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";

const ROOT = join(process.cwd(), "out");
const LIMIT = 100 * 1024;
const PART = 100 * 1024 - 64;

function walk(dir, acc = []) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function stripPolyfills() {
  const re = /<script[^>]+polyfills[^>]*><\/script>\s*/gi;
  for (const file of walk(ROOT).filter((f) => f.endsWith(".html"))) {
    const src = readFileSync(file, "utf8");
    const next = src.replace(re, "");
    if (next !== src) writeFileSync(file, next);
  }
  for (const file of walk(ROOT)) {
    if (/polyfills-.*\.js$/.test(file)) unlinkSync(file);
  }
}

function splitLargeJs() {
  const partHrefs = [];
  for (const file of walk(ROOT)) {
    if (!file.endsWith(".js") || file.includes(".part")) continue;
    const size = statSync(file).size;
    if (size <= LIMIT) continue;

    const buf = readFileSync(file);
    const parts = Math.ceil(buf.length / PART);
    for (let i = 0; i < parts; i++) {
      writeFileSync(`${file}.part${i}`, buf.subarray(i * PART, (i + 1) * PART));
      partHrefs.push("./" + relative(ROOT, `${file}.part${i}`).split("\\").join("/"));
    }
    const classic = `!function(){var p=${parts},t=[],b=document.currentScript.src;for(var i=0;i<p;i++){var x=new XMLHttpRequest();x.open("GET",b+".part"+i,!1);x.send();t.push(x.responseText)}(0,eval)(t.join(""))}();`;
    writeFileSync(file, classic);
    console.log(
      "split",
      relative(ROOT, file),
      size,
      "->",
      parts,
      "parts + loader",
      Buffer.byteLength(classic),
    );
  }
  return partHrefs;
}

function injectPrefetch(partHrefs) {
  if (!partHrefs.length) return;
  const tags = partHrefs
    .map((href) => `<link rel="preload" as="fetch" href="${href}" crossorigin>`)
    .join("");
  for (const file of walk(ROOT).filter((f) => f.endsWith(".html"))) {
    let html = readFileSync(file, "utf8");
    if (!html.includes("</head>")) continue;
    // Resolve relative to this HTML file directory
    const htmlDir = dirname(relative(ROOT, file)).replace(/\\/g, "/");
    const localTags = partHrefs
      .map((href) => {
        // href is ./_next/... from site root; HTML in subdirs need ../
        if (!htmlDir || htmlDir === ".") return `<link rel="preload" as="fetch" href="${href}" crossorigin>`;
        const depth = htmlDir.split("/").filter(Boolean).length;
        const prefix = "../".repeat(depth);
        return `<link rel="preload" as="fetch" href="${prefix}${href.slice(2)}" crossorigin>`;
      })
      .join("");
    html = html.replace("</head>", `${localTags}</head>`);
    // Drop async on scripts so critical chunks run more predictably
    html = html.replace(/<script src="([^"]+)" async="">/g, '<script src="$1">');
    writeFileSync(file, html);
  }
}

if (!existsSync(ROOT)) {
  console.error("out/ missing — run npm run build first");
  process.exit(1);
}
stripPolyfills();
const parts = splitLargeJs();
injectPrefetch(parts);

const overs = walk(ROOT).filter((f) => statSync(f).size > LIMIT);
if (overs.length) {
  console.error("Still over limit:", overs);
  process.exit(1);
}
console.log("out/ ready for Arweave free upload");
