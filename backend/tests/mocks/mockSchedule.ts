import Schedule from "../../src/entities/Schedule";

export const dummySchedule: Partial<Schedule> = {
  id: 1,
  name: "TestSchedule",
};

// @ts-ignore
Schedule.find.mockImplementation(
  async (): Promise<Schedule[]> => {
    return [dummySchedule as Schedule];
  },
);

export default Schedule;
