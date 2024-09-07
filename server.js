require("dotenv").config();
require("./config/passport");
const MongoStore = require("connect-mongo");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const logger = require("./utils/logger");
const { corsOptions } = require("./utils/corsOptions");

const passport = require("passport");
const session = require("express-session");

const app = express();

// Import routes
const authRoutes = require("./Routes/AuthRoutes");
const userRoutes = require("./Routes/UserRoutes");
const tradesRoutes = require("./Routes/TradesRoutes");
const chatRooutes = require("./Routes/ChatRoutes");
const paymentRoutes = require("./Routes/PaymentsRoutes");

// CORS setup
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Secret for session encryption
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/trades", tradesRoutes);
app.use("/gemini", chatRooutes);
app.use("/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the syntho next");
});

const PORT = process.env.PORT || 3500;
const ENV = process.env.NODE_ENV || "development";

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT} in ${ENV} mode`);
    });
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB", err);
  });
