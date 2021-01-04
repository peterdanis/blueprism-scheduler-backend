import Job from "./entities/Job";

let running = false;

export default async (): void => {
  if (running) {
    return;
  }
  try {
    running = true;
    const jobs = await Job.find();
  } catch (error) {
    //
  } finally {
    running = false;
  }
};
