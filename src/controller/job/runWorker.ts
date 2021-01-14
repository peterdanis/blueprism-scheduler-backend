import Job from "../../entity/Job";
import log from "../../utils/logger";
import { parentPort } from "worker_threads";
import ScheduleTask from "../../entity/ScheduleTask";
import sleep from "../../utils/sleep";

// await sleep(job.schedule.scheduleTask.delayAfter);

parentPort?.on(
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
      const sessionId = "1234";
      setTimeout(() => {
        parentPort?.postMessage({ sessionId });
      }, 6000);
      return;
    }
    // check status
    // retry?
    // TODO:
    await sleep(delayAfter);
  },
);
