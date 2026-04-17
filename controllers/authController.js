import { signInService, signUpService } from "../services/authServices.js";

export const signUp = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const result = await signUpService({ name, email, mobile, password });
    return res
      .status(201)
      .json({ message: "Account created successfully.", user: result });
  } catch (error) {
    if (error.message === "EMAIL_EXISTS") {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }
    if (error.message === "MOBILE_EXISTS") {
      return res
        .status(409)
        .json({
          message: "An account with this mobile number already exists.",
        });
    }
    console.error("[signUp] Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const result = await signInService({ email, password });
    return res
      .status(200)
      .json({
        message: "Signed in successfully.",
        token: result.token,
        user: result.user,
      });
  } catch (error) {
    if (error.message === "USER_NOT_FOUND") {
      return res
        .status(404)
        .json({ message: "No account found with this email." });
    }
    if (error.message === "INVALID_PASSWORD") {
      return res.status(401).json({ message: "Incorrect password." });
    }
    console.error("[signIn] Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
