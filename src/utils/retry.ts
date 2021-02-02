import asyncRetry, { Options } from "async-retry";
import { maxRetryTime } from "./getSetting";

const options: Options = {
  factor: 1.5,
  maxRetryTime,
  maxTimeout: 30000,
  retries: 20,
};

type Retry = <T>(fn: () => Promise<T>) => Promise<void | T>;

/**
 * Retry for async functions, with predefined parameters.
 * In case of axios request - don't retry if the response code is 3xx or 4xx, unless its a "429 Too Many Requests" response.
 * @param fn Function to execute with its arguments, wrapped in arrow funtion.
 * @example const connection = await retry(() => createConnection(schedDbConfig));
 * const users = await retry(() => User.find());
 */

const retry: Retry = async (fn) => {
  return asyncRetry(async (bail) => {
    try {
      return await fn();
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 300 &&
        error.response.status < 500 &&
        error.response.status !== 429
      ) {
        return bail(error);
      }
      throw error;
    }
  }, options);
};

export default retry;
