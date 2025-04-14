// modules/users/user.model.js
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { logger } from "../../utils/logger.js";
import { APIError } from "../../utils/errorClass.js";
const schemaLogger = logger.child({
  logIdentifier: "UserSchema Model",
});

const UserSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin", "mentor"],
      default: "student",
    },
    bio: String,
    profilePhoto: { type: String },
    courses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    bookmarks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    socialLinks: [
      {
        platform: String,
        url: String,
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetToken: String,
  },
  { timestamps: true }
);

UserSchema.index({ username: 1, email: 1 });

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    schemaLogger.error("Error hashing password:", error);
    next(error);
  }
});

//Login User
UserSchema.statics.login = async function (identifier, password) {
  const user = await this.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  if (!user) {
    const type = identifier.includes("@") ? "Email" : "Username";
    throw new APIError(`${type} not found`, 404);
  }

  const confirmPassword = await bcrypt.compare(password, user.password);
  if (!confirmPassword) {
    throw new APIError("Incorrect Password", 401);
  }

  return user;
};

export default mongoose.model("User", UserSchema);
