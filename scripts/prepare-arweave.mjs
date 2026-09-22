#!/usr/bin/env node
/**
 * Prepare `out/` for free Arweave Turbo uploads (≤100 KiB per file):
 * - strip Next.js polyfills
 * - split oversized JS into part files + a sync loader (webpack-compatible)
 */
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(process.cwd(), "out");
const LIMIT = 100 * 1024;
const PART = 90 * 1024;

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
  for (const file of walk(ROOT)) {
    if (!file.endsWith(".js") || file.includes(".part")) continue;
    const size = statSync(file).size;
    if (size <= LIMIT) continue;

    const buf = readFileSync(file);
    const parts = Math.ceil(buf.length / PART);
    for (let i = 0; i < parts; i++) {
      writeFileSync(`${file}.part${i}`, buf.subarray(i * PART, (i + 1) * PART));
    }
    // Sync XHR + eval so webpack chunk registration stays synchronous.
    const classic = `!function(){var p=${parts},t=[],b=document.currentScript.src;for(var i=0;i<p;i++){var x=new XMLHttpRequest();x.open("GET",b+".part"+i,!1);x.overrideMimeType("text/plain; charset=x-user-defined");x.send();t.push(x.responseText)}(0,eval)(t.join(""))}();`;
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
}

if (!existsSync(ROOT)) {
  console.error("out/ missing — run npm run build first");
  process.exit(1);
}
stripPolyfills();
splitLargeJs();

const overs = walk(ROOT).filter((f) => statSync(f).size > LIMIT);
if (overs.length) {
  console.error("Still over limit:", overs);
  process.exit(1);
}
console.log("out/ ready for Arweave free upload");
