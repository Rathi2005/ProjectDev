import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  User,
  Mail,
  Calendar,
  Shield,
  ArrowLeft,
  Edit,
  Save,
  X
} from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // Decode the JWT token
      const decoded = jwtDecode(token);
      setUser(decoded);
      setEditedUser(decoded);
    } catch (error) {
      console.error("Failed to decode token:", error);
      localStorage.removeItem("token");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedUser),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsEditing(false);
        
        // Update token if new one is returned
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e1525] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Format date if it exists
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#0e1525] text-gray-200">
      {/* Header */}
      <header className="bg-[#121a2a] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-[#121a2a] rounded-xl border border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editedUser.name || ""}
                    onChange={handleInputChange}
                    className="text-2xl font-bold bg-transparent border-b border-gray-600 focus:outline-none focus:border-[#4f46e5]"
                    placeholder="Enter name"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-white">
                    {user.name || "User"}
                  </h1>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editedUser.email || ""}
                      onChange={handleInputChange}
                      className="text-gray-400 bg-transparent border-b border-gray-600 focus:outline-none focus:border-[#4f46e5]"
                      placeholder="Enter email"
                    />
                  ) : (
                    <span className="text-gray-400">{user.email}</span>
                  )}
                </div>
              </div>
            </div>
            <div>
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-[#4f46e5] text-white rounded-lg hover:bg-[#4338ca] transition"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-[#4f46e5] text-white rounded-lg hover:bg-[#4338ca] transition"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Information */}
          <div className="bg-[#121a2a] rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Username</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={editedUser.username || ""}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 bg-[#0e1525] border border-gray-600 rounded-lg focus:outline-none focus:border-[#4f46e5]"
                    placeholder="Enter username"
                  />
                ) : (
                  <p className="text-white mt-1">{user.username || "Not set"}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Member Since</label>
                <p className="text-white mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="bg-[#121a2a] rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security & Roles
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">User ID</label>
                <p className="text-white mt-1 font-mono text-sm break-all">
                  {user.id || user._id || "N/A"}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Role</label>
                <div className="mt-1">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white rounded-full text-sm">
                    {user.role || "User"}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Account Status</label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/30 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="mt-6 bg-[#121a2a] rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400">Token Issued At</label>
              <p className="text-white mt-1">
                {user.iat ? formatDate(user.iat * 1000) : "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Token Expires</label>
              <p className="text-white mt-1">
                {user.exp ? formatDate(user.exp * 1000) : "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Issuer</label>
              <p className="text-white mt-1">{user.iss || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 bg-red-900/10 border border-red-700/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
          <p className="text-gray-400 mb-4">
            These actions are irreversible. Please proceed with caution.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Delete Account
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className="px-4 py-2 border border-red-600 text-red-400 rounded-lg hover:bg-red-900/30 transition"
            >
              Clear Session Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;