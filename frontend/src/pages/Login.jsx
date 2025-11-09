import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/products';

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authService.login(formData);
            login(response.data.token, response.data.user);
            navigate(from, {replace: true});
        } catch (err) {
            setErrors(err.response?.data?.errors || {});
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className='grid justify-center'>
            <h2 className=''>Login</h2>
                {error && <div className='text-red-500'>{error}</div>}
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
