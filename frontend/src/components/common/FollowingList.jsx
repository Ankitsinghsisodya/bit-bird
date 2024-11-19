import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const UserList = ({ userId }) => {
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await fetch(`/api/users/${userId}/following`);
        const data = await res.json();
        setFollowing(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchFollowing();
  }, [userId]);

  return (
    <div className="p-4 space-y-4 bg-gray-900 text-white h-full overflow-y-auto">
      {following.map((friend) => (
        <Link
          to={`/chats/chat/${friend._id}`}
          key={friend._id}
          className="block w-100 bg-gray-800 shadow-lg p-4 no-underline text-white hover:bg-gray-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 rounded"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 overflow-hidden rounded-full bg-gray-700">
              <img src={friend.profileImg || 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg'} alt={friend.username} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-lg font-semibold">{friend.username}</p>
              <p className="text-sm text-gray-400">@{friend.username}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default UserList;
