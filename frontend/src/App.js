// import React from 'react';
// import './pages/style.css';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import PachangamForm from './pages/PachangamForm';
// import PanchakaMuhurth from './pages/PanchakaMuhurth';
// import Combine from './pages/Combine';
// import Navbar from './components/Navbar';

// function App() {
//   return (
//     <Router>
//       <Navbar />
//       <Routes>
//       <Route path="/" element={<PachangamForm />} />
//       <Route path="/panchaka" element={<PanchakaMuhurth />} />
//       <Route path="/combine" element={<Combine />} />
//         {/* Add more routes here if needed */}
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import React from 'react';
import './pages/style.css';
import './pages/PanchakaMuhurth.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PachangamForm from './pages/PachangamForm';
import PanchakaMuhurth from './pages/PanchakaMuhurth';
import Combine from './pages/Combine';
import Navbar from './components/Navbar';
import DownloadImage from './pages/DownloadImage';
import DrikTableImage from './pages/DrikTableImage';
import BhargavTableImage from './pages/BhargavTableImage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
      <Route path="/" element={<PachangamForm />} />
        <Route path="/panchaka" element={<PanchakaMuhurth />} />
        <Route path="/combine" element={<Combine />} />
        <Route path="/DownloadImage" element={<DownloadImage />} />
        <Route path="/drik-table-image" element={<DrikTableImage />} />
        <Route path="/bhargav-table-image" element={<BhargavTableImage />} />
        {/* Add more routes here if needed */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
