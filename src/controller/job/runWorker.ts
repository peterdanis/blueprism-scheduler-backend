import Job from "../../entity/Job";
import log from "../../utils/logger";
import { parentPort } from "worker_threads";
import ScheduleTask from "../../entity/ScheduleTask";
import sleep from "../../utils/sleep";
import { WorkerMessage } from "./run";

log("worker start");

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
parentPort!.on(
  "message",
  async (job: Job): Promise<void> => {
    const { subStep } = job;
    const getCurrentTask = (): ScheduleTask | undefined =>
      job.schedule.scheduleTask.sort((task1, task2) => task1.step - task2.step)[
        job.step - 1
      ];

    const { delayAfter, task } = getCurrentTask() as ScheduleTask;

    if (subStep === 1) {
      // TODO:
      // retry?
      log(`post processes, ${task.process}, ${task.inputs}`);
      const message: WorkerMessage = { sessionId: "1234" };
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        parentPort!.postMessage(message);
      }, 6000);
      return;
    }
    // check status
    // retry?
    // TODO:
    log(`get processes/id, ${job.sessionId},`);
    const message: WorkerMessage = { completed: true };

    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      parentPort!.postMessage(message);
    }, 6000);
    await sleep(delayAfter);
  },
);
