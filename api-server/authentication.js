import passport from "passport";
import LocalStrategy from "passport-local";
import { db } from "../database/db.js";
import { users } from "../database/schema.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(username, users.username),
      });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      //console.log(user)
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      const { id } = user;
      return done(null, { id, username });
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  //console.log("deserialize");
  try {
    const user = await db.query.users.findFirst({
      where: eq(id, users.id),
      columns: {
        id: true,
        username: true,
      },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export { passport };
