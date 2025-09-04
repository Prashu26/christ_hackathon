const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/user.model");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    // Clear old data
    await User.deleteMany({});

    // Generate 10 demo users
    const demoUsers = Array.from({ length: 10 }).map((_, i) => {
      // Create unique 12-digit Aadhaar number
      const aadhaarNumber = String(100000000000 + i); // 100000000000 → 100000000009

      return {
        name: `Demo User ${i + 1}`,
        dateOfBirth: `199${i}-01-01`,
        gender: i % 2 === 0 ? "male" : "female",
        photo: `https://randomuser.me/api/portraits/${
          i % 2 === 0 ? "men" : "women"
        }/${i + 10}.jpg`,
        aadhaarNumber, // full 12 digits
        email: `demo${i + 1}@example.com`,
        verified: i === 1 || i === 2 ? true : false, // 2nd & 3rd user verified
        isAdmin: i === 0 ? true : false, // 1st user is admin
      };
    });

    await User.insertMany(demoUsers);

    console.log("🎉 10 Demo users created!");
    console.log("➡️ 1 Admin, 2 Verified Users, 7 Normal Users");
    process.exit();
  })
  .catch((err) => {
    console.error("❌ Error seeding:", err);
    process.exit(1);
  });
