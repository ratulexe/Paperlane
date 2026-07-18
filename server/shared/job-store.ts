import fs from "node:fs/promises";
import path from "node:path";
import type { CloudJobRecord } from "./types.js";

export class FileJobStore {
  constructor(private readonly jobsDir: string) {}

  async ensureReady() {
    await fs.mkdir(this.jobsDir, { recursive: true });
  }

  private jobPath(jobId: string) {
    if (!/^job_[A-Za-z0-9_-]+$/.test(jobId)) throw new Error("Invalid job ID.");
    return path.join(this.jobsDir, `${jobId}.json`);
  }

  async create(job: CloudJobRecord) {
    await this.write(job);
    return job;
  }

  async read(jobId: string) {
    try {
      const raw = await fs.readFile(this.jobPath(jobId), "utf8");
      return JSON.parse(raw) as CloudJobRecord;
    } catch {
      return undefined;
    }
  }

  async write(job: CloudJobRecord) {
    await fs.mkdir(this.jobsDir, { recursive: true });
    const target = this.jobPath(job.jobId);
    const temporary = `${target}.${process.pid}.tmp`;
    await fs.writeFile(temporary, JSON.stringify(job, null, 2));
    await fs.rename(temporary, target);
  }

  async update(jobId: string, updater: (job: CloudJobRecord) => CloudJobRecord | Promise<CloudJobRecord>) {
    const current = await this.read(jobId);
    if (!current) return undefined;
    const next = await updater({ ...current, deletion: { ...current.deletion } });
    next.updatedAt = new Date().toISOString();
    await this.write(next);
    return next;
  }

  async list() {
    await fs.mkdir(this.jobsDir, { recursive: true });
    const entries = await fs.readdir(this.jobsDir);
    const jobs = await Promise.all(
      entries
        .filter((entry) => entry.endsWith(".json"))
        .map((entry) => fs.readFile(path.join(this.jobsDir, entry), "utf8").then((raw) => JSON.parse(raw) as CloudJobRecord)),
    );
    return jobs;
  }
}
