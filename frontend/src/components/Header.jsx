// frontend/src/components/Header.jsx (ajout du logout)
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-blue-600 text-white p-4">
            <nav className="flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">E-Market</Link>
                <div className="space-x-4">
                    <Link to="/products">Products</Link>
                    {isAuthenticated() ? (
                        <>
                            <span>Welcome, {user.fullname}</span>
                            <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
