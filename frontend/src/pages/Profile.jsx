import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { User, Mail, Camera, Save } from "lucide-react";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    avatar: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Compute backend base URL robustly. Prefer explicit base, otherwise derive from VITE_BACKEND_URL
 const BACKEND_BASE =
    import.meta.env.VITE_BACKEND_BASE_URL ||
    (import.meta.env.VITE_BACKEND_URL
        ? import.meta.env.VITE_BACKEND_URL.replace("/api", "")
        : "");

    const getImageUrl = (path) => {
      if (!path) return null;
      // absolute URL — return as-is
      if (path.startsWith("http://") || path.startsWith("https://")) return path;
      // join with BACKEND_BASE if available
      if (BACKEND_BASE) {
        return `${BACKEND_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
      }
      // fallback: return raw path
      return path;
    };
  

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || "",
        email: user.email || "",
        avatar: null,
      });
        setPreview(user.avatar ? getImageUrl(user.avatar) : null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatar: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const data = new FormData();
      data.append("fullname", formData.fullname);
      data.append("email", formData.email);
      if (formData.avatar) data.append("avatar", formData.avatar);

      const response = await authService.updateProfile(user.id, data);
      updateUser(response.data.updatedUser);
      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      setMessage(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="pb-8 border-b border-gray-200">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Account Settings
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            Update your public profile information and manage your preferences.
          </p>
        </div>

        {/* Message Alert (Full Width) */}
        {message && (
          <div
            className={`my-8 p-4 rounded-lg border-l-4 ${
              message.includes("success")
                ? "bg-green-50 border-green-500 text-green-800"
                : "bg-red-50 border-red-500 text-red-800"
            }`}
          >
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}
        
        {/* Form Sections */}
        <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            
            {/* 1. Personal Info Section */}
            <div className="py-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>

                {/* Avatar and Email/Name Container (Flex for layout) */}
                <div className="flex items-center space-x-8">
                    
                    {/* Avatar Display & Update */}
                    <div className="flex-shrink-0">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 ring-4 ring-orange-500/20">
                                {preview ? (
                                    <img
                                    src={preview}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <label 
                                title="Change avatar"
                                className="absolute bottom-0 right-0 bg-orange-600 rounded-full p-2.5 shadow-xl cursor-pointer hover:bg-orange-700 transition-colors transform translate-x-1 translate-y-1"
                            >
                                <Camera className="w-4 h-4 text-white" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Name and Email Inputs (Stacked) */}
                    <div className="space-y-6 w-full">
                        {/* Full Name Field */}
                        <div>
                            <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="fullname"
                                    name="fullname"
                                    value={formData.fullname}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-800 bg-white"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-800 bg-white"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Action Button Section (Separated) */}
            <div className="py-8">
                
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`py-3 px-8 rounded-lg font-semibold text-white shadow-md transition-colors flex items-center justify-center gap-2 transform active:scale-[0.98] ${
                          loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-orange-600 hover:bg-orange-700 shadow-orange-500/30"
                        }`}
                    >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Save Changes
                          </>
                        )}
                    </button>
                </div>
            </div>

        </form>
      </div>
    </div>
  );
}