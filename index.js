require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 5002;
const userRouter = require("./routes/userRouter");
const mongoose = require("mongoose");

//middleware
app.use(express.json());
app.use(cors());


app.get("/", (req, res) => {
  res
    .status(200)
    .json({ sucess: true, message: "welcome to the contact page" });
});

//routes
app.use("/api/user", userRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "contactus" });
    app.listen(PORT, () => {
      console.log(`app is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();
