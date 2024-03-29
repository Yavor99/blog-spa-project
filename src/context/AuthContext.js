import { createContext, useContext, useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";

import { authServiceFactory } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({
    children,
}) => {
    const [auth, setAuth] = useLocalStorage('auth', {})
    

    const navigate = useNavigate();

    const authService = authServiceFactory(auth.accessToken);

    const onLoginSubmit = async (data) => {
        try {
            const result = await authService.login(data, auth.accessToken);
            setAuth(result);
            navigate('/');
        } catch (error) {
            console.log(`There is a problem`);
        }
       
    };

    const onRegisterSubmit = async (values) => {
        try {
            const result = await authService.register(values, auth.accessToken);
            setAuth(result);
            navigate('/');
        } catch (error) {
            console.log(`There is a problem`);
        }
    };

    const onLogout = async () => {
        await authService.logout(auth.accessToken);

        setAuth({});
    };


    const contextValues = {
        onLoginSubmit,
        onRegisterSubmit,
        onLogout,  
        userId: auth._id,
        token: auth.accessToken,
        userEmail: auth.email,
        userUsername: auth.username,
        isAuth: !!auth.accessToken,
    };

    return (
        <>
            <AuthContext.Provider value={contextValues}>
                {children}
            </AuthContext.Provider>        
        </>
    );
};


export const useAuthContext = () => {
    const context = useContext(AuthContext);

    return context;
}