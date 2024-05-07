import { registerSchema } from "../validation/auth.js";
import { passport } from "../authentication.js";
import { db } from "../../database/db.js";

export const loginController = (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    console.log(err, info, user);
    if (err) {
      return next(err); // will generate a 500 error
    }
    if (info || !user) {
      return res.status(401).json({
        success: false,
        error: info.message || "Unknown occured error!",
      });
    }
    req.login(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.status(200).json({ message: "authentication succeeded" });
    });
  })(req, res, next);
};

export const registerController = async (req, res, next) => {
  try {
    const body = await registerSchema.parseAsync(req.body);
    const { username, email, password } = body;
    const checkUsername = await db.query.users.findFirst({
      where: or(eq(username, users.username), eq(email, users.email)),
    });
    //console.log(checkUsername);
    if (checkUsername) throw new Error("Username or email already exists!");
    const hashPass = await bcrypt.hash(password, 10);

    const newUser = await db
      .insert(users)
      .values({
        username,
        password: hashPass,
        email,
      })
      .returning({ id: users.id });
    if (newUser.length != 1)
      throw new Error("Some error occured, new user more than one or none");
    return res.status(200).json({ token: newUser[0] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};