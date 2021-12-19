import JobLog from "../../src/entities/JobLog";

export const dummyJobLog: Partial<JobLog> = {
  addTime: (new Date().toString() as unknown) as Date,
  priority: 50,
  scheduleId: 1,
  startReason: "test",
  status: "waiting",
};

// @ts-ignore
JobLog.find.mockImplementation(
  async (): Promise<JobLog[]> => {
    return [dummyJobLog as JobLog];
  },
);

export default JobLog;
