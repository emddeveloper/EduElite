import { Schema, model, models, Types } from "mongoose";

export interface IGrade {
  _id?: Types.ObjectId;
  student: Types.ObjectId;
  course: Types.ObjectId;
  assignment: string;
  score: number;
}

const GradeSchema = new Schema<IGrade>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    assignment: { type: String, required: true },
    score: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Grade = models.Grade || model<IGrade>("Grade", GradeSchema);
