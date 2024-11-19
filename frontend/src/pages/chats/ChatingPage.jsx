import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import UserList from '../../components/common/FollowingList.jsx';
import ChatBox from '../../components/common/chatBox.jsx';

const ChatPage = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const userId = authUser?._id;

  return (
    <div className="flex flex-grow h-screen bg-gray-900 text-white">
      <div className="user-list-container w-full md:w-2/5 lg:w-1/3 border-r border-gray-700">
        {userId && <UserList userId={userId} />}
      </div>
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<NoChatSelected />} />
          <Route path="chat/:friendId" element={<ChatBoxWrapper userId={userId} />} />
        </Routes>
      </div>
    </div>
  );
};

const NoChatSelected = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <h2 className="text-2xl text-gray-500">Select a user to start chatting</h2>
    </div>
  );
};

const ChatBoxWrapper = ({ userId }) => {
  const { friendId } = useParams();
  return <ChatBox userId={userId} friendId={friendId} />;
};

export default ChatPage;
