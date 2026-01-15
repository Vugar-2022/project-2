const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

//GET/auth/sign-up

router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs");
});

//POST/auth/sign-up
router.post("/sign-up", async (req, res) => {
  const userInDatabase = await User.findOne({ username: req.body.username });
  if (userInDatabase) {
    return res.send("Username already taken!");
  }
  if (req.body.password !== req.body.confirmPassword) {
    return res.send("Password and Confirm Password must be the same");
  }

  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  req.body.password = hashedPassword;

  const user = await User.create(req.body);

  // ✅ Log the user in automatically after sign-up
  req.session.user = {
    username: user.username,
    _id: user._id,
  };

  // Redirect to home page after sign-up
  res.redirect("/");
});

//Get/auth/sign-in
router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in.ejs");
});

router.post("/sign-in", async (req, res) => {
  const userInDatabase = await User.findOne({ username: req.body.username });
  if (!userInDatabase) {
    return res.send("Login failed. Please try again");
  }

  const validPassword = bcrypt.compareSync(
    req.body.password,
    userInDatabase.password
  );
  if (!validPassword) {
    return res.send("Login failed. Please try again");
  }

  req.session.user = {
    username: userInDatabase.username,
    _id: userInDatabase._id,
  };
  res.redirect("/");
});

router.get("/sign-out", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error signing out:", err);
      return res.send("Error signing out");
    }
    res.redirect("/"); // redirect to homepage after logout
  });
});

module.exports = router;
