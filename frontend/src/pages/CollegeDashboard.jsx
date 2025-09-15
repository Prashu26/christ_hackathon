import React, { useState } from "react";
import axios from "axios";

function CollegeDashboard() {
  const [collegeName, setCollegeName] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [certificateName, setCertificateName] = useState("");
  const [marksOrCgpa, setMarksOrCgpa] = useState("");
  const [clgName, setClgName] = useState("");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const [issuing, setIssuing] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post("http://localhost:5000/api/college/login", {
        collegeName,
        password,
      });
      if (res.data.success) {
        setLoggedIn(true);
        setMessage("");
      } else {
        setMessage("Login failed");
      }
    } catch (err) {
      setMessage("Login failed");
    }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    setIssuing(true);
    setMessage("");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/college/issue-certificate",
        {
          aadhaarNumber,
          certificateName,
          issuedBy: collegeName,
          marksOrCgpa,
          clgName,
          details,
        }
      );
      if (res.data.success) {
        setMessage("Certificate issued successfully!");
        setAadhaarNumber("");
        setCertificateName("");
        setMarksOrCgpa("");
        setClgName("");
        setDetails("");
      } else {
        setMessage(res.data.message || "Failed to issue certificate");
      }
    } catch (err) {
      setMessage("Failed to issue certificate");
      console.log(err);
    } finally {
      setIssuing(false);
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <form
          className="bg-white/10 p-8 rounded-2xl shadow-lg max-w-md w-full"
          onSubmit={handleLogin}
        >
          <h2 className="text-2xl font-bold mb-6 text-white">
            College Dashboard Login
          </h2>
          <input
            type="text"
            className="w-full p-3 mb-4 rounded-lg bg-white/20 text-white border border-white/30"
            placeholder="College Name"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full p-3 mb-4 rounded-lg bg-white/20 text-white border border-white/30"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-bold text-lg hover:opacity-90"
          >
            Login
          </button>
          {message && <div className="mt-4 text-red-300">{message}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <form
        className="bg-white/10 p-8 rounded-2xl shadow-lg max-w-md w-full"
        onSubmit={handleIssue}
      >
        <h2 className="text-2xl font-bold mb-6 text-white">
          Issue Education Certificate
        </h2>
        <input
          type="text"
          className="w-full p-3 mb-4 rounded-lg bg-white/20 text-white border border-white/30"
          placeholder="Student Aadhaar Number"
          value={aadhaarNumber}
          onChange={(e) => setAadhaarNumber(e.target.value)}
          required
        />
        <input
          type="text"
          className="w-full p-3 mb-4 rounded-lg bg-white/20 text-white border border-white/30"
          placeholder="Certificate Name (e.g. BSc, 10th Marksheet)"
          value={certificateName}
          onChange={(e) => setCertificateName(e.target.value)}
          required
        />
        <input
          type="text"
          className="w-full p-3 mb-4 rounded-lg bg-white/20 text-white border border-white/30"
          placeholder="Marks or CGPA (e.g. 86% or 9.2 CGPA)"
          value={marksOrCgpa}
          onChange={(e) => setMarksOrCgpa(e.target.value)}
        />
        <input
          type="text"
          className="w-full p-3 mb-4 rounded-lg bg-white/20 text-white border border-white/30"
          placeholder="College Name"
          value={clgName}
          onChange={(e) => setClgName(e.target.value)}
        />
        <textarea
          className="w-full p-3 mb-4 rounded-lg bg-white/20 text-white border border-white/30"
          placeholder="Details (e.g. year, remarks, etc.)"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
        <button
          type="submit"
          className="w-full p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold text-lg hover:opacity-90 disabled:opacity-50"
          disabled={issuing}
        >
          {issuing ? "Issuing..." : "Issue Certificate"}
        </button>
        {message && (
          <div className="mt-4 text-white text-center">{message}</div>
        )}
      </form>
    </div>
  );
}

export default CollegeDashboard;
