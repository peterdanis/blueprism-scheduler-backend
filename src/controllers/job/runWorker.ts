import axios, { AxiosError } from "axios";
import { getCurrentTask, WorkerMessage } from "./run";
import { getHeader, getUrl } from "../../utils/getUrlAndHeader";
import Job from "../../entities/Job";
import logger from "../../utils/logger";
import { parentPort } from "worker_threads";
import { recheckDelay } from "../../utils/getSetting";
import retry from "../../utils/retry";
import ScheduleTask from "../../entities/ScheduleTask";
import sleep from "../../utils/sleep";

type Status =
  | "Completed"
  | "Running"
  | "Stopped"
  | "StopRequested"
  | "Terminated";

const sessionIdRegexp = new RegExp(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);

const startProcess = async (job: Job): Promise<string> => {
  const { task } = getCurrentTask(job) as ScheduleTask;
  const url = getUrl(job, "start");
  const header = getHeader(job);
  const inputs = task.inputs || [];
  const body = { inputs, process: task.process };

  const { data } = await retry(() => axios.post(url, body, header));
  if (!sessionIdRegexp.test(data.sessionId)) {
    throw new Error(
      "Returned session ID is not a valid session identifier. The correct format is xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    );
  }

  return data.sessionId;
};

const checkStatus = async (job: Job): Promise<Status | unknown> => {
  const url = getUrl(job, "getStatus");
  const header = getHeader(job);
  let status: Status = "Running";

  /* eslint-disable no-await-in-loop */
  while (status === "Running" || status === "StopRequested") {
    await sleep(recheckDelay);
    const { data } = await retry(() => axios.get(url, header));
    status = data.status;
  }
  /* eslint-enable no-await-in-loop */

  return status;
};

const messageHandler = async (_job: Job): Promise<void> => {
  const job = _job;
  const log = logger.child({ jobId: job.id });
  const { step, subStep } = job;
  const { delayAfter, task } = getCurrentTask(job) as ScheduleTask;

  // Reset runtime resource before very first step
  if (step === 1 && subStep === 1) {
    log.info("Reset runtime resource");
    await retry(() => axios.post(getUrl(job, "reset"), {}, getHeader(job)));
  }

  // Start new process
  if (subStep === 1) {
    log.info("Start new process", { process: task.process });
    job.sessionId = await startProcess(job);
    job.subStep = 2;
    const message: WorkerMessage = { sessionId: job.sessionId };
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    parentPort!.postMessage(message);
  }

  // Check status
  log.info("Check process status", { sessionId: job.sessionId });
  const status = await checkStatus(job);

  const message: WorkerMessage = {};
  switch (status) {
    case "Completed":
      message.completed = true;
      break;
    case "Stopped":
      message.stopped = true;
      break;
    case "Failed":
      message.failed = true;
      break;
    default:
      throw new Error(
        `Unknown status received from runtime resource, status: ${status}`,
      );
      break;
  }
  await sleep(delayAfter);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  parentPort!.postMessage(message);
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
parentPort!.on("message", messageHandler);

// Rethrow to be catched by worker.on("error") handler
process.on("unhandledRejection", (error: AxiosError) => {
  if (error.response) {
    throw new Error(`${error.message}. ${error.response.data.error}`);
  }
  throw error;
});
