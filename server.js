const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 5e6 });

app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (_, res) => res.json({ ok: true }));

const rooms = new Map();
function getRoom(id) {
  if (!rooms.has(id)) rooms.set(id, { members: new Map(), photos: [] });
  return rooms.get(id);
}
function publicMembers(room) {
  return [...room.members.values()].map(({ name, avatar }) => ({ name, avatar }));
}
io.on("connection", socket => {
  socket.on("join-room", ({ roomId, name, avatar }) => {
    roomId = String(roomId || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
    name = String(name || "Guest").slice(0, 24);
    if (!roomId) return socket.emit("join-error", "Invalid room link.");
    const room = getRoom(roomId);
    if (room.members.size >= 2 && !room.members.has(socket.id)) {
      return socket.emit("join-error", "This balcony already has two guests. Ask your friend to leave first.");
    }
    socket.join(roomId);
    socket.data.roomId = roomId;
    room.members.set(socket.id, { name, avatar: avatar === "2" ? "2" : "1" });
    socket.emit("joined", { roomId, members: publicMembers(room), photos: room.photos });
    socket.to(roomId).emit("members", publicMembers(room));
    socket.to(roomId).emit("system-message", `${name} joined your balcony ❤️`);
  });

  socket.on("firework", payload => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    io.to(roomId).emit("firework", {
      x: Math.max(0.08, Math.min(0.92, Number(payload?.x) || 0.5)),
      y: Math.max(0.12, Math.min(0.72, Number(payload?.y) || 0.35)),
      hue: Math.floor(Math.random() * 360),
      by: getRoom(roomId).members.get(socket.id)?.name || "Guest",
      at: Date.now()
    });
  });

  socket.on("chat", message => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    const text = String(message || "").trim().slice(0, 300);
    if (!text) return;
    const member = getRoom(roomId).members.get(socket.id);
    io.to(roomId).emit("chat", { name: member?.name || "Guest", text, at: Date.now() });
  });

  socket.on("music-state", state => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    socket.to(roomId).emit("music-state", { playing: !!state?.playing, at: Date.now() });
  });

  socket.on("photo", data => {
    const roomId = socket.data.roomId;
    if (!roomId || typeof data?.dataUrl !== "string" || !data.dataUrl.startsWith("data:image/")) return;
    const room = getRoom(roomId);
    const photo = { id: Date.now() + "-" + Math.random().toString(36).slice(2), dataUrl: data.dataUrl.slice(0, 3_500_000), name: String(data.name || "A memory").slice(0, 40) };
    room.photos.unshift(photo);
    room.photos = room.photos.slice(0, 12);
    io.to(roomId).emit("photo", photo);
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (!roomId || !rooms.has(roomId)) return;
    const room = rooms.get(roomId);
    const member = room.members.get(socket.id);
    room.members.delete(socket.id);
    if (member) socket.to(roomId).emit("system-message", `${member.name} stepped away. Come back soon ❤️`);
    io.to(roomId).emit("members", publicMembers(room));
    if (room.members.size === 0) rooms.delete(roomId);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Our Little Balcony listening on ${port}`));
