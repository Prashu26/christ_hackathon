import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import SimpleNavbar from "./components/SimpleNavbar";
import ChatbotPopup from "./components/ChatbotPopup";

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
import CollegeDashboard from "./pages/CollegeDashboard";
import Signup from "./pages/signup";

// QR Generation System Pages
import GenerateQR from "./pages/generateQR";
import UserPage from "./pages/UserPage";
import VerifierPage from "./pages/VerifierPage";
import LoanPage from "./pages/LoanPage";
import InsurancePage from "./pages/InsurancePage";
import StoragePage from "./pages/StoragePage";

function AppContent() {
  const location = useLocation();
  const isSignupPage = location.pathname === "/";

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const isAdmin = userData.isAdmin;

  return (
    <>
      {isAdmin ? null : isSignupPage ? <SimpleNavbar /> : <Navbar />}
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/login-otp" element={<LoginWithOtp />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/education" element={<Education />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/contact" element={<ContactSection />} />
        <Route path="/generate-qr" element={<GenerateQR />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/verifier" element={<VerifierPage />} />
        <Route path="/loan" element={<LoanPage />} />
        <Route path="/insurance" element={<InsurancePage />} />
        <Route path="/storage" element={<StoragePage />} />
        <Route path="/college-dashboard" element={<CollegeDashboard />} />
        {/* Add your other routes here */}
      </Routes>
      <Toaster />
      {/* Show chatbot only for non-admin users */}
      {!isAdmin && <ChatbotPopup />}
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
