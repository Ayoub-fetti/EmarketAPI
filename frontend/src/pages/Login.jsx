import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const getRedirectPath = (role) => {
        if (role === 'admin') return '/admin';
        if (role === 'seller') return '/seller';
        return '/products';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authService.login(formData);
            login(response.data.token, response.data.user);
            toast.success('Connexion réussie !');
            const targetPath = getRedirectPath(response.data.user?.role);
            navigate(targetPath, { replace: true });
        } catch (err) {
            setErrors(err.response?.data?.errors || {});
            toast.error("Erreur de connexion");
        }
    };

    return (
        <div className='grid justify-center'>
            <h2 className=''>Login</h2>
            <form onSubmit={handleSubmit} className='grid justify-center'>
                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    
                />
                {errors.email && <div className='text-red-500'>{errors.email}</div>}
                <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    
                    />
                    {errors.password && <div className='text-red-500'>{errors.password}</div>}
                <button type="submit">
                    Login
                </button>
            </form>
            <p>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
}
