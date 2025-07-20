import bcrypt from "bcrypt";
import User from "../models/users.js";
import jwt from "jsonwebtoken";
import { inngest } from "../ingest/client.js";

export const singUp = async (req, res) => {
    const { email, password, skills = [] } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            password: hashedPassword,
            skills,
        });

        await user.save();

        await inngest.send({
            name: "user.signup",
            data: { email },
        });

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);

        return res.status(201).json({
            message: "User created successfully",
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                skills: user.skills,
            },
            token
        });

    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getUsers = async (req, res) => {
    try {
        // if (req.user.role !== "admin") {
        //     return res.status(403).json({ error: "Forbidden" });
        // }

        const users = await User.find().select("-password");
        return res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Update failed", details: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
        return res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                skills: user.skills,
            },
            token
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({ message: "Internal server error" });

    }
}

export const logout = (req, res) => {
    // Invalidate the token on the client side
    return res.status(200).json({ message: "Logout successful" });
}

export const updateUser = async (req, res) => {
    const { email, role, skills = [] } = req.body;
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden: Only admins can update users" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await User.updateOne({ email: user.email }, {
            role,
            skills: skills.length > 0 ? skills : user.skills,
        });

        return res.status(200).json({ message: "User updated successfully" });
    }
    catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getUser = async (req, res) => {
    const { email } = req.query;

    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            message: "User retrieved successfully",
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                skills: user.skills,
                createdAt: user.createdAt,
            }
        });
    } catch (error) {
        console.error("Error retrieving user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}