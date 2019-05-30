const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

    app.use('/css',express.static(__dirname +'/template/css'));
    app.use('/fonts',express.static(__dirname +'/template/fonts'));
    app.use('/img',express.static(__dirname +'/template/img'));
    app.use('/sass',express.static(__dirname +'/template/sass'));
    app.use('/js',express.static(__dirname +'/template/js'));

// 加入線上人數計數
let onlineCount = 0;

app.get('/', (req, res) => {
    res.sendFile( __dirname + '/views/index.html');
});

app.get('/template', (req, res) => {

    res.sendFile( __dirname + '/template/index.html');
});

io.on('connection', (socket) => {
    // 有連線發生時增加人數
    onlineCount++;
    // 發送人數給網頁
    io.emit("online", onlineCount);

    socket.on("greet", () => {
        socket.emit("greet", onlineCount);
    });

    socket.on("send", (msg) => {
        // 如果 msg 內容鍵值小於 2 等於是訊息傳送不完全
        // 因此我們直接 return ，終止函式執行。
        if (Object.keys(msg).length < 2) return;

        var timeInMs = Date.now();
        msg.time = timeInMs;

        // 廣播訊息到聊天室
        io.emit("msg", msg);
    });

    socket.on('disconnect', () => {
        // 有人離線了，扣人
        onlineCount = (onlineCount < 0) ? 0 : onlineCount-=1;
        io.emit("online", onlineCount);
    });
});

server.listen(3000, () => {
    console.log("Server Started. http://localhost:3000");
});