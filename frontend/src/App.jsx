import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import SimpleNavbar from "./components/SimpleNavbar";

// Import your pages
import LandingPage from "./pages/landingpage";
import Admin from "./pages/admin";
import Verify from "./components/verify";
import HomePage from "./pages/HomePage"; // Example
import LoginWithOtp from "./pages/LoginWithOtp"; // 1. Import your new page
import Profile from "./pages/profile"; // Import Profile
import FeaturesPage from "./pages/boilerplate/feautres";
import Education from "./pages/boilerplate/education";
import ContactSection from "./pages/boilerplate/contact";
import Navbar from "./pages/navbar";
import DemoPage from "./pages/boilerplate/demo";   
import Signup from "./pages/signup";

// QR Generation System Pages
import GenerateQR from "./pages/generateQR";
import UserPage from "./pages/UserPage";
import VerifierPage from "./pages/VerifierPage";
import LoanPage from './pages/LoanPage'
import InsurancePage from './pages/InsurancePage'
import StoragePage from './pages/StoragePage'

function AppContent() {
  const location = useLocation();
  const isSignupPage = location.pathname === '/';

  return (
    <>
      {isSignupPage ? <SimpleNavbar /> : <Navbar />}
      <Routes>
        <Route path="/" element={<Signup/>} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/verify" element={<Verify />} />

        {/* 2. Add the new route for the OTP login page */}
        <Route path="/login-otp" element={<LoginWithOtp />} />

        {/* Add route for Landing Page */}
        <Route path="/landing" element={<LandingPage />} />

        {/* Add route for HomePage */}
        <Route path="/home" element={<HomePage />} />

        {/* Add route for Profile */}
        <Route path="/profile" element={<Profile />} />

        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/education" element={<Education />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/contact" element={<ContactSection />} />

        {/* QR Generation System Routes */}
        <Route path="/generate-qr" element={<GenerateQR />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/verifier" element={<VerifierPage />} />
        <Route path="/loan" element={<LoanPage />} />
        <Route path="/insurance" element={<InsurancePage />} />
        <Route path="/storage" element={<StoragePage />} />

        {/* Add your other routes here */}
      </Routes>
      {/* Your Footer can go here */}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
