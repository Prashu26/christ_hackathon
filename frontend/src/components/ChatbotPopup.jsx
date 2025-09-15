import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SYSTEM_PROMPT = `\nYou are an assistant for a privacy-preserving digital identity platform.\nHelp users with questions about digital credentials, QR code verification, education certificates, privacy, and using the platform.\nDo not answer admin or backend-only questions.\nAlways be friendly, concise, and helpful.\n`;

function ChatbotPopup() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  // Get user details from localStorage for greeting
  let userName = "";
  try {
    const user = JSON.parse(localStorage.getItem("userData"));
    if (user && user.name) userName = user.name;
  } catch {}

  const [messages, setMessages] = useState([
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "assistant",
      content: userName
        ? `Hi ${userName}! 👋 How can I help you with your digital credentials today?`
        : "Hi! 👋 How can I help you with your digital credentials today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);

    // Robust user route navigation intent detection
    const lowerInput = input.toLowerCase();
    // Loan
    const loanKeywords = [
      "apply for a loan",
      "loan application",
      "get a loan",
      "loan process",
      "loan section",
      "loan page",
      "loan form",
      "loan request",
      "loan",
      "borrow money",
      "need a loan",
      "want a loan",
      "how to apply for loan",
      "how do i get a loan",
      "where is the loan page",
      "loan status",
    ];
    if (loanKeywords.some((kw) => lowerInput.includes(kw))) {
      setMessages((msgs) => [
        ...msgs,
        {
          role: "assistant",
          content:
            "To apply for a loan, follow these steps:\n1. Click the 'Loan' option in the main menu or sidebar.\n2. You will be taken to the Loan Application page.\n3. Fill out the required details and submit your application.\n4. You can track your loan status after submission.\n\nRedirecting you to the Loan Application page now...",
        },
      ]);
      setTimeout(() => {
        navigate("/loan");
      }, 1800);
      setLoading(false);
      return;
    }
    // Insurance
    const insuranceKeywords = [
      "apply for insurance",
      "insurance application",
      "get insurance",
      "insurance process",
      "insurance section",
      "insurance page",
      "insurance form",
      "insurance request",
      "insurance",
      "need insurance",
      "want insurance",
      "how to apply for insurance",
      "how do i get insurance",
      "where is the insurance page",
      "insurance status",
    ];
    if (insuranceKeywords.some((kw) => lowerInput.includes(kw))) {
      setMessages((msgs) => [
        ...msgs,
        {
          role: "assistant",
          content:
            "To apply for insurance, follow these steps:\n1. Click the 'Insurance' option in the main menu or sidebar.\n2. You will be taken to the Insurance Application page.\n3. Fill out the required details and submit your application.\n4. You can track your insurance request status after submission.\n\nRedirecting you to the Insurance Application page now...",
        },
      ]);
      setTimeout(() => {
        navigate("/insurance");
      }, 1800);
      setLoading(false);
      return;
    }
    // General user route navigation (add more as needed)
    const routeMap = [
      {
        keywords: ["profile", "my profile", "user profile"],
        route: "/profile",
        instructions:
          "This is your profile page where you can view and manage your account details. Redirecting you to your profile now...",
      },
      {
        keywords: ["education", "education certificates", "my certificates"],
        route: "/education",
        instructions:
          "This is the Education Certificates page where you can view and download your certificates. Redirecting you now...",
      },
      {
        keywords: ["features", "platform features", "what can i do"],
        route: "/features",
        instructions:
          "This is the Features page where you can explore what the platform offers. Redirecting you now...",
      },
      {
        keywords: ["storage", "my storage", "document storage"],
        route: "/storage",
        instructions:
          "This is your Storage page for managing your documents. Redirecting you now...",
      },
      {
        keywords: ["contact", "support", "help", "send email"],
        route: "/contact",
        instructions:
          "This is the Contact page where you can reach out for support. Redirecting you now...",
      },
      {
        keywords: ["home", "dashboard", "main page"],
        route: "/home",
        instructions: "This is your Home page. Redirecting you now...",
      },
      {
        keywords: ["demo", "demo page", "try demo"],
        route: "/demo",
        instructions: "This is the Demo page. Redirecting you now...",
      },
      {
        keywords: ["generate qr", "qr code", "qr generation"],
        route: "/generate-qr",
        instructions: "This is the QR Generation page. Redirecting you now...",
      },
      {
        keywords: ["verifier", "verify credentials", "verifier page"],
        route: "/verifier",
        instructions:
          "This is the Verifier page for credential verification. Redirecting you now...",
      },
      {
        keywords: ["user page", "my page"],
        route: "/user",
        instructions: "This is your User page. Redirecting you now...",
      },
      {
        keywords: [
          "college dashboard",
          "college admin",
          "college dashboard page",
        ],
        route: "/college-dashboard",
        instructions: "This is the College Dashboard. Redirecting you now...",
      },
    ];
    for (const entry of routeMap) {
      if (entry.keywords.some((kw) => lowerInput.includes(kw))) {
        setMessages((msgs) => [
          ...msgs,
          {
            role: "assistant",
            content: entry.instructions,
          },
        ]);
        setTimeout(() => {
          navigate(entry.route);
        }, 1500);
        setLoading(false);
        return;
      }
    }

    // Get user details from localStorage
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("userData"));
    } catch {}

    try {
      const res = await axios.post(
        "http://localhost:5000/api/chatbot/chat",
        {
          messages: messages.filter((m) => m.role !== "system").concat(userMsg),
          user,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      const reply = res.data?.reply || "Sorry, I couldn't understand that.";
      setMessages((msgs) => {
        // If Gemini's reply contains the Contact page/send email instruction, auto-navigate
        if (
          /go to the Contact page and use the Send Email feature|your message will be sent to the admin/i.test(
            reply
          )
        ) {
          setTimeout(() => {
            navigate("/contact", { state: { openSendEmail: true } });
          }, 1200);
        }
        return [...msgs, { role: "assistant", content: reply }];
      });
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        {
          role: "assistant",
          content: "Sorry, there was an error connecting to Gemini.",
        },
      ]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Now Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg font-bold hover:scale-105 transition-all"
        >
          💬 Chat Now
        </button>
      )}

      {/* Chat Popup */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[98vw] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-300">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-700 to-blue-700 rounded-t-xl">
            <span className="font-bold text-white">Identity Assistant</span>
            <button
              onClick={() => setOpen(false)}
              className="text-white text-xl font-bold hover:text-red-300"
              title="Close"
            >
              ×
            </button>
          </div>
          <div
            className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50"
            style={{ maxHeight: 500, minHeight: 250 }}
          >
            {messages
              .filter((m) => m.role !== "system")
              .map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-3 flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg max-w-[80%] text-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t bg-white flex gap-2">
            <textarea
              className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={1}
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{ minHeight: 32, maxHeight: 64 }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-60"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatbotPopup;
