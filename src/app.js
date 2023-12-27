const express = require("express");
const cors = require("cors");
const userRouter = require("./routers/userRoute");
const agentRouter = require("./routers/agentRoute");
const propertyRouter = require("./routers/propertyRoute");
const appointmentRouter = require("./routers/appointmentRoute");

const app = express();

var corsOptions = {
  origin: "https://localhost:3000",
};

// Middlewares \\
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers \\
app.use("/api/users", userRouter);
app.use("/api/agents", agentRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/appointments", appointmentRouter);

// Home Page \\
app.get("/", (req, res) => {
  res.json({ message: "Hello from API" });
});

module.exports = app;
