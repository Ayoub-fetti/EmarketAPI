// frontend/src/components/Header.jsx (ajout du logout)
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

export default function Header() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className=" text-black p-4">
            <nav className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-1 text-xl font-bold">
            FETTY<span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#D43601' }}></span>
            </Link>
                <div className="space-x-4">
                    <Link to="/">Home</Link>
                    <Link to="/products">Products</Link>
                    {isAuthenticated() ? (
                        <>
                            <span>Welcome, {user.fullname}</span>
                            <Button variant='danger' size="sm" onClick={handleLogout}>Logout</Button>
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
