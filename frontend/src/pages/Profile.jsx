import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { User, Mail, Camera, Save } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    avatar: null
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || '',
        email: user.email || '',
        avatar: null
      });
setPreview(user.avatar ? `http://localhost:3000${user.avatar}` : null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const data = new FormData();
      data.append('fullname', formData.fullname);
      data.append('email', formData.email);
      if (formData.avatar) data.append('avatar', formData.avatar);
      
      const response = await authService.updateProfile(user.id, data);
      updateUser(response.data.updatedUser);
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      setMessage(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-orange-600 px-8 py-10">
            <h1 className="text-3xl font-bold text-white text-center">My Profile</h1>
            <p className="text-blue-100 text-center mt-2">Manage your account information</p>
          </div>

          <div className="px-8 py-10">
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-orange-400 shadow-lg">
                  {preview ? (
                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-3 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors border-2 border-orange-500">
                  <Camera className="w-5 h-5 text-orange-600" />
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-3">Click the camera icon to update avatar</p>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes('success') 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <p className="text-sm font-medium">{message}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
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
        </div>
      </div>
    </div>
  );
}
