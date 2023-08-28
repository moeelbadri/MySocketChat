// get DOM elements
var join = new Audio('Join Sound Effect.mp3');
var newmsg = new Audio('message_tone.mp3');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messages = document.getElementById('messages');
let username='';
// add event listener to form
const input = document.getElementById("name-input");
if(getCookie()){
  username=getCookie();
  input.value=getCookie();
}
const socket = io();
input.addEventListener("input", updateValue);

function getCookie(name) {
  let nameEQ = "username" + '=';
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function updateValue(e) {
  username = e.target.value;
  document.cookie = "username" + '=' + (username || '') + '; path=/';
}
messageForm.addEventListener('submit', e => {
  e.preventDefault();
  const message = messageInput.value;
  const msg=[message,username];
  //console.log(msg,username);
  if (message) {
    const msg=[message,username];
    socket.emit('message',msg);
    messageInput.value = '';
  }
});
socket.on('connect', () => {//oldmsg
  socket.emit('connected',['Hello, server! ',`${username}`]);
  console.log('Connected to Socket.IO server');
});
socket.on('oldmsg',(data)=>{
  console.log(data)
data.forEach(element => {
  messages.innerHTML += `<p>${element[1]}:${element[0]} - ${element[2]}</p>`;
});
});
socket.on('disconnect', () => {
  console.log('Disconnected from Socket.IO server');
});
socket.on('user', (message) => {
  if(!username){username="user "+message;}
  
  console.log('Received tempid:', message,username);
});

//socket.emit('message', `Hello, server!`);

// add event listener to socket
socket.on('message', data => {
  console.log('Received message:', data);
  console.log("message :",data[0]);
  messages.innerHTML += `<p>${data[1]}:${data[0]} -  ${data[2]}</p>`;
  messages.scrollTop = messages.scrollHeight;
  newmsg.play();
});
