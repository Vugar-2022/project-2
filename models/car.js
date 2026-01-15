// Importing staff

const mongoose = require("mongoose");

// Create the schema

const carSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  color: { type: String },
  milage: { type: String },
  isGoodToDrive: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional, for dashboard
});

//Create Model based on the Schema

const Car = mongoose.model("Car", carSchema);

// Export it to the World

module.exports = Car;
