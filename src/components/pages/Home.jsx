import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // State to track the selected user
  const username = useSelector((state) => state.user.user?.username || 'Guest');
console.log("selected",selectedUser)
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/userall`, { method: 'GET' });
        if (userResponse.ok) {
          const data = await userResponse.json();
          setUsers(data);
        } else {
          console.error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    const fetchMessage = async () => {
      try {
        const userResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/messageall`, { method: 'GET' });
        if (userResponse.ok) {
          const data = await userResponse.json();
          setMessages(data);
          console.log("this is messages",data)
        } else {
          console.error('Failed to fetch Messages');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
     fetchMessage();
    socketRef.current = io(`${process.env.REACT_APP_BACKEND_URL}`);
    socketRef.current.on('private message', (msg) => {
      // Update messages only if it's for the currently selected user
      if (msg.sender === selectedUser || msg.receiver === username) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('private message');
        socketRef.current.disconnect();
      }
    };
  }, [selectedUser, username]);

  const sendMessage = async () => {
    if (input.trim() && selectedUser) {
      const message = { sender: username, receiver: selectedUser, content: input };
      socketRef.current.emit('private message', message);
      setMessages((prev) => [...prev, message]);
      setInput('');
  
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
  
        if (response.ok) {
          console.log("Message saved to DB");
        } else {
          const errorData = await response.json();
          console.error("Failed to save message:", errorData.message);
        }
      } catch (error) {
        console.error("Error saving message:", error);
      }
    }
  };
  

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 border-r border-gray-300">
        <div className="flex flex-col items-center mb-6">
          <img
            className="w-20 h-20 rounded-full mb-2"
            src="path/to/profile-pic.jpg" // Replace with dynamic source
            alt="Admin"
          />
          <p className="text-lg font-semibold">{username} (Admin)</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-3">Online Users</h2>
          <div className="space-y-2">
            {users
              .filter((user) => user.username !== username) // Exclude admin from user list
              .map((user, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedUser(user.username)} // Select user on click
                  className={`p-2 border-b border-gray-300 cursor-pointer ${
                    selectedUser === user.username ? 'bg-blue-100' : ''
                  }`}
                >
                  {user.username}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow p-6 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-300 pb-2 mb-4">
              <h2 className="text-xl font-semibold">Chat with {selectedUser}</h2>
            </div>

        {/* Message Display */}
<div className="flex-grow overflow-y-auto border border-gray-300 p-4 bg-gray-50 space-y-4">
  {messages.map((msg, index) => (
    <div key={index} className="flex items-start">
      {/* Display messages only between the logged-in admin and the selected user */}
      {(msg.sender === username && msg.receiver === selectedUser) ||
      (msg.receiver === username && msg.sender === selectedUser) ? (
        <div>
          <p
            className={`font-semibold mr-2 ${
              msg.sender === username ? 'text-green-600' : 'text-blue-600'
            }`}
          >
            {msg.sender}:
          </p>
          <p className="bg-white p-2 rounded-lg shadow-md">{msg.content}</p>
        </div>
      ) : null}
    </div>
  ))}
</div>


            {/* Input Section */}
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message"
                className="flex-grow border border-gray-300 rounded-lg p-2"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-gray-500">
            Select a user to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
