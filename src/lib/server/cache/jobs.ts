import type { CartInvoice, SiteConfig } from "$lib/types";
import {
  SystemEmail,
  type EmailTemplateContent,
} from "$lib/server/email/email";
import { QueueManager, type JobValue } from "$lib/server/cache/queue";
import {
  DeviceConfigModel,
  type IDeviceConfig,
  type IForwarders,
} from "$lib/api";
import { generateUniqueUUID } from "$lib/utils";

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

  private static sendFirehose(data: any) {
    return socketServer.broadcast({
      topic: "firehose",
      data,
    });
  }

  private static async sendDevice(data: any, identity: string) {
    const r1 = await socketServer.broadcast({
      topic: `device/${identity}`,
      data,
    });

    const r2 = await socketServer.broadcast({
      topic: `devices`,
      data,
    });
    return [r1, r2];
  }

  private static async mqttProcessor(job: JobValue) {
    // console.log("GOT THIS JOB", job.data);
    try {
      await JobsManager.sendFirehose(job.data);

      if (job.data.device) {
        await JobsManager.sendDevice(job.data, job.data.device.identity);
      }
    } catch (e) {
      console.error("Socket error", e);
    }
  }

  private static async emailProcessor(job: JobValue) {
    const { to, template } = job.data as {
      to: string;
      template: EmailTemplateContent;
    };
    return await SystemEmail.send(to, template);
  }

  private static async processedConfig(job: JobValue) {
    const data = job.data as IDeviceConfig;
    await socketServer.broadcast({
      topic: DeviceConfigModel.getConfigTopic(data),
      data,
    });
    await socketServer.broadcast({
      topic: DeviceConfigModel.getConfigTopicAction(data),
      data,
    });
  }

  public static async processDeviceForwardArtifacts(job: JobValue) {
    const { ctx, fwd } = job.data as { ctx: any; fwd: IForwarders };
    await socketServer.broadcast({
      topic: `forwarder/${fwd.id}/artifacts`,
      data: {
        ...ctx.artifacts,
        _uid: generateUniqueUUID(),
        _date: new Date(),
      },
    });
  }

  public get jobNames() {
    return [
      "mqtt-message",
      "processed-pending-config",
      "send-email",
      "process-device-forward-artifacts",
      "processed-device-sensor",
      "ota-ack-queue",
    ];
  }

  public static processDeviceSensorsSync(job: JobValue) {
    const { sensors, device } = job.data as {
      sensors: any[];
      device: any;
    };
    return socketServer.broadcast({
      topic: `device/${device.identity}/sensors/sync`,
      data: {
        sensors,
        _uid: generateUniqueUUID(),
        _date: new Date(),
      },
    });
  }
  public static otaAckProcessor(job: JobValue) {
    const { message, device } = job.data as {
      message: Buffer<ArrayBufferLike>;
      device: any;
    };
    return socketServer.broadcast({
      topic: `device/${device.identity}/ota/ack`,
      data: {
        message: message.toString(),
        _uid: generateUniqueUUID(),
        _date: new Date(),
      },
    });
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
        cb: JobsManager.processedConfig,
      },
      {
        name: jobNames[2],
        opt: queue.queueOpt,
        cb: JobsManager.emailProcessor,
      },

      {
        name: jobNames[3],
        opt: queue.queueOpt,
        cb: JobsManager.processDeviceForwardArtifacts,
      },

      {
        name: jobNames[4],
        opt: queue.queueOpt,
        cb: JobsManager.processDeviceSensorsSync,
      },
      {
        name: jobNames[5],
        opt: queue.queueOpt,
        cb: JobsManager.otaAckProcessor,
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
      // queue.queue(job.name, job.opt);
      queue.worker(job.name, job.cb);
    }
    return this._instance;
  }
}
