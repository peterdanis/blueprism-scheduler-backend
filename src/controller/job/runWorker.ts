import { getCurrentTask, lastStep, WorkerMessage } from "./run";
import { getHeader, getUrl } from "../../utils/getUrlAndHeader";
import axios from "axios";
import axiosRetry from "axios-retry";
import Job from "../../entity/Job";
import logger from "../../utils/logger";
import { parentPort } from "worker_threads";
import ScheduleTask from "../../entity/ScheduleTask";
import sleep from "../../utils/sleep";

axiosRetry(axios, { retries: 3, retryDelay: () => 20 });

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
parentPort!.on(
  "message",
  async (job: Job): Promise<void> => {
    const log = logger.child({ jobId: job.id });
    const { step, subStep } = job;
    const { delayAfter, task } = getCurrentTask(job) as ScheduleTask;

    // Reset runtime resource before first step
    if (step === 1) {
      try {
        log.info("Post reset");
        // will retry via axios-retry
        await axios.post(getUrl(job, "reset"), {}, getHeader(job));
      } catch (error) {
        log.error(error);
      }
    }

    if (subStep === 1) {
      log.info("Post processes", { process: task.process });

      const response = await axios.post(
        getUrl(job, "reset"),
        { inputs: task.inputs, process: task.process },
        getHeader(job),
      );
      log.info("Response", { response });

      /* eslint-disable no-param-reassign */
      job.sessionId = "123456";
      job.subStep = 2;
      /* eslint-enable no-param-reassign */

      const message: WorkerMessage = { sessionId: job.sessionId };
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      parentPort!.postMessage(message);
    }

    // Check status
    log.info("Get processes/id", { sessionId: job.sessionId });

    let response = "running";
    while (response === "running" || response === "stopping") {
      // eslint-disable-next-line no-await-in-loop
      await sleep(30000);
      // eslint-disable-next-line no-await-in-loop
      response = await axios.post(
        getUrl(job, "reset"),
        { inputs: task.inputs, process: task.process },
        getHeader(job),
      );
      log.info("Response", { response });
    }

    const message: WorkerMessage = { completed: true };
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    parentPort!.postMessage(message);

    await sleep(delayAfter);

    // Reset runtime resource after last step
    if (lastStep(job) && subStep === 2) {
      try {
        log.info("Post reset");
        // will retry via axios-retry
        await axios.post(getUrl(job, "reset"), {}, getHeader(job));
      } catch (error) {
        log.error(error);
      }
    }
  },
);
