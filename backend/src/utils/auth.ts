import { getUsers, verifyApiKey, verifyPassword } from "../controllers/user";
import { BasicStrategy } from "passport-http";
import { Express } from "express";
import log from "./logger";
import passport from "passport";
import { Strategy } from "passport-http-bearer";

passport.use(
  new BasicStrategy(async (username, password, done): Promise<void> => {
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
    } catch (error: any) {
      log.error(error.message, { error });
      return done(error);
    }
  }),
);

passport.use(
  new Strategy(async (token, done): Promise<void> => {
    try {
      const user = await verifyApiKey(token);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error: any) {
      log.error(error.message, { error });
      return done(error);
    }
  }),
);

const setup = (app: Express): void => {
  app.use(passport.initialize());
  app.use(passport.authenticate(["basic", "bearer"], { session: false }));
};

export default setup;
