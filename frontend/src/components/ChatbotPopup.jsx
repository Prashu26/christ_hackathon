import { useState, useRef, useEffect } from "react";
import axios from "axios";

const SYSTEM_PROMPT = `\nYou are an assistant for a privacy-preserving digital identity platform.\nHelp users with questions about digital credentials, QR code verification, education certificates, privacy, and using the platform.\nDo not answer admin or backend-only questions.\nAlways be friendly, concise, and helpful.\n`;

function ChatbotPopup() {
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
      setMessages((msgs) => [...msgs, { role: "assistant", content: reply }]);
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
