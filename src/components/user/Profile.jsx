import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Calendar,
  Shield,
  ArrowLeft,
  Edit,
  Save,
  X,
} from "lucide-react";

const Profile = ({ mode = "user" }) => {
  const isAdmin = mode === "admin";

  const tokenKey = isAdmin ? "adminToken" : "token";

  const endpoints = {
    fetchProfile: isAdmin ? "/api/admin/profile" : "/api/users/profile",

    updateDetails: isAdmin
      ? "/api/admin/profile/details"
      : "/api/users/profile/details",

    updateBilling: isAdmin
      ? "/api/admin/profile/billing"
      : "/api/users/profile/billing",
  };

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [billing, setBilling] = useState({});
  const [editBilling, setEditBilling] = useState(false);
  const [editDetails, setEditDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});

  const billingLabels = {
    companyName: "Company Name",
    phoneNumber: "Phone Number",
    streetAddress: "Street Address",
    streetAddress2: "Street Address 2",
    city: "City",
    state: "State",
    postcode: "Postcode",
    country: "Country",
    taxId: "Tax ID",
  };

  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem(tokenKey);
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}${endpoints.fetchProfile}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setProfile(data);
        setEditedUser(data);
        setBilling(data.billingAddress || {});
      } catch (err) {
        toast.error(err);
        localStorage.removeItem(tokenKey);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, BASE_URL, tokenKey, endpoints.fetchProfile]);

  const handleCancel = () => {
    setIsEditing(false);
    setEditDetails(false);
    setEditedUser(profile);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const saveDetails = async () => {
    const token = localStorage.getItem(tokenKey);

    try {
      const res = await fetch(`${BASE_URL}${endpoints.updateDetails}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: editedUser.firstName,
          lastName: editedUser.lastName,
        }),
      });

      if (!res.ok) {
        throw new Error("Update failed");
      }

      // Update the profile state with the edited user data
      const updatedProfile = { ...profile, ...editedUser };
      setProfile(updatedProfile);

      // Reset editing states
      setEditDetails(false);
      setIsEditing(false);

      // Optional: Show success message
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to save details:", error);
      // Optional: Show error message to user
    }
  };

  const saveBilling = async () => {
    const token = localStorage.getItem(tokenKey);
    if (!isValidPhoneNumber(billing.phoneNumber)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}${endpoints.updateBilling}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(billing),
      });

      if (!res.ok) {
        throw new Error("Update failed");
      }

      // Update the profile state with new billing data
      const updatedProfile = {
        ...profile,
        billingAddress: { ...billing },
      };
      setProfile(updatedProfile);

      // Reset billing edit mode
      setEditBilling(false);

      // Optional: Show success message
      toast.success("Billing address updated successfully!");
    } catch (error) {
      toast.error("Failed to save billing:", error);
      // Optional: Show error message to user
    }
  };

  const isValidPhoneNumber = (phone) => {
    if (!phone) return false;

    const digitsOnly = phone.replace(/\D/g, "");
    return digitsOnly.length === 10;
  };

  // Reset billing data when canceling edit
  const handleCancelBilling = () => {
    setEditBilling(false);
    setBilling(profile.billingAddress || {});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e1525] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0e1525] flex items-center justify-center">
        <div className="text-white">No profile data found</div>
      </div>
    );
  }

  // Format date if it exists
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";

    try {
      // If it's a timestamp (in seconds), convert to milliseconds
      if (typeof dateString === "number" && dateString < 10000000000) {
        dateString = dateString * 1000;
      }

      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      toast.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Decode JWT token for additional info
  let decodedToken = {};
  try {
    const token = localStorage.getItem(tokenKey);
    if (token) {
      decodedToken = jwtDecode(token);
    }
  } catch (error) {
    toast.error("Error decoding token:", error);
  }

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
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      name="firstName"
                      value={editedUser.firstName || ""}
                      onChange={handleInputChange}
                      className="text-2xl font-bold bg-transparent border-b border-gray-600 focus:outline-none focus:border-[#4f46e5]"
                      placeholder="Enter first name"
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={editedUser.lastName || ""}
                      onChange={handleInputChange}
                      className="text-lg bg-transparent border-b border-gray-600 focus:outline-none focus:border-[#4f46e5]"
                      placeholder="Enter last name"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-white">
                      {profile.firstName} {profile.lastName}
                    </h1>
                  </>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">{profile.email}</span>
                </div>
              </div>
            </div>
            <div>
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={saveDetails}
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
                  onClick={() => {
                    setIsEditing(true);
                    setEditDetails(true);
                    setEditedUser({ ...profile });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#4f46e5] text-white rounded-lg hover:bg-[#4338ca] transition"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Information */}
          <div className="bg-[#121a2a] rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">First Name</label>
                {editDetails ? (
                  <input
                    value={editedUser.firstName || ""}
                    onChange={(e) =>
                      setEditedUser({
                        ...editedUser,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full mt-1 px-3 py-2 bg-[#0e1525] border border-gray-600 rounded-lg focus:outline-none focus:border-[#4f46e5]"
                  />
                ) : (
                  <p className="text-white mt-1">{profile.firstName}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-400">Last Name</label>
                {editDetails ? (
                  <input
                    value={editedUser.lastName || ""}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, lastName: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 bg-[#0e1525] border border-gray-600 rounded-lg focus:outline-none focus:border-[#4f46e5]"
                  />
                ) : (
                  <p className="text-white mt-1">{profile.lastName}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="text-white mt-1">{profile.email}</p>
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
                  {profile.id || profile._id || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-400">Role</label>
                <div className="mt-1">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm
  ${isAdmin ? "bg-red-600/20 text-red-400" : "bg-indigo-600/20 text-indigo-400"}`}
                  >
                    {profile.role}
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
          <h2 className="text-lg font-semibold text-white mb-4">
            Additional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400">Token Issued At</label>
              <p className="text-white mt-1">
                {decodedToken.iat ? formatDate(decodedToken.iat) : "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Token Expires</label>
              <p className="text-white mt-1">
                {decodedToken.exp ? formatDate(decodedToken.exp) : "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Issuer</label>
              <p className="text-white mt-1">{decodedToken.iss || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Billing Address Section */}
        <div className="bg-[#121a2a] rounded-xl border border-gray-700 p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">
              Billing Address
            </h2>
            {!editBilling ? (
              <button
                onClick={() => setEditBilling(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#4f46e5] text-white rounded-lg hover:bg-[#4338ca] transition"
              >
                <Edit className="w-4 h-4" />
                Edit Billing
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={saveBilling}
                  className="flex items-center gap-2 px-4 py-2 bg-[#4f46e5] text-white rounded-lg hover:bg-[#4338ca] transition"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleCancelBilling}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(billingLabels).map(([key, label]) => (
              <div key={key} className="mb-3">
                <label className="text-sm text-gray-400">{label}</label>
                {editBilling ? (
                  <input
                    value={billing[key] || ""}
                    onChange={(e) =>
                      setBilling({ ...billing, [key]: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 bg-[#0e1525] border border-gray-600 rounded-lg focus:outline-none focus:border-[#4f46e5]"
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                ) : (
                  <p className="text-white mt-1">
                    {profile.billingAddress?.[key] || "Not provided"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
