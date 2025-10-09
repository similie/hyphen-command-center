import type { CartInvoice, SiteConfig } from "$lib/types";
import {
  SystemEmail,
  type EmailTemplateContent,
} from "$lib/server/email/email";
import { QueueManager, type JobValue } from "$lib/server/cache/queue";
import { SocketServer } from "./websocket";

export class JobsManager {
  // ... your existing code ...
  private static _instance: JobsManager | undefined;
  private readonly _queue: QueueManager;

  private constructor(private readonly _config: SiteConfig) {
    this._queue = QueueManager.get;
  }

  static get instance() {
    if (!this._instance) {
      throw new Error("The manager hasn't been started");
    }
    return this._instance;
  }

  get config() {
    return this._config;
  }

  public get queue() {
    return this._queue;
  }

  public static async setInvoiceWorker(
    invoice: CartInvoice,
  ): Promise<JobValue[]> {
    if (!JobsManager._instance) {
      throw new Error("Jobs manager not started");
    }
    const { queue, jobNames } = JobsManager._instance;
    const jobs: JobValue[] = [];
    for (const name of jobNames) {
      const response = await queue.add(name, {
        uid: invoice.uid,
      });
      jobs.push(response);
    }
    return jobs;
  }

  public static sendEmail(to: string, template: EmailTemplateContent) {
    if (!JobsManager._instance) {
      throw new Error("Job manager not started");
    }
    const { queue, jobNames } = JobsManager._instance;
    const emailName = jobNames[2];
    if (!template.data.config) {
      template.data.config = JobsManager._instance.config;
    }
    return queue.add(emailName, { to, template });
  }

  private static async mqttProcessor(job: JobValue) {
    console.log("GOT THIS JOB", job.data);
    try {
      await socketServer.broadcast({
        topic: "firehose",
        data: job.data,
      });
    } catch (e) {
      console.error("Socket error", e);
    }
  }

  private static async reminderWorker(job: JobValue) {}

  private static async emailProcessor(job: JobValue) {
    const { to, template } = job.data as {
      to: string;
      template: EmailTemplateContent;
    };
    return await SystemEmail.send(to, template);
  }

  public get jobNames() {
    return ["mqtt-message", "send-email"];
  }

  public get getJob() {
    if (!JobsManager._instance) {
      throw new Error("Jobs manager not started");
    }
    const { queue, jobNames } = JobsManager._instance;
    const jobs = [
      {
        name: jobNames[0],
        opt: queue.queueOpt,
        cb: JobsManager.mqttProcessor,
      },
      {
        name: jobNames[1],
        opt: queue.queueOpt,
        cb: JobsManager.emailProcessor,
      },
    ];
    return jobs;
  }

  public static start(config: SiteConfig) {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new JobsManager(config);
    const { queue } = this._instance;
    const jobs = this._instance.getJob;

    for (const job of jobs) {
      queue.queue(job.name, job.opt);
      queue.worker(job.name, job.cb);
    }
    return this._instance;
  }
}
