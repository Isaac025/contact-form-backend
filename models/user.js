const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "Field is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Field is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Field is required"],
      unique: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
      lowercase: true,
    },

    password: {
      type: String,
      minlength: [6, "Minimum password length is 6"],
      required: [true, "Password is required"],
    },

    query: {
      type: String,
      enum: ["General Query", "Support Request"],
      required: [true, "Please select a query type"],
      default: "General Query",
    },
    message: {
      type: String,
      required: [true, "This field is required"],
      minlength: [30, "Minimum 30 characters required"],
    },

    acceptTerms: {
      type: Boolean,
      required: [true, "Please consent to being contacted"],
      default: false,
      validate: {
        validator: function (value) {
          return value === true;
        },
        message: "You must accept the terms and conditions",
      },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
  },
  { timestamps: true }
);

const USER = mongoose.model("user", userSchema);

module.exports = USER;

//test@, match
