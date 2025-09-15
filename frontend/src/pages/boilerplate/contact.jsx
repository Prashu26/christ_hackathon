import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  Clock,
  Users,
  Headphones,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  FileText,
  Download,
  Star,
  Heart,
  Zap,
  Shield,
  Lightbulb,
  HelpCircle,
  BookOpen,
  Settings,
  User,
} from "lucide-react";

const ContactSection = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("contact");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "normal",
    department: "general",
  });
  const [formStatus, setFormStatus] = useState("idle"); // idle, submitting, success, error
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: "bot",
      message: "Hello! How can I help you today?",
      time: "10:30 AM",
    },
    {
      id: 2,
      type: "bot",
      message:
        "I can assist with account setup, security, or technical support.",
      time: "10:30 AM",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [supportStats, setSupportStats] = useState({
    avgResponseTime: "2 mins",
    satisfaction: 98,
    ticketsResolved: 15742,
    onlineAgents: 12,
  });
  const [copiedContact, setCopiedContact] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  // Open Send Email modal automatically if navigated with state { openSendEmail: true }
  useEffect(() => {
    if (location.state && location.state.openSendEmail) {
      setShowEmailModal(true);
    }
  }, [location.state]);
  const [emailSupportMsg, setEmailSupportMsg] = useState("");
  const [emailSupportStatus, setEmailSupportStatus] = useState("idle"); // idle, sending, sent, error
  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("userData") || "{}")
      : {};
  const [emailSupportName, setEmailSupportName] = useState(
    storedUser.name || ""
  );
  const [emailSupportEmail, setEmailSupportEmail] = useState(
    storedUser.email || ""
  );
  const [emailSupportPriority, setEmailSupportPriority] = useState("normal");

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get detailed help via email",
      value: "support@digitalid.com",
      action: "Send Email",
      color: "from-blue-500 to-indigo-600",
      responseTime: "< 2 hours",
      available: "24/7",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Instant chat with our experts",
      value: "Start Chat",
      action: "Chat Now",
      color: "from-green-500 to-emerald-600",
      responseTime: "< 30 seconds",
      available: "Online now",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team",
      value: "+1 (555) 123-4567",
      action: "Call Now",
      color: "from-purple-500 to-pink-600",
      responseTime: "Immediate",
      available: "9 AM - 9 PM PST",
    },
    {
      icon: Calendar,
      title: "Video Call",
      description: "Face-to-face technical support",
      value: "Schedule Call",
      action: "Book Session",
      color: "from-orange-500 to-red-600",
      responseTime: "15-30 mins",
      available: "By appointment",
    },
  ];

  const departments = [
    { value: "general", label: "General Inquiry" },
    { value: "technical", label: "Technical Support" },
    { value: "security", label: "Security Issues" },
    { value: "billing", label: "Billing & Accounts" },
    { value: "partnerships", label: "Partnerships" },
    { value: "feedback", label: "Feedback" },
  ];

  const faqCategories = [
    {
      title: "Getting Started",
      icon: Lightbulb,
      questions: [
        "How do I create my digital identity?",
        "What documents do I need for verification?",
        "Is my data secure?",
        "How long does verification take?",
      ],
    },
    {
      title: "Security & Privacy",
      icon: Shield,
      questions: [
        "How is my data encrypted?",
        "What is Zero-Knowledge Proof?",
        "Can I control who sees my info?",
        "How do I report security issues?",
      ],
    },
    {
      title: "Technical Support",
      icon: Settings,
      questions: [
        "App not working offline?",
        "QR code scanning issues?",
        "Sync across devices?",
        "Troubleshooting login?",
      ],
    },
  ];

  const socialLinks = [
    {
      icon: Twitter,
      label: "@DigitalID",
      url: "#",
      color: "hover:text-blue-400",
    },
    {
      icon: Linkedin,
      label: "DigitalID Corp",
      url: "#",
      color: "hover:text-blue-600",
    },
    {
      icon: Github,
      label: "Open Source",
      url: "#",
      color: "hover:text-gray-400",
    },
    {
      icon: Youtube,
      label: "Tutorials",
      url: "#",
      color: "hover:text-red-500",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      setFormStatus("error");
      return;
    }
    setFormStatus("submitting");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/contact/send",
        formData
      );
      if (res.data.success) {
        setFormStatus("success");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          priority: "normal",
          department: "general",
        });
        setTimeout(() => setFormStatus("idle"), 3000);
      } else {
        setFormStatus("error");
      }
    } catch (err) {
      setFormStatus("error");
    }
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const newMessage = {
      id: chatMessages.length + 1,
      type: "user",
      message: chatInput,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setChatMessages((prev) => [...prev, newMessage]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        id: chatMessages.length + 2,
        type: "bot",
        message: "Thanks! An agent will assist you shortly.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChatMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const copyContact = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedContact(type);
      setTimeout(() => setCopiedContact(null), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSupportStats((prev) => ({
        ...prev,
        ticketsResolved: prev.ticketsResolved + Math.floor(Math.random() * 3),
        onlineAgents: 10 + Math.floor(Math.random() * 5),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 p-6">
      {/* Hero & Stats */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">
          Get in{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Touch
          </span>
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Our team is here to help with digital identity, security, or technical
          support. Choose your preferred way to connect.
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap justify-center gap-6 mb-12">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
          <Clock className="w-5 h-5 text-green-400" />
          <p className="text-white font-semibold">
            {supportStats.avgResponseTime}
          </p>
          <p className="text-gray-400 text-sm">Avg Response</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
          <Star className="w-5 h-5 text-yellow-400" />
          <p className="text-white font-semibold">
            {supportStats.satisfaction}%
          </p>
          <p className="text-gray-400 text-sm">Satisfaction</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
          <Users className="w-5 h-5 text-blue-400" />
          <p className="text-white font-semibold">
            {supportStats.onlineAgents}
          </p>
          <p className="text-gray-400 text-sm">Agents Online</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-white font-semibold">
            {supportStats.ticketsResolved.toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm">Issues Resolved</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {[
          { id: "contact", label: "Contact Methods", icon: Phone },
          { id: "form", label: "Send Message", icon: Mail },
          { id: "chat", label: "Live Chat", icon: MessageCircle },
          { id: "faq", label: "FAQ", icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contact Methods */}
      {activeTab === "contact" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method, i) => {
            const Icon = method.icon;
            if (method.title === "Email Support") {
              return (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:scale-105 transition-all"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${method.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {method.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {method.description}
                  </p>
                  <div className="flex justify-between text-xs mb-3">
                    <span className="text-white font-medium">
                      {method.value}
                    </span>
                    <button
                      onClick={() => copyContact(method.value, method.title)}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      {copiedContact === method.title ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Send className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-between text-xs mb-3">
                    <span className="text-gray-500">
                      Response: {method.responseTime}
                    </span>
                    <span
                      className={
                        method.available === "Online now"
                          ? "text-green-400"
                          : "text-gray-400"
                      }
                    >
                      {method.available}
                    </span>
                  </div>
                  <button
                    className={`w-full bg-gradient-to-r ${method.color} hover:opacity-90 text-white py-2 rounded-xl font-medium`}
                    onClick={() => setShowEmailModal(true)}
                  >
                    Send Email
                  </button>

                  {/* Email Modal */}
                  {showEmailModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                      <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-white/20 relative">
                        <button
                          className="absolute top-3 right-3 text-white/60 hover:text-white"
                          onClick={() => {
                            setShowEmailModal(false);
                            setEmailSupportMsg("");
                            setEmailSupportStatus("idle");
                            setEmailSupportName(storedUser.name || "");
                            setEmailSupportEmail(storedUser.email || "");
                            setEmailSupportPriority("normal");
                          }}
                        >
                          &times;
                        </button>
                        <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
                          <Mail className="w-5 h-5" /> Email Support
                        </h2>
                        <div className="mb-4">
                          <label className="block mb-1 text-white font-medium">
                            Name
                          </label>
                          <input
                            type="text"
                            className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/30"
                            value={emailSupportName}
                            readOnly
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block mb-1 text-white font-medium">
                            Email
                          </label>
                          <input
                            type="email"
                            className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/30"
                            value={emailSupportEmail}
                            readOnly
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block mb-1 text-white font-medium">
                            Priority
                          </label>
                          <select
                            className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/30"
                            value={emailSupportPriority}
                            onChange={(e) =>
                              setEmailSupportPriority(e.target.value)
                            }
                          >
                            <option value="normal">Normal</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                        <textarea
                          className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/30 mb-4"
                          rows={5}
                          placeholder="Describe your issue or question..."
                          value={emailSupportMsg}
                          onChange={(e) => setEmailSupportMsg(e.target.value)}
                        />
                        <button
                          className="w-full p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-bold text-lg hover:opacity-90 disabled:opacity-50"
                          disabled={
                            emailSupportStatus === "sending" ||
                            !emailSupportMsg.trim() ||
                            !emailSupportName.trim() ||
                            !emailSupportEmail.trim()
                          }
                          onClick={async () => {
                            setEmailSupportStatus("sending");
                            try {
                              await axios.post(
                                "http://localhost:5000/api/contact/send",
                                {
                                  name: emailSupportName,
                                  email: emailSupportEmail,
                                  subject: "User Support Request",
                                  message: emailSupportMsg,
                                  priority: emailSupportPriority,
                                }
                              );
                              setEmailSupportStatus("sent");
                              setTimeout(() => {
                                setShowEmailModal(false);
                                setEmailSupportMsg("");
                                setEmailSupportStatus("idle");
                                setEmailSupportName(storedUser.name || "");
                                setEmailSupportEmail(storedUser.email || "");
                                setEmailSupportPriority("normal");
                              }, 2000);
                            } catch (err) {
                              setEmailSupportStatus("error");
                            }
                          }}
                        >
                          {emailSupportStatus === "sending"
                            ? "Sending..."
                            : emailSupportStatus === "sent"
                            ? "Sent!"
                            : "Send Email"}
                        </button>
                        {emailSupportStatus === "error" && (
                          <div className="mt-3 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-center">
                            Failed to send. Try again.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // Default for other methods
            return (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:scale-105 transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${method.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {method.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {method.description}
                </p>
                <div className="flex justify-between text-xs mb-3">
                  <span className="text-white font-medium">{method.value}</span>
                  {method.title === "Phone Support" && (
                    <button
                      onClick={() => copyContact(method.value, method.title)}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      {copiedContact === method.title ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Send className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
                <div className="flex justify-between text-xs mb-3">
                  <span className="text-gray-500">
                    Response: {method.responseTime}
                  </span>
                  <span
                    className={
                      method.available === "Online now"
                        ? "text-green-400"
                        : "text-gray-400"
                    }
                  >
                    {method.available}
                  </span>
                </div>
                <button
                  className={`w-full bg-gradient-to-r ${method.color} hover:opacity-90 text-white py-2 rounded-xl font-medium`}
                >
                  {method.action}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* FAQ */}
      {activeTab === "faq" && (
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {faqCategories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-6 h-6 text-blue-400" />
                    <h4 className="text-lg font-bold text-white">
                      {cat.title}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {cat.questions.map((q, i) => (
                      <p key={i} className="text-gray-300 text-sm">
                        • {q}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactSection;
