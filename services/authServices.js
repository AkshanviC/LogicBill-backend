import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Users from "../models/users.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_change_in_env";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Sign Up — creates a new user after checking for duplicate email/mobile.
 * Password hashing is handled by the Sequelize model setter.
 */
export const signUpService = async ({ name, email, mobile, password }) => {
  const existingEmail = await Users.findOne({ where: { email } });
  if (existingEmail) throw new Error("EMAIL_EXISTS");

  const existingMobile = await Users.findOne({ where: { mobile } });
  if (existingMobile) throw new Error("MOBILE_EXISTS");

  const user = await Users.create({ name, email, mobile, password, role });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
  };
};

/**
 * Sign In — validates credentials and returns a signed JWT.
 */
export const signInService = async ({ email, password }) => {
  const user = await Users.findOne({ where: { email } });
  if (!user) throw new Error("USER_NOT_FOUND");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("INVALID_PASSWORD");

  const payload = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    },
  };
};
