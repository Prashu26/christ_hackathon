import React from "react";
import { Link } from "react-router-dom"; // 1. Import the Link component

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-8">Welcome to the Home Page</h1>

      {/* 2. Add the Link component, styling it like a button */}
      <Link to="/login-otp" className="btn btn-primary">
        Go to OTP Login Page
      </Link>
    </div>
  );
};

export default HomePage;
