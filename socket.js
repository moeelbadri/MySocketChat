const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
let counter =0;
let oldmsgs=[];
let oldusers=[];
app.use(express.static(__dirname + '/public'));

io.on('connection', socket => {
  counter++;
  let currentuserid=counter;
  let currentusername;
  io.to(socket.id).emit( 'oldmsg', oldmsgs );
  //io.emit('oldmsg',oldmsgs);
  io.to(socket.id).emit('user', counter);
  //oldmsgs.push(['Hello, server! ',`user ${counter}`]);
  console.log('user',counter,' connected');
  socket.on('connected',(data)=>{
    currentusername=data[1];
    if(currentusername){
      io.emit('message', ['Hello, server! ',`user ${currentusername}`]);
    }else{
      io.emit('message', ['Hello, server! ',`user ${currentuserid}`]);
    }
  console.log(data);
})
  socket.on('message', (data) => {
    currentusername=data[1];
    oldmsgs.push(data);
    //oldusers.push
    console.log(oldmsgs);
    console.log('message: ', data);
    io.emit('message', data);
  });

  socket.on('disconnect', () => {
    //oldmsgs.push(['Good night, server! ',`user ${counter}`]);
    if(currentusername){
      io.emit('message', ['Good night, server! ',`user ${currentusername}`]);
      console.log('user',currentusername,' disconnected ',);
    }else{
      io.emit('message', ['Good night, server! ',`user ${currentuserid}`]);
      console.log('user',currentuserid,' disconnected ',);
    }
    counter--;
    
  });
});
// Generate RSA key pair (public and private keys)
async function generateRSAKeyPair() {
  const keys = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  return keys;
}
// Encrypt data using RSA public key
async function encryptData(data, publicKey) {
  const encodedData = new TextEncoder().encode(data);
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    encodedData
  );

  return new Uint8Array(encryptedData);
}
// Decrypt data using RSA private key
async function decryptData(encryptedData, privateKey) {
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    privateKey,
    encryptedData
  );

  return new TextDecoder().decode(decryptedData);
}

const PORT = process.env.PORT || 80;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
 