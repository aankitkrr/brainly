import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { UserModel } from "../models/userModel";

const signupSchema = z.object({
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(20, "At most 20 characters")
    .regex(/^[a-z0-9._]+$/, "Username must contain only lowercase letters, digits, '.', or '_'"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(7, "At least 7 characters")
    .max(20, "At most 20 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*]/, "Password must contain at least one special character")
});

export const signup: RequestHandler = async (req, res) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.errors });
      return;
    }

    const { username, email, password } = parsed.data;

    const existing = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      res.status(409).json({ msg: "Username or email already in use" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ username, email, password: hashed });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!);
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ msg: "Signup failed", error: err });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user){
        res.status(401).json({ msg: "Invalid credentials" });
        return;
    }

    const match = await bcrypt.compare(password, user.password!);
    if (!match){
        res.status(401).json({ msg: "Invalid credentials" });
        return;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!);
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ msg: "Login failed", error: err });
  }
};