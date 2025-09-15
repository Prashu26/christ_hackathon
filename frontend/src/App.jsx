import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
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

  // Redirect logic for signup page
  let signupRedirect = null;
  if (isSignupPage && userData && userData.email) {
    // If already logged in, redirect to appropriate dashboard
    signupRedirect = isAdmin ? (
      <Navigate to="/admin" replace />
    ) : (
      <Navigate to="/profile" replace />
    );
  }
  return (
    <>
      {isAdmin ? null : isSignupPage ? <SimpleNavbar /> : <Navbar />}
      {signupRedirect}
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route
          path="/admin"
          element={isAdmin ? <Admin /> : <Navigate to="/features" replace />} // Only admins can access
        />
        <Route
          path="/verify"
          element={!isAdmin ? <Verify /> : <Navigate to="/admin" replace />}
        />
        <Route
          path="/login-otp"
          element={
            !isAdmin ? <LoginWithOtp /> : <Navigate to="/admin" replace />
          }
        />
        <Route
          path="/landing"
          element={
            !isAdmin ? <LandingPage /> : <Navigate to="/admin" replace />
          }
        />
        <Route
          path="/home"
          element={!isAdmin ? <HomePage /> : <Navigate to="/admin" replace />}
        />
        <Route
          path="/profile"
          element={!isAdmin ? <Profile /> : <Navigate to="/admin" replace />}
        />
        <Route
          path="/features"
          element={
            !isAdmin ? <FeaturesPage /> : <Navigate to="/admin" replace />
          }
        />
        <Route
          path="/education"
          element={!isAdmin ? <Education /> : <Navigate to="/admin" replace />}
        />
        <Route
          path="/demo"
          element={!isAdmin ? <DemoPage /> : <Navigate to="/admin" replace />}
        />
        <Route
          path="/contact"
          element={
            !isAdmin ? <ContactSection /> : <Navigate to="/admin" replace />
          }
        />
        <Route
          path="/generate-qr"
          element={!isAdmin ? <GenerateQR /> : <Navigate to="/admin" replace />}
        />
        <Route
          path="/user"
          element={!isAdmin ? <UserPage /> : <Navigate to="/admin" replace />}
        />
        <Route
          path="/verifier"
          element={
            !isAdmin ? <VerifierPage /> : <Navigate to="/admin" replace />
          }
        />
        <Route
          path="/loan"
          element={!isAdmin ? <LoanPage /> : <Navigate to="/admin" replace />}
        />
        <Route
          path="/insurance"
          element={
            !isAdmin ? <InsurancePage /> : <Navigate to="/admin" replace />
          }
        />
        <Route
          path="/storage"
          element={
            !isAdmin ? <StoragePage /> : <Navigate to="/admin" replace />
          }
        />
        <Route path="/college-dashboard" element={<CollegeDashboard />} />
        {/* Add your other routes here */}
      </Routes>
      <Toaster />
  {/* Show chatbot only for non-admin users and not on signup page */}
  {!isAdmin && !isSignupPage && <ChatbotPopup />}
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
