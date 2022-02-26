const express = require("express");
const { body, check } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/user");
 
const isAuth = require("../middleware/is-auth");
const router = express.Router();

 
router.post(
  "/login",
  
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .normalizeEmail(),
    body("password", "Password has to be valid.")
      .isLength({ min: 5, max: 10 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.login
);

 
router.post(
  "/signup",
 
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-Mail exists already, please pick a different one."
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords have to match!");
        }
        return true;
      }),
  ],
  authController.signup
);

router.post("/logout", isAuth, authController.logout);

 
router.post("/reset", authController.reset);

 
router.patch(
  "/user/:userId",
  [
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
 
  authController.updatePassword
);

module.exports = router;
