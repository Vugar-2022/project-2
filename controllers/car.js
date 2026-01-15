const express = require("express");
const router = express.Router();
const Car = require("../models/car");

// show form
router.get("/add-your-car", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/auth/sign-in");
  }

  res.render("cars/new");
});

// create car
router.post("/", async (req, res) => {
  try {
    req.body.owner = req.session.user._id;
    await Car.create(req.body);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.send("Error adding car");
  }
});

module.exports = router;
