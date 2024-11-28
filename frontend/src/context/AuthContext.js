// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [localCity, setLocalCity] = useState(() => sessionStorage.getItem('city') || '');
    const [localDate, setLocalDate] = useState(() => sessionStorage.getItem('date') || '');

    const setCityAndDate = (newCity, newDate) => {
        setLocalCity(newCity);
        setLocalDate(newDate);
        sessionStorage.setItem('city', newCity);
        sessionStorage.setItem('date', newDate);
    };

    useEffect(() => {
        if (localCity) {
            sessionStorage.setItem('city', localCity);
        }
        if (localDate) {
            sessionStorage.setItem('date', localDate);
        }
    }, [localCity, localDate]);

    return (
        <AuthContext.Provider value={{ localCity, localDate, setCityAndDate }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
