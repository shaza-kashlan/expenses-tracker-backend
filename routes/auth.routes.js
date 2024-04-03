const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

const router = express.Router();

// POST /signup
router.post("/signup", async (req, res, next) => {
  const { emailAddress, password, userName } = req.body;

  if (!emailAddress || !password || !userName) {
    return res.status(400).json({ message: "Provide all required fields." });
  }

  // Validate emailAddress format and password format...
  try {
    const foundUser = await User.findOne({ emailAddress });
    if (foundUser) {
      res.status(403).json({ message: "user already exit " });
    } else {
      //before creating a user, make sure to hash his or her password
      const mySalt = bcryptjs.genSaltSync(12);
      const hashedPassword = bcryptjs.hashSync(password, mySalt);
      const hashedUser = {
        ...req.body,
        password: hashedPassword,
      };

      const createdUser = await User.create(hashedUser);
      console.log("user created", createdUser);
      res.status(201).json({
        message: "New User Created Successfully",
        newUser: createdUser,
      });
    }
  } catch (err) {
    console.log("error signing up", err);
    res.status(500).json(err);
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { emailAddress, password } = req.body;

  if (!emailAddress || !password) {
    res
      .status(400)
      .json({ message: "Provide emailAddress and password is required" });
    return;
  }

  try {
    const foundUser = await User.findOne({ emailAddress });
    console.log("we found a user:", foundUser);
    if (!foundUser) {
      res.status(400).json({
        message: "No user with that email",
      });
    } else {
      const doesPasswortMatch = bcryptjs.compareSync(
        password,
        foundUser.password
      );
      if (!doesPasswortMatch) {
        res.status(400).json({
          message: "Incorrect password please try again!",
        });
      } else {
        const { _id, userName } = foundUser;
        const payload = { _id, userName };

        const accessToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          expiresIn: "1m",
          algorithm: "HS256",
        });
        const refreshToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          expiresIn: "2m",
          algorithm: "HS256",
        });

        res.status(200).json({
          message: "You successfully logged in",
          accessToken,
          refreshToken,
        });
      }
    }
  } catch (err) {
    console.log("error when logging in", err);
    res.status(500).json({ err });
  }
});

// refresh access token
router.post("/refresh", isAuthenticated, (req, res) => {
  try {
    console.log("\n \n inside refresh \n\n", req.payload);
    const { _id, userName } = req.payload;

    const newToken = jwt.sign({ _id, userName }, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "1m",
    });

    return res.status(200).json({ token: newToken });
  } catch (error) {
    return res.status(400).send("Invalid refresh token.");
  }
});

// GET /auth/verify
router.get("/verify", isAuthenticated, (req, res, next) => {
  console.log(`req.payload`, req.payload);
  res.status(200).json(req.payload);
});

module.exports = router;
