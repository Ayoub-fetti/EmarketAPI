import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({id: payload.id, email: payload.email, role: payload.role});
            } catch {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);
    const login = (token, userData) => {
        localStorage.setItem('token', token);
        setUser(userData);
    };
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    }
    const getToken =  () => localStorage.getItem('token');
    
    const isAuthenticated = () => !!user;

    return (
        <AuthContext.Provider value={{user,login,logout,getToken,isAuthenticated,loading}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}