import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner'; // Import the spinner component
import html2canvas from 'html2canvas';

const PanchakaMuhurth = () => {
    const [city, setCity] = useState('');
    const [date, setDate] = useState(() => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = today.getFullYear();
        return `${day}/${month}/${year}`; // Format: dd/mm/yyyy
    });

    const { localCity, localDate, setCityAndDate } = useAuth();
    const [allMuhuratData, setAllMuhuratData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [showAll, setShowAll] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const createDummyTable = useCallback(() => {
        const dummyTable = filteredData.map((row) => {
            const [startTime, endTime] = row.time.split(" to ");
            let endTimeWithoutDate, endDatePart;

            if (endTime.includes(", ")) {
                [endTimeWithoutDate, endDatePart] = endTime.split(", ");
            } else {
                endTimeWithoutDate = endTime;
                endDatePart = null;
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

        sessionStorage.setItem("muhurats", JSON.stringify(dummyTable));
        console.log("Dummy Table Saved: ", dummyTable);
    }, [filteredData, date]);

    const getMuhuratData = async () => {

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/fetch_muhurat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ city, date })
            });
            const data = await response.json();
            setAllMuhuratData(data);
            setFilteredData(data);
            setShowAll(true);
            createDummyTable();
        } catch (err) {
            setError(err.message || "Error fetching muhurat data.");
        } finally {
            setLoading(false);
        }
    };

    const autoGeolocation = async () => {
        if (navigator.geolocation) {
            setLoading(true);
            setError('');
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    try {
                        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/fetchCityName/${lat}/${lng}`);
                        if (!response.ok) throw new Error('Failed to fetch city name');
                        const data = await response.json();
                        const cityName = data.cityName;
                        setCity(cityName);
                        await getMuhuratData();
                        setCityAndDate(cityName, date);
                    } catch (err) {
                        setError(err.message || "Error fetching city name.");
                    } finally {
                        setLoading(false);
                    }
                },
                (err) => {
                    setError('Geolocation error: ' + err.message);
                    setLoading(false);
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    };

    const filterGoodTimings = () => {
        const goodTimings = allMuhuratData.filter(item => item.category.toLowerCase() === "good");
        setFilteredData(goodTimings);
        setShowAll(false);
        createDummyTable();
    };

    const toggleShowAllRows = () => {
        if (showAll) {
            filterGoodTimings();
        } else {
            setFilteredData(allMuhuratData);
            createDummyTable();
        }
        setShowAll(!showAll);
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
        if (city !== localCity || date !== localDate) {
            setCityAndDate(city, date);
        }
    }, [city, date, localCity, localDate, setCityAndDate]);

    useEffect(() => {
        if (filteredData.length > 0) {
            createDummyTable();
        }
    }, [filteredData, createDummyTable]);

    const takeScreenshot = async () => {
        const element = document.getElementById('muhurats-table');
        const canvas = await html2canvas(element);
        const img = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = img;
        link.download = `${city} Panchangam.png`;
        link.click();
    };

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
                <button onClick={autoGeolocation}>Get Muhurat</button>
                <button onClick={toggleShowAllRows}>
                    {showAll ? "Good Timings Only" : "Show All Rows"}
                </button>
                
            </div>

            {loading && <LoadingSpinner />}
            {error && <p className="error">{error}</p>}

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
            <div className="download-button">
                <button className="share-button" onClick={takeScreenshot}>
                    <i className="far fa-share-square"></i>
                </button>
            </div>
        </div>
    );
};

export default PanchakaMuhurth;
