import fs from "node:fs/promises";
import path from "node:path";

export class FileJobQueue {
  constructor(
    private readonly queueDir: string,
    private readonly processingDir: string,
  ) {}

  async ensureReady() {
    await Promise.all([
      fs.mkdir(this.queueDir, { recursive: true }),
      fs.mkdir(this.processingDir, { recursive: true }),
    ]);
  }

  async enqueue(jobId: string) {
    await this.ensureReady();
    const queuePath = path.join(this.queueDir, `${Date.now()}-${jobId}.json`);
    await fs.writeFile(queuePath, JSON.stringify({ jobId, queuedAt: new Date().toISOString() }));
  }

  async claimNext() {
    await this.ensureReady();
    const entries = (await fs.readdir(this.queueDir)).filter((entry) => entry.endsWith(".json")).sort();
    const entry = entries[0];
    if (!entry) return undefined;
    const source = path.join(this.queueDir, entry);
    const target = path.join(this.processingDir, entry);
    try {
      await fs.rename(source, target);
      const raw = await fs.readFile(target, "utf8");
      const parsed = JSON.parse(raw) as { jobId: string };
      return { jobId: parsed.jobId, receiptPath: target };
    } catch {
      return undefined;
    }
  }

  async acknowledge(receiptPath: string) {
    await fs.rm(receiptPath, { force: true });
  }
}
