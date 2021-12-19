import asyncRetry, { Options } from "async-retry";

const options: Options = {
  factor: 1,
  retries: 5,
};

/**
 * Retry for async functions, with predefined parameters.
 * In case of axios request - don't retry if the response code is 3xx or 4xx, unless its a "429 Too Many Requests" response.
 * @param fn Function to execute with its arguments, wrapped in arrow funtion.
 * @example const connection = await retry(() => createConnection(schedDbConfig));
 * const users = await retry(() => User.find());
 */

const retry = async <T>(fn: () => Promise<T>): Promise<T> => {
  return asyncRetry(async (bail) => {
    try {
      const result: any = await fn();
      if (result && !result.ok) {
        throw result;
      }
      return result as T;
    } catch (error) {
      if (
        error.status &&
        error.status >= 300 &&
        error.status < 500 &&
        error.status !== 429
      ) {
        return (bail(error) as unknown) as T;
      }
      throw error;
    }
  }, options);
};

export default retry;
