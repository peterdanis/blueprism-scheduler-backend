import { notification } from "antd";

const openNotification = (
  title: string,
  message?: string | React.ReactNode,
  kind: "info" | "warning" | "error" | "success" = "info",
  duration: number = 0
) => {
  notification[kind]({
    message: title,
    description: message,
    duration,
  });
};

export default openNotification;
