require("dotenv").config();
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
 
const mongoose = require("mongoose");

const schedule = require("node-schedule");

const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const { removeUnSubmitedFiles } = require("./util/scheduling");

const MONGODB_URI =  process.env.MONGODB_URI;
  
const rule = new schedule.RecurrenceRule();
rule.second = 0;
// rule.hour = 1;
schedule.scheduleJob(rule, removeUnSubmitedFiles);
const app = express();

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

 
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(shopRoutes);
app.use(authRoutes);
app.use("/admin", adminRoutes);

app.use(function (error, req, res, next) {
  if (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "server error.";
    }

    const status = error.statusCode;
    const message = error.message;

    return res.status(status).json({ message: message });
  }
  res.status(404).json({ message: "not found." });
});
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
