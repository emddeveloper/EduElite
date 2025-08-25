import { Schema, model, models, Types } from "mongoose";

export interface IStudent {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  grade: string;
  enrollmentDate: Date;
  parentContact: string;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    grade: { type: String, required: true },
    enrollmentDate: { type: Date, required: true },
    parentContact: { type: String, required: true },
  },
  { timestamps: true }
);

export const Student = models.Student || model<IStudent>("Student", StudentSchema);
