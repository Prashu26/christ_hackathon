import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Import your pages
import LandingPage from "./pages/landingpage";
import HomePage from "./pages/HomePage"; // Example
import LoginWithOtp from "./pages/LoginWithOtp"; // 1. Import your new page
import Profile from "./pages/profile"; // Import Profile
import FeaturesPage from "./pages/boilerplate/feautres";
import HowItWorksPage from "./pages/boilerplate/howItWorks";
import ContactSection from "./pages/boilerplate/contact";
import Navbar from "./pages/navbar"; // Import Navbar

// QR Generation System Pages
import GenerateQR from "./pages/generateQR";
import UserPage from "./pages/UserPage";
import VerifierPage from "./pages/VerifierPage";

function App() {
  return (
    <>
    
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage/>} />

        {/* 2. Add the new route for the OTP login page */}
        <Route path="/login-otp" element={<LoginWithOtp />} />

        {/* Add route for HomePage */}
        <Route path="/home" element={<HomePage />} />

        {/* Add route for Profile */}
        <Route path="/profile" element={<Profile />} />

        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/contact" element={<ContactSection />} />

        {/* QR Generation System Routes */}
        <Route path="/generate-qr" element={<GenerateQR />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/verifier" element={<VerifierPage />} />

        {/* Add your other routes here */}
      </Routes>
      {/* Your Footer can go here */}
    </Router>
    </>
  );
}

export default App;
