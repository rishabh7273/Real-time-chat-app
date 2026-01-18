import express from "express";
import "dotenv/config";
import cookiParser from "cookie-parser"
// import dotenv from "dotenv"
import router from "./routes/auth.js";
import messagerouter from "./routes/message.js";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./lib/db.js";
import cors from "cors"
import { ENV } from "./lib/env.js";
import { app , server } from "./lib/socket.js";

// dotenv.config();

// const app = express()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "5mb" })); //req.body

app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

app.use(cookiParser()) // for ayth.middleware.js 
app.use("/api/auth", router);
app.use("/api/message", messagerouter);


//for deployment 

if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../../Frontend/dist");
  app.use(express.static(frontendPath));
  app.get('/{*splat}', (_, res) => {
     res.sendFile(path.join(__dirname, "../Frontend", "dist", "index.html"));
  });
}

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  connectDB();
})