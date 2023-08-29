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
  newmsg.play()
}); 

// Check if the PublicKeys exist in localStorage
if (!localStorage.getItem("PublicKeys")) {
}

// Generate RSA key pair and store in localStorage
async function generateAndStoreRSAKeyPair() {
  console.log("test")
  try {
    const keys = await generateRSAKeyPair();
    console.log(keys)
    const publicKey = keys.publicKey;
    const privateKey = keys.privateKey;

    // Store the keys in localStorage
    const keyPair = {
      publicKey: publicKey,
      privateKey: privateKey
    };
    localStorage.setItem("PublicKeys", JSON.stringify(keyPair));
    console.log(await decryptData(await encryptData("Please remember that passphrase-based encryption is less secure than using a strong encryption key. If security is a concern, you might consider using a proper key management system and following best practices for key security.",publicKey), privateKey))
    console.log("RSA key pair generated and stored in localStorage");
  } catch (error) {
    console.error("Error generating and storing RSA key pair:", error);
  }
}

// Generate RSA key pair
async function generateRSAKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: 'SHA-256'
    },
    true,
    ['encrypt', 'decrypt']
  );

  return keyPair;
}
generateRSAKeyPair().then((keyPair) => {
  const publicKey = keyPair.publicKey;
  const privateKey = keyPair.privateKey;

  // Use the keys here
  console.log('Public Key:', publicKey);
  console.log('Private Key:', privateKey);
});
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

// Generate a symmetric key
async function generateSymmetricKey() {
  return window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data using the symmetric key
async function encryptDataWithSymmetricKey(data, symmetricKey) {
  const encodedData = new TextEncoder().encode(data);
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    symmetricKey,
    encodedData
  );

  return { iv: iv, encryptedData: encryptedData };
}

// Combine asymmetric and symmetric encryption

async function encryptAndStoreData(data, publicKey) {
  try {
    const keyPair = await generateSymmetricKey();
    const symmetricKey = keyPair;

    // Encrypt data using the symmetric key
    const { iv, encryptedData } = await encryptDataWithSymmetricKey(data, symmetricKey);

    // Encrypt symmetric key using recipient's public key
    const encryptedSymmetricKey = await encryptData(symmetricKey, publicKey);

    // Store the encrypted data and encrypted symmetric key
    const encryptedDataAndKey = {
      iv: iv,
      encryptedData: encryptedData,
      encryptedSymmetricKey: encryptedSymmetricKey
    };
    localStorage.setItem("EncryptedDataAndKey", JSON.stringify(encryptedDataAndKey));

    console.log("Data encrypted and stored");
  } catch (error) {
    console.error("Error encrypting and storing data:", error);
  }
}

document.getElementById('keys').addEventListener('click', () => {
  try {

    generateAndStoreRSAKeyPair();
  } catch (err) {
    console.log(err);
  }
});