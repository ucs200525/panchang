// import React, { useState } from "react";

// const PanchakaMuhurth = () => {
//     const [city, setCity] = useState("");
//     const [date, setDate] = useState("");
//     const [allMuhuratData, setAllMuhuratData] = useState([]);
//     const [filteredData, setFilteredData] = useState([]);
//     const [showAll, setShowAll] = useState(true); // State to toggle between all rows and filtered rows

//     // Save data to localStorage
//     const saveToLocalStorage = (data) => {
//         localStorage.setItem("muhurats", JSON.stringify(data));
//     };

//     // Function to fetch Muhurat data based on city and date
//     const getMuhuratData = () => {
//         if (!city || !date) {
//             alert("Please enter both city and date.");
//             return;
//         }

//         fetch('http://localhost:4000/fetch_muhurat', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ city, date })
//         })
//             .then(response => response.json())
//             .then(data => {
//                 setAllMuhuratData(data);  // Store all the muhurat data
//                 setFilteredData(data);  // Initially display all data
//                 setShowAll(true);       // Reset to showing all rows
//                 saveToLocalStorage(data); // Save data to localStorage
//             })
//             .catch(error => {
//                 console.error("Error fetching data:", error);
//             });
//     };

//     // Function to filter and display only "Good" timings
//     const filterGoodTimings = () => {
//         const goodTimings = allMuhuratData.filter(item => item.category.toLowerCase() === "good");
//         setFilteredData(goodTimings);  // Render the table with filtered data
//         setShowAll(false);             // Switch to filtered view
//     };

//     // Function to toggle between showing all rows and filtered rows
//     const toggleShowAllRows = () => {
//         if (showAll) {
//             filterGoodTimings(); // If currently showing all rows, filter "Good Timings"
//         } else {
//             setFilteredData(allMuhuratData); // Reset to show all rows
//         }
//         setShowAll(!showAll); // Toggle the state
//     };

//     // Function to render the table rows dynamically
//     const renderTableRows = (data) => {
//         return data.map((item, index) => (
//             <tr key={index}>
//                 <td>{`${item.muhurat} - ${item.category}`}</td>
//                 <td>{item.time}</td>
//             </tr>
//         ));
//     };

//     return (
//         <div className="PanchakaMuhurthContent">
//             <h1>Panchaka Muhurat</h1>
//             <div className="cityAndDate">
//                 {/* Form for taking date and city input */}
//                 <label htmlFor="city">City:</label>
//                 <input
//                     type="text"
//                     id="city"
//                     placeholder="Enter city"
//                     value={city}
//                     onChange={(e) => setCity(e.target.value)}
//                 />
//                 <br />
//                 <label htmlFor="date">Date (DD/MM/YYYY):</label>
//                 <input
//                     type="text"
//                     id="date"
//                     placeholder="Enter date"
//                     value={date}
//                     onChange={(e) => setDate(e.target.value)}
//                 />
//                 <br />
//                 <button onClick={getMuhuratData}>Get Muhurat</button>
//                 <button onClick={toggleShowAllRows}>
//                     {showAll ? "Good Timings Only" : "Show All Rows"}
//                 </button>
//             </div>
//             <h2>Result</h2>
//             <table id="muhurats-table" border="1" cellspacing="0" cellpadding="5">
//                 <thead>
//                     <tr>
//                         <th>Muhurat and Category</th>
//                         <th>Time</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {renderTableRows(filteredData)}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// export default PanchakaMuhurth;


import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';

const PanchakaMuhurth = () => {
    const {localCity, localDate, setCityAndDate } = useAuth();  // Use the contex
    const [city, setCity] = useState("Vijayawada");
    const [date, setDate] = useState("28/11/2024");
    const [allMuhuratData, setAllMuhuratData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [showAll, setShowAll] = useState(true); // State to toggle between all rows and filtered rows

    // Save data to localStorage
    const saveToLocalStorage = (data) => {
        localStorage.setItem("muhurats", JSON.stringify(data));
    };
    const createDummyTable = () => {
        const dummyTable = filteredData.map((row, index) => {
            // Split the timeInterval into start and end time
            const [startTime, endTime] = row.time.split(" to ");
            
            // Check if the startTime or endTime contains a date (e.g., "Nov 29")
            const [startDate, endDate] = startTime.includes(",") ? startTime.split(", ") : [null, null];
            const [endTimeWithoutDate, endDatePart] = endTime.split(", ");
            
            // If the start date is missing, use today's date for the startTime
            const currentDate = new Date(date);
            let adjustedStartTime = startDate ? startTime : `${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${startTime}`;
            
            // If the end date is missing, use the same date as start, or if it's past midnight, set it to the next day
            let adjustedEndTime = endDatePart ? endTime : `${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${endTimeWithoutDate}`;
    
            // Handling edge case for PM to AM, implying next day
            if (startTime.includes("PM") && endTime.includes("AM")) {
                const nextDay = new Date(currentDate);
                nextDay.setDate(currentDate.getDate() + 1); // Move to the next day
                adjustedEndTime = `${nextDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} , ${endTimeWithoutDate}`;
            }
            
            // Create the formatted time interval
            const timeIntervalFormatted = `${adjustedStartTime} to ${adjustedEndTime}`;
            
            return {
                category: row.category,
                muhurat: row.muhurat,
                time: timeIntervalFormatted, // Use the formatted time interval
            };
        });
    
        // Save the dummy table in localStorage
        localStorage.setItem("panchangamTableData", JSON.stringify(dummyTable));
        console.log("Dummy Table Saved: ", dummyTable);
    };
    
    

    // Function to fetch Muhurat data based on city and date
    const getMuhuratData = () => {
        if (!city || !date) {
            alert("Please enter both city and date.");
            return;
        }

        fetch('http://localhost:4000/fetch_muhurat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ city, date })
        })
            .then(response => response.json())
            .then(data => {
                setAllMuhuratData(data);  // Store all the muhurat data
                setFilteredData(data);  // Initially display all data
                setShowAll(true);       // Reset to showing all rows
                saveToLocalStorage(data); // Save data to localStorage
                createDummyTable(); // Create the dummy table and save to localStorage
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    };

    // Function to filter and display only "Good" timings
    const filterGoodTimings = () => {
        const goodTimings = allMuhuratData.filter(item => item.category.toLowerCase() === "good");
        setFilteredData(goodTimings);  // Render the table with filtered data
        setShowAll(false);             // Switch to filtered view
        createDummyTable(); // Create the dummy table for filtered data
    };

    // Function to toggle between showing all rows and filtered rows
    const toggleShowAllRows = () => {
        if (showAll) {
            filterGoodTimings(); // If currently showing all rows, filter "Good Timings"
        } else {
            setFilteredData(allMuhuratData); // Reset to show all rows
            createDummyTable(); // Create the dummy table for all data
        }
        setShowAll(!showAll); // Toggle the state
    };

    // Function to render the table rows dynamically
    const renderTableRows = (data) => {
        return data.map((item, index) => (
            <tr key={index}>
                <td>{`${item.muhurat} - ${item.category}`}</td>
                <td>{item.time}</td>
            </tr>
        ));
    };

    useEffect(() => {
        // Whenever the filtered data changes (after fetching or filtering), update the localStorage
        if (filteredData.length > 0) {
            createDummyTable(); // Save the dummy table to localStorage every time the filtered data is updated
        }
    }, [filteredData]); // Dependency array ensures this effect runs when filteredData changes

    return (
        <div className="PanchakaMuhurthContent">
            <h1>Panchaka Muhurat</h1>
            <div className="cityAndDate">
                {/* Form for taking date and city input */}
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
