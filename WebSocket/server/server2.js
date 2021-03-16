const server = require("http").createServer();
const io = require("socket.io")(server, {
    cors: { // 设置可以可以共享的源
        origin: "http://127.0.0.1:3000",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
  console.log("connection!!!!")
  socket.on('hello', (msg) => {
    io.emit('message', `${msg}, Candice`);
  })
});
server.listen('4000', () => {
    console.log('4000服务器已经启动...')
});