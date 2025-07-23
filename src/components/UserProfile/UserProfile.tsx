import React from 'react';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center space-x-4">
      <Link to="/profile">
        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
      </Link>
      <button onClick={logout} className="text-white">
        Logout
      </button>
    </div>
  );
};

export default UserProfile;
