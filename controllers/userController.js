const USER = require("../models/user");
const generateToken = require("../helpers/generateToken");

const handleContact = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: "Request body is missing" });
  }
  const { firstName, lastName, email, query, message, acceptTerms } = req.body;

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

    //verify user
    const verificationToken = generateToken();
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    //save to db
    const user = await USER.create({
      firstName,
      lastName,
      email,
      query: query || "Support Request",
      message,
      acceptTerms: acceptTerms || true,
      verificationToken,
      verificationTokenExpires,
    });
    res
      .status(201)
      .json({ success: true, message: "Message sent successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { handleContact };
