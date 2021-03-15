import { dummySchedule } from "./mockSchedule";
import Job from "../../src/entities/Job";
import Schedule from "../../src/entities/Schedule";

export const dummyJob: Partial<Job> = {
  addTime: (new Date().toString() as unknown) as Date,
  priority: 50,
  schedule: dummySchedule as Schedule,
  startReason: "test",
  status: "waiting",
};

// @ts-ignore
Job.find.mockImplementation(
  async (): Promise<Job[]> => {
    return [dummyJob as Job];
  },
);

export default Job;
