#!/usr/bin/env node
/**
 * Keeps the invitation publicly reachable with a stable localtunnel subdomain
 * and ensures the static server on :43127 stays up.
 *
 * Stable public URL: https://invitacion-joselyn-enrique.loca.lt
 */
import { spawn, execSync } from "node:child_process";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const PORT = 43127;
const SUBDOMAIN = "invitacion-joselyn-enrique";
const PUBLIC_URL = `https://${SUBDOMAIN}.loca.lt`;
const ROOT = process.cwd();
const OUT = join(ROOT, "out");
const STATE = join(ROOT, ".public-host.json");

let serveProc = null;
let tunnelProc = null;

function log(...args) {
  console.log(new Date().toISOString(), ...args);
}

function writeState(extra = {}) {
  writeFileSync(
    STATE,
    JSON.stringify(
      {
        publicUrl: PUBLIC_URL,
        port: PORT,
        updatedAt: new Date().toISOString(),
        ...extra,
      },
      null,
      2,
    ),
  );
  writeFileSync(
    join(ROOT, "PUBLIC_URL.md"),
    `# Link público\n\n**Principal (estable):** [${PUBLIC_URL}](${PUBLIC_URL})\n\nEste enlace usa un subdominio fijo y se mantiene con \`npm run keep:public\`.\n`,
  );
}

function portUp() {
  try {
    execSync(`curl -sf -o /dev/null --max-time 3 http://127.0.0.1:${PORT}/`, {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function ensureOut() {
  if (!existsSync(join(OUT, "index.html"))) {
    log("Building static export…");
    execSync("npm run build", { cwd: ROOT, stdio: "inherit" });
  }
}

function startServe() {
  if (serveProc && !serveProc.killed) {
    try {
      process.kill(serveProc.pid, 0);
      return;
    } catch {
      /* restart */
    }
  }
  log("Starting static server on", PORT);
  serveProc = spawn(
    "npx",
    ["--yes", "serve", "out", "-l", String(PORT), "--no-port-switching"],
    { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], detached: false },
  );
  serveProc.stdout.on("data", (d) => process.stdout.write(`[serve] ${d}`));
  serveProc.stderr.on("data", (d) => process.stderr.write(`[serve] ${d}`));
  serveProc.on("exit", (code) => {
    log("serve exited", code);
    serveProc = null;
  });
}

function startTunnel() {
  if (tunnelProc && !tunnelProc.killed) {
    try {
      process.kill(tunnelProc.pid, 0);
      return;
    } catch {
      /* restart */
    }
  }
  log("Starting localtunnel →", PUBLIC_URL);
  tunnelProc = spawn(
    "npx",
    ["--yes", "localtunnel", "--port", String(PORT), "--subdomain", SUBDOMAIN],
    { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], detached: false },
  );
  tunnelProc.stdout.on("data", (d) => {
    const s = d.toString();
    process.stdout.write(`[tunnel] ${s}`);
    if (s.includes("your url is:")) writeState({ tunnel: "up" });
  });
  tunnelProc.stderr.on("data", (d) => process.stderr.write(`[tunnel] ${d}`));
  tunnelProc.on("exit", (code) => {
    log("tunnel exited", code);
    tunnelProc = null;
  });
}

async function publicOk() {
  try {
    const res = await fetch(PUBLIC_URL + "/", {
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function tick() {
  if (!portUp()) {
    log("Local server down — restarting");
    startServe();
    await new Promise((r) => setTimeout(r, 2500));
  }
  if (!tunnelProc) {
    startTunnel();
    await new Promise((r) => setTimeout(r, 4000));
  }
  const ok = await publicOk();
  writeState({ healthy: ok });
  if (!ok) {
    log("Public URL unhealthy — recycling tunnel");
    if (tunnelProc) {
      try {
        tunnelProc.kill("SIGTERM");
      } catch {
        /* ignore */
      }
      tunnelProc = null;
    }
    startTunnel();
  } else {
    log("OK", PUBLIC_URL);
  }
}

ensureOut();
startServe();
startTunnel();
writeState({ started: true });

setInterval(() => {
  tick().catch((e) => log("tick error", e));
}, 45_000);

tick().catch((e) => log("tick error", e));

process.on("SIGINT", () => {
  tunnelProc?.kill();
  serveProc?.kill();
  process.exit(0);
});
process.on("SIGTERM", () => {
  tunnelProc?.kill();
  serveProc?.kill();
  process.exit(0);
});
