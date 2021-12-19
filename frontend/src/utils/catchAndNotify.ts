import notification from "./notification";

const catchAndNotify = (error: Error) => {
  notification("Error", error.message, "error");
  console.error(error);
};

export default catchAndNotify;
