// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        role: ''
    });
    const [error, setError] = useState('');
    const {login} = useAuth()
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authService.register(formData);
            login(response.data.token, response.data.user);
            navigate('/products');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className='grid justify-center'>
            <h2>Register</h2>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className='grid justify-center'>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullname}
                    onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                />
                {/* <input 
                type="text" 
                value={formData.role}
                placeholder='Role'
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                /> */}
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
