import fs from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import type { Readable } from "node:stream";
import { createId } from "./ids.js";

export class FileStorage {
  constructor(private readonly root: string) {}

  async ensureReady() {
    await Promise.all([
      fs.mkdir(this.inputDir, { recursive: true }),
      fs.mkdir(this.outputDir, { recursive: true }),
      fs.mkdir(this.jobsDir, { recursive: true }),
      fs.mkdir(this.queueDir, { recursive: true }),
      fs.mkdir(this.processingQueueDir, { recursive: true }),
    ]);
  }

  get inputDir() {
    return path.join(this.root, "input");
  }

  get outputDir() {
    return path.join(this.root, "output");
  }

  get jobsDir() {
    return path.join(this.root, "jobs");
  }

  get queueDir() {
    return path.join(this.root, "queue");
  }

  get processingQueueDir() {
    return path.join(this.root, "queue-processing");
  }

  createInputKey(jobId: string) {
    return `${jobId}/${createId("input")}.pdf`;
  }

  createOutputKey(jobId: string) {
    return `${jobId}/${createId("output")}.pdf`;
  }

  private pathFor(kind: "input" | "output", key: string) {
    const base = kind === "input" ? this.inputDir : this.outputDir;
    const resolved = path.resolve(base, key);
    if (!resolved.startsWith(path.resolve(base))) throw new Error("Invalid storage key.");
    return resolved;
  }

  async putInput(key: string, bytes: Buffer) {
    const filePath = this.pathFor("input", key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, bytes);
  }

  async putOutput(key: string, source: string | Readable) {
    const filePath = this.pathFor("output", key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    if (typeof source === "string") {
      await fs.copyFile(source, filePath);
      return;
    }
    await pipeline(source, createWriteStream(filePath));
  }

  inputPath(key: string) {
    return this.pathFor("input", key);
  }

  outputPath(key: string) {
    return this.pathFor("output", key);
  }

  getInputStream(key: string) {
    return createReadStream(this.pathFor("input", key));
  }

  getOutputStream(key: string) {
    return createReadStream(this.pathFor("output", key));
  }

  async objectExists(kind: "input" | "output", key: string) {
    try {
      const stats = await fs.stat(this.pathFor(kind, key));
      return stats.isFile();
    } catch {
      return false;
    }
  }

  async deleteInput(key?: string) {
    if (!key) return;
    await fs.rm(this.pathFor("input", key), { force: true });
  }

  async deleteOutput(key?: string) {
    if (!key) return;
    await fs.rm(this.pathFor("output", key), { force: true });
  }
}
