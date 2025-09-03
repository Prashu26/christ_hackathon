import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Import your pages

import LandingPage from "./pages/landingpage";
import HomePage from "./pages/HomePage"; // Example
import LoginWithOtp from "./pages/LoginWithOtp"; // 1. Import your new page
import Navbar from "./pages/navbar"; // Import Navbar

function App() {
  return (
    <>
    
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage/>} />

        {/* 2. Add the new route for the OTP login page */}
        <Route path="/login-otp" element={<LoginWithOtp />} />

        {/* Add your other routes here */}
      </Routes>
      {/* Your Footer can go here */}
    </Router>
    </>
  );
}

export default App;
