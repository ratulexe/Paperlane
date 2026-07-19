import fs from "node:fs/promises";
import path from "node:path";

export type QueueReceipt = {
  jobId: string;
  receiptPath: string;
  entryName: string;
};

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

  async listProcessingReceipts(): Promise<QueueReceipt[]> {
    await this.ensureReady();
    const entries = (await fs.readdir(this.processingDir)).filter((entry) => entry.endsWith(".json")).sort();
    const receipts = await Promise.all(
      entries.map(async (entryName) => {
        const receiptPath = path.join(this.processingDir, entryName);
        try {
          const raw = await fs.readFile(receiptPath, "utf8");
          const parsed = JSON.parse(raw) as { jobId?: unknown };
          if (typeof parsed.jobId === "string") return { jobId: parsed.jobId, receiptPath, entryName };
        } catch {
          // Fall back to the receipt filename below.
        }
        const match = entryName.match(/-(job_[A-Za-z0-9_-]+)\.json$/);
        return match ? { jobId: match[1], receiptPath, entryName } : undefined;
      }),
    );
    return receipts.filter((receipt): receipt is QueueReceipt => Boolean(receipt));
  }

  async removeProcessingReceipt(receiptPath: string) {
    await fs.rm(receiptPath, { force: true });
  }

  async requeueProcessingReceipt(receiptPath: string, jobId: string) {
    await this.ensureReady();
    const target = path.join(this.queueDir, `${Date.now()}-${jobId}.json`);
    try {
      await fs.rename(receiptPath, target);
    } catch {
      await this.enqueue(jobId);
      await this.removeProcessingReceipt(receiptPath);
    }
  }
}
