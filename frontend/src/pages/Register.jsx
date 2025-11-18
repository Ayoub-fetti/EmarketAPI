// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Register() {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        role: ''
    });
    const [errors, setErrors] = useState('');
    const {login} = useAuth()
    const navigate = useNavigate();
    const getRedirectPath = (role, status) => {
        if (role === 'admin') return '/admin';
        if (role === 'seller') {
            // If seller status is pending, redirect to pending approval page
            if (status === 'pending') return '/seller/pending';
            return '/seller';
        }
        return '/products';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authService.register(formData);
            login(response.data.token, response.data.user);
            toast.success('Inscription réussie !');
            const targetPath = getRedirectPath(
                response.data.user?.role,
                response.data.user?.status
            );
            navigate(targetPath, { replace: true });
        } catch (err) {
            setErrors(err.response?.data?.errors || {});
            toast.error("Erreur lors de l'inscription");
        }
    };

    return (
        <div className='grid justify-center'>
            <h2>Register</h2>
            <form onSubmit={handleSubmit} className='grid justify-center'>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullname}
                    onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                    
                    />
                    {errors.fullname && <div className="text-red-500 mb-4">{errors.fullname}</div>}
                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    
                    />
                    {errors.email && <div className="text-red-500 mb-4">{errors.email}</div>}
                <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    
                    />
                    {errors.password && <div className="text-red-500 mb-4">{errors.password}</div>}
                <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                 <option value="">Select role</option>
                 <option value="user">User</option>
                 <option value="seller">Seller</option>
                </select>
                <button type="submit">
                    Register
                </button>
            </form>
            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}
