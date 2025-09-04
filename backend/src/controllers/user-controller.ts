import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import { hash, compare } from "bcrypt";
import { generateToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/constants.js";

export const getallUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find({});
    return res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.log("Error fetching users:", error);
    return res.status(500).json({
      message: "Error fetching users",
    });
  }
};

export const userSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).send({
        message: "User already exists with this email",
      });
    }
    const hashedPassword = await hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Create a token and set it as an HTTP Only cookie
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      signed: true,
      domain: "localhost",
      path: "/",
    }); // Clear any existing auth token

    const token = generateToken(user._id.toString(), user.email, "7d");
    //HTTP Only Cookie
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // Set cookie to expire in 7 days
    res.cookie(COOKIE_NAME, token, {
      path: "/",
      domain: "localhost",
      expires,
      httpOnly: true,
      signed: true,
    });
    return res.status(201).json({
      message: "User signed up successfully",
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.log("Error signing up user:", error);
    return res.status(500).json({
      message: "Error signing up user",
    });
  }
};

export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found with this email",
      });
    }
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid Email or password",
      });
    }

    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      signed: true,
      domain: "localhost",
      path: "/",
    }); // Clear any existing auth token

    const token = generateToken(user._id.toString(), user.email, "7d");
    //HTTP Only Cookie
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // Set cookie to expire in 7 days
    res.cookie(COOKIE_NAME, token, {
      path: "/",
      domain: "localhost",
      expires,
      httpOnly: true,
      signed: true,
    });

    return res.status(200).json({
      message: "User logged in successfully",
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error logging in user",
    });
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    return res
      .status(200)
      .json({ message: "OK", name: user.name, email: user.email });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};

export const userlogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }

    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      signed: true,
      domain: "localhost",
      path: "/",
    }); // Clear any existing auth token

    return res
      .status(200)
      .json({ message: "OK", name: user.name, email: user.email });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};
