import { spawn } from "node:child_process";

const services = [
  {
    name: "paperlane-api",
    command: "node",
    args: ["dist-server/server/api/index.js"],
  },
  {
    name: "paperlane-worker",
    command: "node",
    args: ["dist-server/server/worker/index.js"],
  },
];

const children = new Map();
let shuttingDown = false;
let exitTimer;

function log(message, extra = {}) {
  console.log(JSON.stringify({ level: "info", service: "paperlane-cloud", message, ...extra }));
}

function logError(message, extra = {}) {
  console.error(JSON.stringify({ level: "error", service: "paperlane-cloud", message, ...extra }));
}

function stopChildren(signal = "SIGTERM") {
  for (const child of children.values()) {
    if (!child.killed) child.kill(signal);
  }
}

function exitWhenStopped(code) {
  if (children.size === 0) {
    if (exitTimer) clearTimeout(exitTimer);
    process.exit(code);
  }
}

function beginShutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  log("stopping child services");
  stopChildren();
  exitTimer = setTimeout(() => {
    logError("forcing shutdown after timeout");
    stopChildren("SIGKILL");
    process.exit(code);
  }, 10_000);
}

for (const service of services) {
  const child = spawn(service.command, service.args, {
    stdio: "inherit",
    windowsHide: true,
    env: process.env,
  });

  children.set(service.name, child);
  log("started child service", { childService: service.name, pid: child.pid });

  child.on("error", (error) => {
    logError("child service failed to start", { childService: service.name, errorName: error.name });
    beginShutdown(1);
  });

  child.on("exit", (code, signal) => {
    children.delete(service.name);
    const exitCode = typeof code === "number" ? code : 0;
    const expected = shuttingDown;
    const level = expected ? "info" : "error";
    const payload = {
      level,
      service: "paperlane-cloud",
      message: "child service exited",
      childService: service.name,
      code: exitCode,
      signal,
    };
    const line = JSON.stringify(payload);
    if (expected) console.log(line);
    else console.error(line);

    if (!expected) {
      beginShutdown(exitCode || 1);
      return;
    }
    exitWhenStopped(exitCode);
  });
}

process.on("SIGTERM", () => beginShutdown(0));
process.on("SIGINT", () => beginShutdown(0));

