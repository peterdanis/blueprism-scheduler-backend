import retryAsync from "async-retry";

export const retryOnce = async (): Promise<any> => {
  retryAsync(
    async () => {
      try {
        // await queryRunner.dropTable(table);
      } catch (error) {
        // if (!error.message.match(/Table .* does not exist/)) {
        // throw error;
        // }
      }
    },
    {
      // factor: 1.5,
      // onRetry: () => {
      //   log(`retrying to delete table ${table}`);
      // },
      // retries: 3,
    },
  );
};

export const retry = async (): Promise<any> => {};
