import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { CommonInput } from "./components/CommonInput";
import { ChatList } from "./components/ChatList";

const socket = io();

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [login, setLogin] = useState(false);
  const [privateChatActive, setPrivateChatActive] = useState(false);

  useEffect(() => {
    socket.on("message", handleMessageReceived);
    socket.on("userJoined", handleUserJoined);
    socket.on("userLeft", handleUserLeft);
    return () => {
      socket.off("message", handleMessageReceived);
      socket.off("userJoined", handleUserJoined);
      socket.off("userLeft", handleUserLeft);
    };
  }, []);

  const handleMessageReceived = (message) => {
    setChat((prevChat) => [...prevChat, message]);
    if (!document.hasFocus()) {
      showNotification(message);
    }
  };

  const handleUserJoined = (users) => {
    setOnlineUsers(users);
  };

  const handleUserLeft = (users) => {
    setOnlineUsers(users);
  };

  const handleJoin = () => {
    setLogin(true);
    socket.emit("join", username);
  };

  const handlePrivateChat = (user) => {
    setSelectedUser(user);
    setPrivateChatActive(true);
  };

  const handleSwitchToGroupChat = () => {
    setSelectedUser(null);
    setPrivateChatActive(false);
  };

  const handleMessageSend = () => {
    if (selectedUser && privateChatActive) {
      socket.emit("privateMessage", { to: selectedUser, message });
    } else {
      socket.emit("message", message);
    }
    setMessage("");
  };

  const showNotification = (message) => {
    if (Notification.permission === "granted") {
      new Notification("New Message", {
        body: message,
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("New Message", {
            body: message,
          });
        }
      });
    }
  };

  return (
    <div className="">
      <div className=" text-center p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400">
        <span className="font-large text-2xl">Chat Application</span>
      </div>
      {login ? (
        selectedUser && privateChatActive ? (
          <div className="p-5">
            <div className="grid grid-cols-3 gap-4 grid-flow-row">
              <div className="p-5 row-start-1 row-end-4">
                <h2>Chatting with {selectedUser}</h2>
                <button
                  onClick={handleSwitchToGroupChat}
                  type="button"
                  className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
                >
                  Switch to Group Chat
                </button>
              </div>
              <ChatList chat={chat} username={username} />
            </div>

            <CommonInput
              callback={handleMessageSend}
              value={message}
              setValue={setMessage}
              name="Send"
              placeholder="Write your message here..."
            />
          </div>
        ) : (
          <div className="p-5">
            <div className="grid grid-cols-3 gap-4 grid-flow-row">
              <div className="p-5 row-start-1 row-end-4">
                <h2 className="">Online Users:</h2>
                <ul>
                  {onlineUsers.map((user, index) => (
                    <li
                      key={index}
                      className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400"
                    >
                      {user}
                      {"  "}
                      {username !== user ? (
                        <button
                          className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
                          onClick={() => handlePrivateChat(user)}
                        >
                          Chat Privately
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
              <ChatList chat={chat} username={username} />
            </div>
            <div className=" mt-5">
              <CommonInput
                callback={handleMessageSend}
                value={message}
                setValue={setMessage}
                name="Send"
                placeholder="Write your message here..."
              />
            </div>
          </div>
        )
      ) : (
        <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <CommonInput
            callback={handleJoin}
            value={username}
            setValue={setUsername}
            name="Join"
            placeholder="Enter your username"
          />
        </div>
      )}
    </div>
  );
}

export default App;
