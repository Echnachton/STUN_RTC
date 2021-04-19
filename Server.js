//Sockets
const express = require("express");
const app = express();
const port = process.env.PORT || 4444;
const server = app.listen(port,_=>{
    console.log("API server up");
});
const io = require("socket.io")(server,{
    cors: {
        origin: "*",
      }
});

const queue = [];
io.on("connection", async socket => {
    const set = await io.allSockets();
    io.emit("nopUpdate", set.size);
    socket.on("register",_=>{
        queue.push(socket.id);
        if(queue.length%2==0){
            target = queue[queue.indexOf(socket.id)-1];
            self = queue[queue.indexOf(socket.id)];
            io.to(target).emit("targetPeer",self);
            io.to(self).emit("selfPeer",target);
        }
    });
    socket.on("resPeerT", data=>{
        io.to(data.target).emit("call",data.peerId);
    });
    socket.on("resPeerS", data=>{
        io.to(data.target).emit("ans",data.peerId);
    });
    socket.on("disconnect", async reason =>{
        const id = socket.id;
        const index = queue.indexOf(id)
        queue.splice(index,1);
        if(reason == "transport close"){
            !index%2==0 ? io.to(queue[index-1]).emit("bootV") : io.to(queue[index]).emit("bootV");
        }
        let set = await io.allSockets();
        io.emit("nopUpdate", set.size);
    });
});

//STUN server
const { PeerServer } = require("peer");
const peerServer = PeerServer({port:4445, path:"/"});