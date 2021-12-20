import { config } from "dotenv";
config();

import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let lines = [];

app.set("view engine", "ejs");
app.use(express.static("public", { dotfiles: "ignore" }));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/view", (req, res) => {
  res.render("view", { qr: process.env.QR_CODE_URL });
});

io.on("connection", (socket) => {
  socket.emit("init", lines);

  socket.on("draw", (data) => {
    lines.push(data);
    socket.broadcast.emit("draw", data);
  });
});

setInterval(() => {
  const SECONDS = 300;

  const now = Math.floor(Date.now() / 1000);

  const secondsLeft = Math.abs((now % SECONDS) - SECONDS);

  io.emit("secondsLeft", secondsLeft);

  if (secondsLeft == SECONDS) {
    lines = [];
    io.emit("init", lines);
  }
}, 1000);

server.listen(3000, () => {
  console.log("app started");
});
