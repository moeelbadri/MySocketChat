const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
let counter =0;
let oldmsgs=[];
let olddates=[];
app.use(express.static(__dirname + '/public'));

io.on('connection', socket => {
  socket.join("some room");
  counter++;
  let currentuserid=counter;
  let currentusername;
  io.to(socket.id).emit( 'oldmsg', oldmsgs );
  //io.emit('oldmsg',oldmsgs);
  io.to(socket.id).emit('user', counter);
  //oldmsgs.push(['Hello, server! ',`user ${counter}`]);
  console.log('user',counter,' connected');
  socket.on('connected',(data)=>{
    const currentDate = new Date().toLocaleString(); // You can customize the format here

    currentusername=data[1];
    if(currentusername){
      io.emit('message', ['Hello, server! ',`user ${currentusername}`,`${currentDate}`]);
    }else{
      io.emit('message', ['Hello, server! ',`user ${currentuserid}`,`${currentDate}`]);
    }
  console.log(data);
})
  socket.on('message', (data) => {
    const currentDate = new Date().toLocaleString(); // You can customize the format here

    currentusername=data[1];
    data[2] = currentDate;
    console.log(currentDate)
    oldmsgs.push(data);
    //oldusers.pushs
    console.log(oldmsgs);
    console.log('message: ', data);
    io.emit('message', data);
  });

  socket.on('disconnect', () => {
    //oldmsgs.push(['Good night, server! ',`user ${counter}`]);
    const currentDate = new Date().toLocaleString(); // You can customize the format here

    if(currentusername){
      io.emit('message', ['Good night, server! ',`user ${currentusername}`,`${currentDate}`]);
      console.log('user',currentusername,' disconnected ',);
    }else{
      io.emit('message', ['Good night, server! ',`user ${currentuserid}`,`${currentDate}`]);
      console.log('user',currentuserid,' disconnected ',);
    }
    counter--;
    
  });
});


const PORT = process.env.PORT || 80;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
 