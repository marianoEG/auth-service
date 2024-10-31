const mongoose = require("mongoose");
const { dbConnection } = require("./config/config");

const connectDB = async () => {
  try {
    await mongoose.connect(dbConnection, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
