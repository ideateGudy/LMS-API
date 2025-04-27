import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Interface for Progress document
interface IProgress extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  percentage: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Progress model
export interface IProgressModel extends Model<IProgress> {
  // You can add static methods here if needed
}

// Define the schema
const progressSchema: Schema<IProgress, IProgressModel> = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    percentage: { 
      type: Number, 
      default: 0, 
      min: 0, 
      max: 100 
    },
    lastUpdated: { 
      type: Date, 
      default: Date.now 
    },
  },
  { 
    timestamps: true  // Adds createdAt and updatedAt automatically
  }
);

// Create unique compound index
progressSchema.index({ student: 1, course: 1 }, { unique: true });

// Create and export the model
const Progress: IProgressModel = mongoose.model<IProgress, IProgressModel>(
  'Progress', 
  progressSchema
);

export default Progress;