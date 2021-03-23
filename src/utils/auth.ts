import { authenticate, initialize, use } from "passport";
import { getUsers, verifyPassword } from "../controllers/user";
import { BasicStrategy } from "passport-http";
import { Express } from "express";
import log from "./logger";

use(
  new BasicStrategy(
    async (username, password, done): Promise<void> => {
      try {
        // Allow login if no users exists
        const users = await getUsers();
        if (users.length === 0) {
          return done(null, {});
        }
        const user = await verifyPassword(username, password);
        if (user && user.name) {
          return done(null, user);
        }
        log.warn("Login failed", { username });
        return done(null, false);
      } catch (error) {
        log.error(error.message, { error });
        return done(error);
      }
    },
  ),
);

const setup = (app: Express): void => {
  app.use(initialize());
  app.use(authenticate("basic", { session: false }));
};

export default setup;
