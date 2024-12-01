import React, { useState, useEffect, useCallback } from "react";

import LoadingSpinner from '../components/LoadingSpinner'; // Import the spinner component

const PanchakaMuhurth = () => {
    
    const [city, setCity] = useState("Vijayawada");
    const [date, setDate] = useState(() => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = today.getFullYear();
        return `${day}/${month}/${year}`; // Format: dd/mm/yyyy
    });

    const [allMuhuratData, setAllMuhuratData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [showAll, setShowAll] = useState(true); // State to toggle between all rows and filtered rows
    const [loading, setLoading] = useState(false); // Add loading state

    // const saveToLocalStorage = (data) => {
    //     localStorage.setItem("muhurats", JSON.stringify(data));
    // };

    const createDummyTable = useCallback(() => {
        const dummyTable = filteredData.map((row) => {
            const [startTime, endTime] = row.time.split(" to ");

            let endTimeWithoutDate, endDatePart;

            if (endTime.includes(", ")) {
                [endTimeWithoutDate, endDatePart] = endTime.split(", ");
            } else {
                endTimeWithoutDate = endTime; // If no comma, the entire string is the time
                endDatePart = null;          // No date part available
            }

            const currentDate = new Date(date);
            let adjustedStartTime = startTime.includes("PM")
                ? `${startTime}`
                : startTime.includes("AM") && endTime.includes(",")
                    ? `${endDatePart} , ${startTime}`
                    : startTime;

            let adjustedEndTime = endTime.includes("AM") && endTime.includes(",")
                ? `${endDatePart} , ${endTimeWithoutDate}`
                : endTime.includes("PM")
                    ? `${endTimeWithoutDate}`
                    : endTime;

            const timeIntervalFormatted = `${adjustedStartTime} to ${adjustedEndTime}`;

            return {
                category: row.category,
                muhurat: row.muhurat,
                time: timeIntervalFormatted,
            };
        });

        // Save the dummy table in localStorage
        localStorage.setItem("muhurats", JSON.stringify(dummyTable));
        console.log("Dummy Table Saved: ", dummyTable);
    }, [filteredData, date]); // Memoize with filteredData and date as dependencies

    const getMuhuratData = () => {
        if (!city || !date) {
            alert("Please enter both city and date.");
            return;
        }

        setLoading(true); // Set loading to true before fetching data
        fetch(`${process.env.REACT_APP_API_URL}/api/fetch_muhurat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ city, date })
        })
            .then(response => response.json())
            .then(data => {
                setAllMuhuratData(data);  // Store all the muhurat data
                console.log("Complete data", data);
                setFilteredData(data);  // Initially display all data
                setShowAll(true);       // Reset to showing all rows
                createDummyTable(); // Create the dummy table and save to localStorage
                setLoading(false);  // Set loading to false after data is fetched
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                setLoading(false);  // Set loading to false in case of an error
            });
    };

    const filterGoodTimings = () => {
        const goodTimings = allMuhuratData.filter(item => item.category.toLowerCase() === "good");
        setFilteredData(goodTimings);  // Render the table with filtered data
        setShowAll(false);             // Switch to filtered view
        createDummyTable(); // Create the dummy table for filtered data
    };

    const toggleShowAllRows = () => {
        if (showAll) {
            filterGoodTimings(); // If currently showing all rows, filter "Good Timings"
        } else {
            setFilteredData(allMuhuratData); // Reset to show all rows
            createDummyTable(); // Create the dummy table for all data
        }
        setShowAll(!showAll); // Toggle the state
    };

    const renderTableRows = (data) => {
        return data.map((item, index) => (
            <tr key={index}>
                <td>{`${item.muhurat} - ${item.category}`}</td>
                <td>{item.time}</td>
            </tr>
        ));
    };

    useEffect(() => {
        if (filteredData.length > 0) {
            createDummyTable(); // Save the dummy table to localStorage every time the filtered data is updated
        }
    }, [filteredData, createDummyTable]); // Now including createDummyTable in the dependency array

    return (
        <div className="PanchakaMuhurthContent">
            <h1>Panchaka Muhurat</h1>
            <div className="cityAndDate">
                <label htmlFor="city">City:</label>
                <input
                    type="text"
                    id="city"
                    placeholder="Enter city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />
                <br />
                <label htmlFor="date">Date (DD/MM/YYYY):</label>
                <input
                    type="text"
                    id="date"
                    placeholder="Enter date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                <br />
                <button onClick={getMuhuratData}>Get Muhurat</button>
                <button onClick={toggleShowAllRows}>
                    {showAll ? "Good Timings Only" : "Show All Rows"}
                </button>
            </div>

            {loading && <LoadingSpinner />} {/* Show the spinner when loading */}

            <h2>Result</h2>
            <table id="muhurats-table" border="1" cellspacing="0" cellpadding="5">
                <thead>
                    <tr>
                        <th>Muhurat and Category</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    {renderTableRows(filteredData)}
                </tbody>
            </table>
            
        </div>
    );
};

export default PanchakaMuhurth;
