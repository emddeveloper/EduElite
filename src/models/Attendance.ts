import { Schema, model, models, Types } from "mongoose";

export interface IAttendance {
  _id?: Types.ObjectId;
  student: Types.ObjectId;
  course: Types.ObjectId;
  date: Date;
  status: "present" | "absent";
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["present", "absent"], required: true },
  },
  { timestamps: true }
);

export const Attendance = models.Attendance || model<IAttendance>("Attendance", AttendanceSchema);
