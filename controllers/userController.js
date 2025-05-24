const USER = require("../models/user");
const generateToken = require("../helpers/generateToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail } = require("../email/sendEmail");

const handleContact = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: "Request body is missing" });
  }
  const { firstName, lastName, email, password, query, message, acceptTerms } =
    req.body;

  if (!firstName.trim() || !lastName.trim()) {
    return res.status(400).json({
      success: false,
      message: "First name and last name are required",
    });
  }

  if (!email.trim()) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  if (!message.trim() || message.length < 30) {
    return res.status(400).json({
      success: false,
      message: "Message must be at least 30 characters",
    });
  }

  if (acceptTerms !== true) {
    return res.status(400).json({
      success: false,
      message: "You must accept the terms and conditions",
    });
  }

  try {
    //check if user exists
    const existingUser = await USER.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    //protect users password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    //verify user
    const verificationToken = generateToken();
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    //save to db
    const user = await USER.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      query: query || "Support Request",
      message,
      acceptTerms: acceptTerms || true,
      verificationToken,
      verificationTokenExpires,
    });

    //send an email

    const clientUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendWelcomeEmail({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      clientUrl,
    });

    res
      .status(201)
      .json({ success: true, message: "Message sent successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const handleVerify = async (req, res) => {
  const { token } = req.params;

  try {
    //1. find user by token
    const user = await USER.findOne({
      verificationToken: token,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid Verification Token" });
    }

    //2. Check if token has expired
    if (user.verificationTokenExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "Verification Token has Expired", email: user.email });
    }

    //3. check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "Email Already Verified" });
    }

    //mark the user as verified
    (user.isVerified = true),
      (user.verificationToken = undefined),
      (user.verificationTokenExpires = undefined);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { handleContact, handleVerify };
