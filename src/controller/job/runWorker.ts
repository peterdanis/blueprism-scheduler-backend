import Job from "../../entity/Job";
import logger from "../../utils/logger";
import { parentPort } from "worker_threads";
import ScheduleTask from "../../entity/ScheduleTask";
import sleep from "../../utils/sleep";
import { WorkerMessage } from "./run";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
parentPort!.on(
  "message",
  async (job: Job): Promise<void> => {
    const log = logger.child({ jobId: job.id });
    const { subStep } = job;
    const getCurrentTask = (): ScheduleTask | undefined =>
      job.schedule.scheduleTask.sort((task1, task2) => task1.step - task2.step)[
        job.step - 1
      ];

    const { delayAfter, task } = getCurrentTask() as ScheduleTask;

    if (subStep === 1) {
      // TODO:
      // retry?
      log.info("post processes", { process: task.process });
      await sleep(6000);
      // eslint-disable-next-line no-param-reassign
      job.sessionId = "123456";
      const message: WorkerMessage = { sessionId: job.sessionId };
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      parentPort!.postMessage(message);
    }
    // check status
    // retry?
    // TODO:
    log.info("get processes/id", { sessionId: job.sessionId });
    await sleep(10000);

    const message: WorkerMessage = { completed: true };
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    parentPort!.postMessage(message);
    await sleep(delayAfter);
  },
);
