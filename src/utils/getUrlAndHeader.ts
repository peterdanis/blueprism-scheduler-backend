import Job from "../entity/Job";

interface Header {
  auth: {
    password: string;
    username: string;
  };
}

type Route = "stop" | "start" | "getStatus" | "reset";

export const getUrl = (job: Job, route: Route): string => {
  const { https, hostname, port } = job.runtimeResource;

  const baseUrl = `${https ? "https" : "http"}://${hostname}:${port}/`;
  switch (route) {
    case "stop":
      return `${baseUrl}/processes/${job.sessionId}/stop`;
      break;
    case "start":
      return `${baseUrl}/processes`;
      break;
    case "getStatus":
      return `${baseUrl}/processes/${job.sessionId}`;
      break;
    case "reset":
      return `${baseUrl}/reset`;
      break;
    default:
      throw new Error("Unknown request type");
      break;
  }
};

export const getHeader = (job: Job): Header => {
  const { username, password } = job.runtimeResource;
  if (username && password) {
    return {
      auth: { password, username },
    };
  }
  throw new Error("Runtime resource username and/or password is not defined");
};
