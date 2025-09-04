import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const Verify = () => {
  const [isVerified, setIsVerified] = useState(null);
  const [formName, setFormName] = useState("");
  const [universityOrCompany, setUniversityOrCompany] = useState("");
  const [option, setOption] = useState("form");
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("userData"));
  const userId = storedUser?._id;

  const API_BASE = "http://localhost:5000/api/v1/users";

  useEffect(() => {
    if (!userId) {
      toast.error("User not logged in!");
      navigate("/");
      return;
    }

    // Check verification status
    axios
      .get(`${API_BASE}/${userId}/status`)
      .then((res) => {
        setIsVerified(res.data.verified);
        if (res.data.verified) {
          toast.success("Already verified!");
          navigate("/verifier", { replace: true });
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch verification status.");
      });
  }, [userId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/${userId}/verify`, {
        formName,
        universityOrCompany,
        option,
      });
      toast.success("Verification request submitted! Admin will approve it.");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit verification request.");
    }
  };

  if (isVerified === null) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-red-100 flex items-center justify-center p-6">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Verification Form
        </h2>

        <div className="mb-4">
          <label
            htmlFor="formName"
            className="block text-gray-700 font-semibold mb-2"
          >
            Form Name
          </label>
          <input
            id="formName"
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Enter form name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="universityOrCompany"
            className="block text-gray-700 font-semibold mb-2"
          >
            University / Company Name
          </label>
          <input
            id="universityOrCompany"
            type="text"
            value={universityOrCompany}
            onChange={(e) => setUniversityOrCompany(e.target.value)}
            placeholder="Enter university or company name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Option
          </label>
          <select
            value={option}
            onChange={(e) => setOption(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="form">Form</option>
            <option value="university">University</option>
            <option value="company">Company</option>
          </select>
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-purple-600 text-white py-3 rounded-md font-semibold hover:bg-purple-700 transition-colors duration-300"
        >
          Submit
        </motion.button>
      </motion.form>
    </div>
  );
};

export default Verify;
