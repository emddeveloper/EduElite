import { Schema, model, models, Types } from "mongoose";

export interface ICourse {
  _id?: Types.ObjectId;
  name: string;
  description?: string;
  credits: number;
  assignedTeacher?: Types.ObjectId;
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true },
    description: { type: String },
    credits: { type: Number, default: 3 },
    assignedTeacher: { type: Schema.Types.ObjectId, ref: "Teacher" },
  },
  { timestamps: true }
);

export const Course = models.Course || model<ICourse>("Course", CourseSchema);
