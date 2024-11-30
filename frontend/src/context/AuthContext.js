// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [localCity, setLocalCity] = useState(() => sessionStorage.getItem('city') || '');
    const [localDate, setLocalDate] = useState(() => sessionStorage.getItem('date') || '');
    const [isSearching, setisSearching] = useState(() => sessionStorage.getItem('search') || '');

    const [muhurthData, setmuhurthData] = useState(() => sessionStorage.getItem('muhurtT') || '');
    const [panchangam, setpanchangam] = useState(() => sessionStorage.getItem('panchangamT') || '');

    const setCityAndDate = (newCity, newDate) => {
        setLocalCity(newCity);
        setLocalDate(newDate);
        sessionStorage.setItem('city', newCity);
        sessionStorage.setItem('date', newDate);
    };
    
    const search = (isSearching)=>{
        setisSearching(isSearching);
        sessionStorage.setItem('search', isSearching);
    }; 

    const setMuhuratTable = (data) => {
        setmuhurthData(data);
        sessionStorage.setItem('muhurtT', data);
    };

    const setPancahgamTable = (data) => {
        setpanchangam(data);
        sessionStorage.setItem('panchangamT', data);
    };

    useEffect(() => {
        if (localCity) {
            sessionStorage.setItem('city', localCity);
        }
        if (localDate) {
            sessionStorage.setItem('date', localDate);
        }
        if (isSearching) {
            sessionStorage.setItem('search', isSearching);
        }
    }, [localCity, localDate,isSearching]);

    return (
        <AuthContext.Provider value={{ muhurthData,localCity, localDate,isSearching,search, setisSearching,setCityAndDate ,setPancahgamTable,setMuhuratTable}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
