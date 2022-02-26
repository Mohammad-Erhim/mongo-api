const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user");
const mailgun = require("mailgun-js");
const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});


 
exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      const error = new Error("A user with this email could not be found.");
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      const error = new Error("Not authenticated.");
      error.statusCode = 401;
      throw error;
    }
    const doMatch = await bcrypt.compare(password, user.password);

    if (!doMatch) {
      const error = new Error("Wrong password!");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      "somesupersecretsecret",
      { expiresIn: "1h" }
    );
    return res.status(200).json({ token: token, userId: user._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
 

exports.signup = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
 try {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 400;
    error.data = errors.array();
    throw error;
  }
 
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPassword,
      cart: [],
    });
    await user.save();
    res.status(201).json({ message: "user created.", userId: user._id });
  } catch (err) {
 
    next(err);
  }
};

exports.logout = (req, res, next) => {
 
};

 

exports.reset = (req, res, next) => {
  crypto.randomBytes(32, async (error, buffer) => {
    if (error) 
    return  next(error);
    

    const token = buffer.toString("hex");
    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        req.flash("error", "No account with that email found.");
        req.flash("email", req.body.email);
        return res.redirect("/reset");
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
   await   user.save();
     await  mg.messages().send({
      to: req.body.email,
      from: "shop@node-complete.com",
      subject: "Password reset",
      html: `
              <p>You requested a password reset</p>
              <p>Click this <a href="${process.env.APP_URL}/update-password/${token}">link</a> to set a new password.</p>
            `,
    });
      res.status(200).json({ message: "reset link sent.", userId: user._id });
    } catch (err) {
   
      next(err);
    }
  });
};

exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

 
    res.render("auth/new-password", {
      path: "/new-password",
      pageTitle: "New Password",
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token,
      oldInput: { password: null },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.params.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  const errors = validationResult(req);
  try {  if (!errors.isEmpty())
  {  const error = new Error("Wrong password!");
    error.statusCode = 400;
    error.data=errors.array();
    throw error;
}
    const user = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });

    resetUser = user;
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;

    await resetUser.save();

    res.status(200).json({ message: "password updated.", userId:userId });
  } catch (err) {
    next(err);
  }
};
