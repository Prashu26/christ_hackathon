import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Server, Users, Lightbulb, Star, Trophy } from "lucide-react";

const Education = () => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);

  // Separate quiz states
  const [quiz1Answered, setQuiz1Answered] = useState(false);
  const [quiz1Correct, setQuiz1Correct] = useState(null);

  const [quiz2Answered, setQuiz2Answered] = useState(false);
  const [quiz2Correct, setQuiz2Correct] = useState(null);

  const handleAnswer = (quest, correct) => {
    if (quest === 1 && !quiz1Answered) {
      setQuiz1Answered(true);
      setQuiz1Correct(correct);
      if (correct) {
        setScore(score + 50);
        setLevel(2);
      }
    }
    if (quest === 2 && !quiz2Answered) {
      setQuiz2Answered(true);
      setQuiz2Correct(correct);
      if (correct) {
        setScore(score + 50);
        setLevel(3);
      }
    }
  };

  return (
    <div className="w-full min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-800 via-cyan-900 to-blue-800 px-6 py-20 text-gray-200">
      {/* Cyber grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf810_1px,transparent_1px),linear-gradient(to_bottom,#38bdf810_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none animate-pulse"></div>

      {/* HUD Top Bar */}
      <motion.div
        className="relative z-10 flex justify-between items-center mb-10 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80 }}
      >
        <h2 className="text-3xl font-bold text-cyan-300 drop-shadow-[0_0_10px_#22d3ee]">
          🎮 LearnQuest
        </h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Star className="text-yellow-400" /> <span>{score} XP</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="text-cyan-200" /> <span>Level {level}</span>
          </div>
        </div>
      </motion.div>

      {/* === Level 1 - Decentralization Quest === */}
      {level >= 1 && (
        <motion.div
          className="relative z-10 flex flex-col items-center gap-6 max-w-5xl mx-auto mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 70 }}
        >
          <h3 className="text-2xl font-bold text-cyan-300 drop-shadow-[0_0_8px_#22d3ee]">
            📡 Quest 1: How Decentralization Works
          </h3>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="backdrop-blur-lg bg-white/5 border border-cyan-500/30 rounded-2xl p-6 shadow-lg hover:shadow-cyan-500/40 transition"
          >
            <img src="/comic1.png" alt="Decentralization Comic" className="rounded-xl" />
          </motion.div>

          {/* Facts */}
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <motion.div whileHover={{ scale: 1.05 }} className="bg-white/5 border border-cyan-400/40 rounded-xl p-5">
              <Server className="w-6 h-6 text-cyan-400 mb-2" />
              No single point of failure ⚡
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="bg-white/5 border border-blue-400/40 rounded-xl p-5">
              <Users className="w-6 h-6 text-blue-400 mb-2" />
              Data shared & replicated 🔄
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="bg-white/5 border border-indigo-400/40 rounded-xl p-5">
              <Shield className="w-6 h-6 text-indigo-400 mb-2" />
              More secure & transparent 🌐
            </motion.div>
          </div>

          {/* Quiz */}
          <div className="mt-10 w-full max-w-2xl bg-white/5 border border-cyan-500/30 rounded-xl p-6">
            <h4 className="text-lg font-semibold mb-4 text-cyan-200">
              📝 Quiz: Why is decentralization important?
            </h4>
            <div className="space-y-3">
              <button onClick={() => handleAnswer(1, true)} className="w-full text-left px-4 py-2 bg-white/10 rounded hover:bg-cyan-600/40 transition">
                It removes single points of failure 
              </button>
              <button onClick={() => handleAnswer(1, false)} className="w-full text-left px-4 py-2 bg-white/10 rounded hover:bg-cyan-600/40 transition">
                It makes things slower 
              </button>
              <button onClick={() => handleAnswer(1, false)} className="w-full text-left px-4 py-2 bg-white/10 rounded hover:bg-cyan-600/40 transition">
                It increases central control 
              </button>
            </div>
            {quiz1Answered && (
              <motion.p className={`mt-4 ${quiz1Correct ? "text-green-400" : "text-red-400"}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {quiz1Correct ? "🎉 Correct! +50 XP Unlocked next quest..." : "❌ Oops! That’s not right. Try reviewing the facts above."}
              </motion.p>
            )}
          </div>
        </motion.div>
      )}

      {/* === Level 2 - ZKP Quest === */}
      {level >= 2 && (
        <motion.div
          className="relative z-10 flex flex-col items-center gap-6 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 70 }}
        >
          <h3 className="text-2xl font-bold text-blue-300 drop-shadow-[0_0_8px_#3b82f6]">
            🔐 Quest 2: Zero Knowledge Proof for Privacy
          </h3>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="backdrop-blur-lg bg-white/5 border border-blue-500/30 rounded-2xl p-6 shadow-lg hover:shadow-blue-500/40 transition"
          >
            <img src="/zkp.png" alt="ZKP Comic" className="rounded-xl" />
          </motion.div>

          {/* Fun Fact */}
          <motion.div whileHover={{ scale: 1.05 }} className="mt-6 bg-white/10 border border-blue-500/30 rounded-xl p-6 cursor-pointer">
            <Lightbulb className="w-6 h-6 text-yellow-400 mb-2" />
            Did you know? You can prove you're <b>18+</b> without revealing your ID 🔥
          </motion.div>

          {/* Quiz */}
          <div className="mt-10 w-full max-w-2xl bg-white/5 border border-blue-500/30 rounded-xl p-6">
            <h4 className="text-lg font-semibold mb-4 text-blue-200">📝 Quiz: What does ZKP protect?</h4>
            <div className="space-y-3">
              <button onClick={() => handleAnswer(2, true)} className="w-full text-left px-4 py-2 bg-white/10 rounded hover:bg-blue-600/40 transition">
                User privacy without revealing data 
              </button>
              <button onClick={() => handleAnswer(2, false)} className="w-full text-left px-4 py-2 bg-white/10 rounded hover:bg-blue-600/40 transition">
                Only passwords 
              </button>
              <button onClick={() => handleAnswer(2, false)} className="w-full text-left px-4 py-2 bg-white/10 rounded hover:bg-blue-600/40 transition">
                Server locations 
              </button>
            </div>
            {quiz2Answered && (
              <motion.p className={`mt-4 ${quiz2Correct ? "text-green-400" : "text-red-400"}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {quiz2Correct ? "🎉 Correct! +50 XP You mastered this quest!" : "❌ Nope! Review the comic and try again."}
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Education;
