const dotenv = require("dotenv").config();
const express = require("express");

const app = express();

const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require("express-session");

//import controllers
const authController = require("./controllers/auth");

const port = process.env.PORT ? process.env.PORT : "3000";
mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}`);
});

///Middleware

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.static("public"));

app.use("/auth", authController);

//Using car.js in models
const Car = require("./models/car");
app.post("/add-your-car/form", async (req, res) => {
  try {
    req.body.owner = req.session.user._id;
    await Car.create(req.body); // 👈 schema used HERE
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.send("Error saving car");
  }
});

//Get
app.get("/", async (req, res) => {
    try {
      const allCars = await Car.find(); // get all cars
      res.render("index.ejs", {
        user: req.session.user, // ✅ pass the logged-in user
        cars: allCars,          // ✅ pass cars to render list
      });
    } catch (err) {
      console.log("Error fetching cars:", err);
      res.send("Error loading home page");
    }
  });

/// Adding a car
app.get("/add-your-car", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }

  // Get only this user's cars
  const userCars = await Car.find({ owner: req.session.user._id });

  res.render("dashboard.ejs", {
    user: req.session.user,
    cars: userCars,
  });
});

//==========================
//ACTION INDEX

// GET /cars

app.get("/cars", async (req, res) => {
  try {
    const allCars = await Car.find();
    res.render("cars/index.ejs", {
      cars: allCars,
      user: req.session.user, // ✅ pass user info
    });
  } catch (err) {
    console.log("Error fetching cars:", err);
    res.send("Error fetching cars");
  }
});

//Get/cars/new

app.get("/cars/new", (req, res) => {
  res.render("cars/new.ejs");
});

//ACTION: SHOW

// Get/cars/:id

app.get("/cars/:id", async (req, res) => {
  const foundCar = await Car.findById(req.params.id);
  res.render("cars/show.ejs", { car: foundCar });
});

//ACTION: DELETE
//DELETE /cars/:id

app.delete("/cars/:id", async (req, res) => {
  await Car.findByIdAndDelete(req.params.id);
  res.redirect("/cars");
});

//ACTION; EDIT

// GET/cars/:id/edit
app.get("/cars/:id/edit", async (req, res) => {
  const foundCar = await Car.findById(req.params.id);

  res.render("cars/edit.ejs", { car: foundCar });
});

// ACTION: UPDATE

//PUT /cars/:id

app.put("/cars/:id", async (req, res) => {
  if (req.body.isGoodToDrive === "on") {
    req.body.isGoodToDrive = true;
  } else {
    req.body.isGoodToDrive = false;
  }

  await Car.findByIdAndUpdate(req.params.id, req.body);

  res.redirect(`/cars/${req.params.id}`);
});

//ACTION: CREATE
//Post/cars
app.post("/cars", async (req, res) => {
  try {
    // Convert checkbox to boolean
    req.body.isGoodToDrive = req.body.isGoodToDrive === "on";

    // Assign owner if logged in
    if (req.session.user) {
      req.body.owner = req.session.user._id;
    }

    // Create the car
    const newCar = await Car.create(req.body);
    console.log("Created Car:", newCar); // Debug: check console

    res.redirect("/cars");
  } catch (err) {
    console.log("Error creating car:", err);
    res.send("Error creating car");
  }
});

app.listen(port, () => {
  console.log(`The express app is listening on port ${port}`);
});
