import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user')
        if (token && storedUser) {
            try {
                //const payload = JSON.parse(atob(token.split('.')[1]));
                setUser(JSON.parse(storedUser))
                //setUser({id: payload.id, email: payload.email, role: payload.role});
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);
    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }
    const updateUser = (userData) => {
        const updatedUser = {...user, ...userData};
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updateUser));
    }

    const getToken =  () => localStorage.getItem('token');
    
    const isAuthenticated = () => !!user;

    return (
        <AuthContext.Provider value={{user,login,logout,getToken,isAuthenticated,loading, updateUser}}>
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