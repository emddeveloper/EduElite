import { Schema, model, models, Types } from "mongoose";

export interface ITeacher {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  subjectSpecialty: string;
  hireDate: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    subjectSpecialty: { type: String, required: true },
    hireDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Teacher = models.Teacher || model<ITeacher>("Teacher", TeacherSchema);
