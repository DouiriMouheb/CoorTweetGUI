import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";

export default function UserProfileEditor({ onUpdate }) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(user.username); // Assuming user has a username field
  const [profilePic, setProfilePic] = useState(user.profilePic);

  const getInitials = (name) => {
    const nameArray = name.split(" ");
    const initials = nameArray
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
    return initials;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = { email, password: password || undefined, profilePic };
    onUpdate(updatedData);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">Edit Profile</h2>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Profile Picture (Initials) Column */}
        <div className="flex items-center justify-center">
          <div className="w-32 h-32 rounded-full shadow-lg bg-blue-500 text-white flex items-center justify-center font-bold text-3xl">
            {getInitials(username)}
          </div>
        </div>

        {/* Form Column */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium w-24">Username:</label>
            <input
              disabled="true"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 p-2 border border-gray-300 shadow-md rounded-md w-full"
              required
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium w-24">Email:</label>
            <input
              disabled="true"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 p-2 border border-gray-300 shadow-md rounded-md w-full"
              required
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium w-24">New Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 p-2 border border-gray-300 shadow-md rounded-md w-full"
            />
          </div>
        </form>
      </div>

      {/* Save Changes Button (Centered Below Both Columns) */}
      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white border border-gray-300 shadow-lg rounded-md"
        >
          Update Password
        </button>
      </div>
    </div>
  );
}
