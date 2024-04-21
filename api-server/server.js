import express from "express";
import { queueClient } from "./queue/queueClient.js";
import session from "express-session";
import connectPG from "connect-pg-simple";
import { passport } from "./actions/authentication.js";
import { db } from "./database/db.js";
import { users, projects } from "./database/schema.js";
const app = express();
import "dotenv/config";
import z from "zod";
import { eq, and, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import cors from "cors";
import { isLoggedIn } from "./middleware/authentication.js";
import { generateSlug } from "./lib.js";
const { BUILDQUEUE, MAX_GIT_SIZE } = process.env;

let conn, gitProducerChannel;
(async () => {
  conn = await queueClient();
  gitProducerChannel = await conn.createChannel();
})();

const port = process.env.PORT || 3000;
//app.use(cors({
//   origin: ['http://localhost:3003'],
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true,
// }));

app.use(
  session({
    secret: "cats",
    resave: false,
    saveUninitialized: true,
    store: new (connectPG(session))({
      conString: process.env.POSTGRESDB,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: false,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const buildSchema = z.object({
  gitURL: z
    .string()
    .includes("github", { message: "Not a valid github URL" })
    .trim()
    .url({ message: "Not a valid URL" }),
});

const loginSchema = z.object({
  username: z.string().trim(),
  password: z.string().min(5, { message: "Password must be of 5 characters" }),
});

const registerSchema = loginSchema.extend({
  email: z.string().email(),
});

const getGitDetails = async (userName, repoName) => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${userName}/${repoName}`
    );
    if (response.status !== 200) throw Error("No repo found!");
    return response.json();
  } catch (e) {
    console.error(e);
    throw Error("Error getting git details");
  }
};

const getUserRepoName = (giturl) => {
  const girURLSplitArr = giturl.split("/");
  const length = girURLSplitArr.length;
  if (length < 1) throw Error("Not a valid github url");
  return [
    girURLSplitArr[length - 2],
    girURLSplitArr[length - 1]?.replace(".git", ""),
  ];
};

app.post("/auth/login", (req, res, next) => {
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
});

app.post("/auth/register", async (req, res, next) => {
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
});

app.post("/build", isLoggedIn, async (req, res) => {
  try {
    const body = await buildSchema.parseAsync(req.body);
    const { gitURL } = body;
    const [userName, repoName] = getUserRepoName(gitURL);
    //console.log(userName, repoName)
    const getDetails = await getGitDetails(userName, repoName);
    if (getDetails?.size > MAX_GIT_SIZE) throw Error("Repo is too large!");
    // console.log(getDetails)
    const project = {
      gitURL,
      slug: await generateSlug(),
      userId: req.user.id,
    };
    console.log(project);
    const createProject = await db
      .insert(projects)
      .values(project)
      .returning({
        slug: projects.slug,
        gitURL: projects.gitURL,
        id: projects.id,
      });
    //console.log(createProject);
    if (createProject.length !== 1)
      throw new Error("Some error occured, new project more than one or none");
    const newProject = createProject[0];
    const projectDataString = JSON.stringify(newProject);
    await gitProducerChannel.assertQueue(BUILDQUEUE, { durable: true });
    await gitProducerChannel.sendToQueue(
      BUILDQUEUE,
      Buffer.from(projectDataString),
      {
        persistent: true,
      }
    );
    return res.status(200).json(newProject);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.listen(port, console.log("Server Started on port " + port));
