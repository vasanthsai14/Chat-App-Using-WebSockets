const socket = io();
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("message");
const nicknameInput = document.getElementById("nickname");
const allMessages = document.getElementById("messages");
const typingIndicator = document.getElementById("typing");
const usersList = document.getElementById("users");
const userSelect = document.getElementById("userSelect");

let nickname = '';

nicknameInput.addEventListener("input", () => {
    nickname = nicknameInput.value;
});

messageInput.addEventListener("input", () => {
    if (nickname) {
        socket.emit("typing", nickname);
    }
});

sendBtn.addEventListener("click", (e) => {
    const message = messageInput.value;
    nickname = nicknameInput.value;
    const recipient = userSelect.value;

    if (!nickname) {
        alert('Please enter a nickname');
        return;
    }

    if (!message) {
        return;
    }

    appendMessage(`You: ${message}`);
    socket.emit("user-message", { nickname, message, recipient });
    messageInput.value = '';
});

socket.on("message", (data) => {
    appendMessage(`${data.nickname}: ${data.message}`);
});

socket.on("private-message", (data) => {
    appendMessage(`Private from ${data.nickname}: ${data.message}`);
});

socket.on("typing", (user) => {
    typingIndicator.innerText = `${user} is typing...`;
    setTimeout(() => {
        typingIndicator.innerText = '';
    }, 1000);
});

socket.on("user-connected", (user) => {
    appendMessage(`${user} has connected`);
    updateUsersList();
});

socket.on("user-disconnected", (user) => {
    appendMessage(`${user} has disconnected`);
    updateUsersList();
});

socket.on("update-users", (users) => {
    usersList.innerHTML = '';
    userSelect.innerHTML = '<option value="">Everyone</option>';
    users.forEach(user => {
        const li = document.createElement('li');
        li.innerText = user;
        usersList.appendChild(li);

        const option = document.createElement('option');
        option.value = user;
        option.innerText = user;
        userSelect.appendChild(option);
    });
});

function appendMessage(message) {
    const p = document.createElement("p");
    p.innerText = message;
    allMessages.appendChild(p);
}

function updateUsersList() {
    socket.emit("get-users");
}


