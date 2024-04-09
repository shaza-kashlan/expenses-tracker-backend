const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const uploader = require("../middleware/cloudinary.config.js");

const router = express.Router();

// POST /signup
router.post("/signup", async (req, res, next) => {
  const { emailAddress, password, userName } = req.body;

  if (!emailAddress || !password || !userName) {
    return res.status(400).json({ message: "Provide all required fields." });
  }
  // Validate emailAddress format and password format...

  //check the length of the password and that there is all the fields and password strength
  // Check if the email or password or name is provided as an empty string
  if (emailAddress === "" || password === "" || userName === "") {
    res.status(400).json({ message: "Provide email, password and name" });
    return;
  }

  // Use regex to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(emailAddress)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  // Use regex to validate the password format
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }
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
          expiresIn: "2h",
          algorithm: "HS256",
        });
        const refreshToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          expiresIn: "24h",
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
      expiresIn: "2h",
    });

    return res.status(200).json({ token: newToken });
  } catch (error) {
    return res.status(400).send("Invalid refresh token.");
  }
});

// GET /auth/verify
router.get("/verify", isAuthenticated, (req, res, next) => {
  console.log("req.payload", req.payload);
  res.status(200).json(req.payload);
});

router.get("/", isAuthenticated, async (req, res, next) => {
  const { _id } = req.payload;
  try {
    console.log(req.payload);
    const user = await User.findById(_id);
    if (!user) {
      res
        .status(404)
        .json({ code: 404, message: "could not find a user with that ID" });
      return;
    } else {
      res.status(200).json(user);
      return;
    }
  } catch (err) {
    if (
      err.toString() ===
      "BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
    ) {
      res
        .status(404)
        .json({ code: 404, message: "could not find a user with that ID" });
      return;
    }
    console.error("error in find user by ID", err);
    next(err);
  }
});

router.put("/", isAuthenticated, async (req, res, next) => {
  const { _id } = req.payload;
  const updatedVersion = req.body;

  try {
    const user = await User.findById(_id);
    if (!user) {
      res
        .status(404)
        .json({ code: 404, message: "could not find a user with that ID" });
      return;
    }

    const updatedUser = await User.findByIdAndUpdate(_id, updatedVersion, {
      new: true,
    });
    res.status(201).json(updatedUser);
    return;
  } catch (err) {
    if (
      err?.reason?.toString() ===
      "BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
    ) {
      res
        .status(404)
        .json({ code: 404, message: "could not find a user with that ID" });
      return;
    }
    if (err.toString().includes("E11000 duplicate key error")) {
      res.status(400).json({
        code: 400,
        reason: "duplicate_key",
        message:
          "there is already a user with that name, please try again with something a little more unique",
      });
      return;
    }
    console.error("error in update user by ID", err);
    next(err);
  }
});

router.post(
  "/upload",
  isAuthenticated,
  uploader.single("imageUrl"),
  async (req, res, next) => {
    // the uploader.single() callback will send the file to cloudinary and get you and obj with the url in return
    console.log("file is: ", req.file);

    if (!req.file) {
      console.log("there was an error uploading the file");
      return;
    }

    const { _id } = req.payload;
    const updatedVersion = req.body;

    try {
      const user = await User.findById(_id);
      if (!user) {
        res
          .status(404)
          .json({ code: 404, message: "could not find a user with that ID" });
        return;
      }
      updatedVersion.imageUrl = req.file.path;
      const updatedUser = await User.findByIdAndUpdate(_id, updatedVersion, {
        new: true,
      });
      res.status(201).json(updatedUser);
      return;
    } catch (err) {
      if (
        err?.reason?.toString() ===
        "BSONError: input must be a 24 character hex string, 12 byte Uint8Array, or an integer"
      ) {
        res
          .status(404)
          .json({ code: 404, message: "could not find a user with that ID" });
        return;
      }
      if (err.toString().includes("E11000 duplicate key error")) {
        res.status(400).json({
          code: 400,
          reason: "duplicate_key",
          message:
            "there is already a user with that name, please try again with something a little more unique",
        });
        return;
      }
      console.error("error in update user by ID", err);
      next(err);
    }
  }
);

module.exports = router;
