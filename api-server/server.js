import express from "express";
import { queueClient } from "./queue/queueClient.js";
import session from "express-session";
import connectPG from "connect-pg-simple";
import { passport } from "./authentication.js";
const app = express();
import "dotenv/config";
import cors from "cors";
import authRouter from './routes/auth.js'
import projectRouter from './routes/project.js'
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







app.use("/auth", authRouter);

app.post("/project", projectRouter);

app.use((err, req, res, next) => {
  res.status(400).json({error: "Unknown error occured processing your request!"})
})

app.listen(port, console.log("Server Started on port " + port));
