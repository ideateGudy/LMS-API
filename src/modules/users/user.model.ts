import mongoose, {Types, Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { logger } from "../../utils/logger";
import { APIError } from "../../utils/errorClass";

const schemaLogger = logger.child({
  logIdentifier: "UserSchema Model",
});

// Define interface for User document
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: "student" | "instructor" | "admin";
  enrolledCourses: mongoose.Types.ObjectId[];
  createdBy?: mongoose.Types.ObjectId | null;
  comparePassword(password: string): Promise<boolean>;
  isAdmin: boolean;
}

// Define interface for User model with static methods
interface IUserModel extends Model<IUser> {
  login(identifier: string, password: string): Promise<IUser>;
}

const UserSchema = new Schema<IUser, IUserModel>(
  {
    username: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { 
    timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
  }
);

// Virtual for isAdmin
UserSchema.virtual("isAdmin").get(function (this: IUser) {
  return this.role === "admin";
});

// Virtual for coursesCreatedByUser
UserSchema.virtual("coursesCreatedByUser", {
  ref: "Course",
  localField: "_id",
  foreignField: "createdBy",
});

// Indexes
UserSchema.index({ username: 1, email: 1 });

// Hash password before saving
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    schemaLogger.error("Error hashing password:", error);
    next(error as Error);
  }
});

// Login User static method
UserSchema.statics.login = async function (identifier: string, password: string): Promise<IUser> {
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

// Compare passwords instance method
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// Create and export the model
const User = mongoose.model<IUser, IUserModel>("User", UserSchema);
export default User;