import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from "@tanstack/react-query";
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const ChatBox = ({ userId, friendId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [friend, setFriend] = useState(null);
  const roomId = [userId, friendId].sort().join('_');
  const { data: you } = useQuery({ queryKey: ['authUser'] });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chats/${userId}/${friendId}`, {
          method: 'GET',
        });
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchFriendDetails = async () => {
      try {
        console.log('Fetching friend details: ' + friendId);
        const res = await fetch(`/api/users/fprofile/${friendId}`, {
          method: 'GET',
        });
        const data = await res.json();
        console.log('Friend data is:', data);
        setFriend(data);
      } catch (err) {
        console.error('Error fetching friend details:', err);
      }
    };

    fetchMessages();
    fetchFriendDetails();
  }, [userId, friendId]);

  useEffect(() => {
    socket.emit('joinRoom', roomId);

    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('receiveMessage');
      socket.emit('leaveRoom', roomId);
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    try {
      await fetch('/api/chats', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: userId,
          receiver: friendId,
          message: newMessage
        })
      });
      setNewMessage('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="chat-container p-4 flex flex-col h-full">
      <div className="messages flex-grow overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`chat ${msg.sender === userId ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  src={msg.sender === userId ? (you?.profileImg || "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg") : (friend?.profileImg || "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg")}
                  alt={msg.sender === userId ? you?.username : friend?.username}
                />
              </div>
            </div>
            <div className="chat-header">
              {msg.sender === userId ? you?.username : friend?.username}
              <time className="text-xs opacity-50">{new Date(msg.timestamp).toLocaleTimeString()}</time>
            </div>
            <div className="chat-bubble">{msg.message}</div>
            <div className="chat-footer opacity-50">
              {msg.sender === userId ? 'Delivered' : ''}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow bg-gray-700 text-white border-gray-600 border rounded p-2 mr-2 focus:outline-none focus:border-blue-500"
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage} className="btn btn-primary">Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
