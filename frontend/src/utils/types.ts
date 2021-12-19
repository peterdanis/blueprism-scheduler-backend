type Auth = "basic" | "apikey";

type JobStatus =
  | "canceled" // if skipped or canceled from user side
  | "failed" // if step status on BP side is terminated and step is setup to abort early, or if any error occurs, or if stopped by hardTimeout
  | "finished" // if all steps finished successfully
  | "finished with notes" // if some steps failed or were stopped, but the job finished
  | "running" // if any step is still running
  | "stopped" // if stopped by softTimeout or by softStop request, either from scheduler side or user side
  | "waiting"; // if the job is waiting in queue

type StepStatus = "failed" | "finished" | "stopped";

type Steps = {
  [key: number]: {
    status: StepStatus;
    sessionId: string | undefined;
  };
};

type Input = {
  "@name": string;
  "@value": string;
  "@type": "text";
};

type JobBase = {
  id?: number;
  addTime: Date;
  endTime?: Date;
  message?: string;
  priority: number;
  sessionId?: string;
  startTime?: Date;
  startReason: string;
  status: JobStatus;
  step: number;
  steps?: Steps;
  stopReason?: string;
  subStep: number;
  updateTime?: Date;
};

export type ScheduleTask = {
  id?: number;
  abortEarly?: boolean;
  delayAfter?: number;
  onError?: OnError;
  step: number;
  schedule: Schedule;
  task: Task;
};

export type OnError = {
  action: "email";
  emailTo?: string;
  emailCc?: string;
};

export type Schedule = {
  id?: number;
  force?: boolean;
  name: string;
  hardForceTime?: number;
  hardTimeout?: number;
  onError?: OnError;
  priority?: number;
  rule: string;
  softForceTime?: number;
  softTimeout?: number;
  timezone?: string;
  validFrom: Date;
  validUntil?: Date;
  waitTime?: number;
  scheduleTask?: ScheduleTask[];
  runtimeResource?: RuntimeResource;
};

export type RuntimeResource = {
  id?: number;
  apiKey?: string;
  auth: Auth;
  friendlyName: string;
  hostname: string;
  https: boolean;
  password?: string;
  port: number;
  username?: string;
  job?: Job[];
  schedule?: Schedule[];
};

export type Job = JobBase & {
  schedule: Schedule;
  runtimeResource: RuntimeResource;
};

export type JobLog = JobBase & {
  jobId: number;
  scheduleId: number;
  runtimeResourceId: number;
};

export type User = {
  id?: number;
  apiKey?: string;
  apiKeyHash?: string;
  admin?: boolean;
  name: string;
  password?: string;
};

export type Task = {
  id?: number;
  inputs?: Input[];
  hardTimeout?: number;
  name: string;
  process: string;
  scheduleTask?: ScheduleTask[];
  softTimeout?: number;
};

export type Setting = {
  key: string;
  value: string;
};
