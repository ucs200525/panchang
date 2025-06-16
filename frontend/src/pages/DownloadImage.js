import React, { useState } from 'react';
import './PanchakaMuhurth.css';

const DownloadImage = () => {
    const [city, setCity] = useState('');
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showNonBlue, setShowNonBlue] = useState(true);  // default to true
    const [is12HourFormat, setIs12HourFormat] = useState(true); // default to true

  const convertToDDMMYYYY = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };
    const handleDownload = async () => {
        try {
            setLoading(true);
            setError(null);

            // First fetch muhurat data
            const muhuratResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/getDrikTable?city=${city}&date=${convertToDDMMYYYY(date)}&goodTimingsOnly=${showNonBlue}`);
            if (!muhuratResponse.ok) throw new Error('Failed to fetch muhurat data');
            const muhuratData = await muhuratResponse.json();

            // Then fetch panchangam data
            const panchangamResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/getBharagvTable?city=${city}&date=${date}&showNonBlue=${showNonBlue}&is12HourFormat=${is12HourFormat}`);
            if (!panchangamResponse.ok) throw new Error('Failed to fetch panchangam data');
            const panchangamData = await panchangamResponse.json();

            // Now make the image request with all required data
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/combine-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    muhuratData, 
                    panchangamData,
                    city, 
                    date 
                }),
            });

            if (!response.ok) {
                console.log("Response status:", response.status);
                console.log("Response status text:", response.statusText);
                throw new Error('Failed to generate image');
            }

            // Convert response to blob
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `combined-data-${city}-${date}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err) {
            console.error("Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="download-image-container">
            <h2>Download Combined Muhurat Image</h2>
            <div className="form-group">
                <label htmlFor="city">City:</label>
                <input
                    type="text"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city name"
                />
            </div>
            <div className="form-group">
                <label htmlFor="date">Date:</label>
                <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>
            <button 
                className="download-btn"
                onClick={handleDownload}
                disabled={loading || !city || !date}
            >
                {loading ? 'Generating...' : 'Download Image'}
            </button>
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default DownloadImage;

