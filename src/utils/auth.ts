import { authenticate, initialize, use } from "passport";
import { getUsers, verifyApiKey, verifyPassword } from "../controllers/user";
import { BasicStrategy } from "passport-http";
import { Express } from "express";
import log from "./logger";
import { Strategy } from "passport-http-bearer";

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

use(
  new Strategy(
    async (token, done): Promise<void> => {
      try {
        const user = await verifyApiKey(token);
        if (user) {
          return done(null, user);
        }
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
  app.use(authenticate(["basic", "bearer"], { session: false }));
};

export default setup;
