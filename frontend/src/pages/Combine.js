import React, { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';

const Combine = () => {
    const [muhuratData, setMuhuratData] = useState([]);
    const [panchangamData, setPanchangamData] = useState([]);
    const [finalData, setFinalData] = useState([]);
    const {localCity, localDate, setCityAndDate,setisSearching,search } = useAuth();  // Use the contex
    const [city, setCity] = useState("Vijayawada");
    const [isSearching, setIsSearching] = useState(false);

    const [date, setDate] = useState(() => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = today.getFullYear();
        return `${day}/${month}/${year}`; // Format: dd/mm/yyyy
    });
    
    // Retrieve data from localStorage
    useEffect(() => {
        const storedMuhuratData = localStorage.getItem("muhurats");
        const storedPanchangamData = localStorage.getItem("panchangamTableData");

        if (storedMuhuratData) {
            setMuhuratData(JSON.parse(storedMuhuratData));
            console.log("Stored Muhurat Data: ", JSON.parse(storedMuhuratData));
        }
        if (storedPanchangamData) {
            setPanchangamData(JSON.parse(storedPanchangamData));
            console.log("Stored Panchangam Data: ", JSON.parse(storedPanchangamData));
        }
    }, []);
// Helper function to parse time strings (without seconds)
const parseTime = (timeStr, baseDate, isNextDay = false) => {
    if (!timeStr) return null;

    const [time, period] = timeStr.trim().split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date(baseDate);

    // Set hours and minutes
    date.setHours(
        period === "PM" && hours !== 12 ? hours + 12 : period === "AM" && hours === 12 ? 0 : hours,
        minutes || 0,
        0 // Ignore seconds
    );

    // Increment day if `isNextDay` is true
    if (isNextDay) date.setDate(date.getDate() + 1);

    return date;
};

// Function to split intervals and handle incomplete intervals
const splitInterval = (interval, baseDate) => {
    if (!interval || interval.trim() === "") return [null, null];

    const [start, end] = interval.split(" to ");
    if (!start || !end) return [null, null];

    // Check if `start` or `end` specifies the next day
    const isNextDayStart = start.includes(","); // Indicates start is on the next day
    const startTime = start.replace(/.*?,/, "").trim(); // Remove date prefix if present

    const isNextDayEnd = end.includes(","); // Indicates end is on the next day
    const endTime = end.replace(/.*?,/, "").trim(); // Remove date prefix if present

    return [
        parseTime(startTime, baseDate, isNextDayStart), // Pass `isNextDay` for start
        parseTime(endTime, baseDate, isNextDayEnd),     // Pass `isNextDay` for end
    ];
};

    // Function to validate time interval
    const validateInterval = (start, end) => {
        if (!start || !end) {
            console.log("Invalid Interval:", start, end);
            return false;
        }
        console.log("Valid Interval:", start, end);
        return true;
    };

 // Combine Muhurat and Panchangam data
useEffect(() => {
    const today = new Date();
    const mergedData = [];
    let i=0;
    console.log("Processing Panchangam Data...");

    // Iterate through Muhurat Data first
    muhuratData.forEach((muhuratItem) => {
        const [muhuratStart, muhuratEnd] = splitInterval(muhuratItem.time, today);
        console.log("muhuratStart: ",muhuratStart);
        console.log("muhuratEnd: ",muhuratEnd);
        if (muhuratStart && muhuratEnd && validateInterval(muhuratStart, muhuratEnd)) {
            console.log("Valid Muhurat Interval: ", muhuratItem);

            // Temporary array to collect weekday values for this Muhurat
            const weekdaysArray = [];

            // Now iterate through Panchangam data
            panchangamData.forEach((panchangamItem) => {
                const timeInterval = panchangamItem.timeInterval1; // Only use timeInterval1
                const [start, end] = splitInterval(timeInterval, today);
                console.log("CheckOKK: ",start);
                console.log("endcheck: ",end);
                if (start && end && validateInterval(start, end)) {
                    console.log("Valid Panchangam Interval: ", panchangamItem);

                    // Check if Panchangam falls within any Muhurat interval
                    if (start <= muhuratEnd && end>=muhuratStart) {
                        // Add unique weekday values to the temporary array
                        if (!weekdaysArray.includes(panchangamItem.weekday)) {
                            weekdaysArray.push(panchangamItem.weekday);
                        }
                    }
                } else {
                    console.log("Invalid Panchangam Interval:", panchangamItem);
                }
            });

            // After collecting weekdays, add to mergedData
            mergedData.push({
                sno:i+1,
                type: "Muhurat",
                description: `${muhuratItem.muhurat} - ${muhuratItem.category}`,
                timeInterval: muhuratItem.time,
                weekday: weekdaysArray.join(", ") || "-", // Join weekdays with commas
            });
            i++;
        } else {
            console.log("Invalid Muhurat Interval:", muhuratItem);
        }
    });

    console.log("Processing Muhurat Data...");

    console.log("Final Merged Data: ", mergedData);
    setFinalData(mergedData);
}, [muhuratData, panchangamData]);

    const getMuhuratData = () => {
        setisSearching(true);
        setCityAndDate(city,date);
        sessionStorage.setItem('search', true);

    };

    // useEffect to handle side effects
    useEffect(() => {
        if (isSearching) {
            console.log('Fetching muhurat data...');
            // Simulate data fetch or perform some action
            setTimeout(() => {
                console.log('Muhurat data fetched!');
                setIsSearching(false); // Reset the state after the operation
            }, 2000);
        }
    }, [isSearching]);

    // Helper function to format time without seconds
    const formatTime = (date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? "PM" : "AM";
        const hour12 = hours % 12 || 12; // Convert 24-hour to 12-hour format
        const minuteFormatted = minutes < 10 ? `0${minutes}` : minutes;

        console.log("Formatted Time: ", `${hour12}:${minuteFormatted} ${period}`);
        return `${hour12}:${minuteFormatted} ${period}`;
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1 style={{ textAlign: "center" }}>Combined Good Timings</h1>
     
           
            {finalData.length > 0 ? (
                <table border="1" cellSpacing="0" cellPadding="5" style={{ width: "100%", textAlign: "left" }}>
                    <thead>
                        <tr>
                            <th>SNO</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Time & Interval</th>
                            <th>Weekday</th>
                        </tr>
                    </thead>
                    <tbody>
                        {finalData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.sno}</td>
                                <td>{item.type}</td>
                                <td>{item.description}</td>
                                <td>{item.timeInterval}</td>
                                <td>{item.weekday}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={{ textAlign: "center" }}>No data available. Please fetch data from the relevant pages.</p>
            )}
        </div>
    );
};

export default Combine;
