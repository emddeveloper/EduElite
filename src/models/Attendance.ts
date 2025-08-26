import { Schema, model, models, Types } from "mongoose";

export interface IAttendance {
  _id?: Types.ObjectId;
  student: Types.ObjectId;
  course: Types.ObjectId;
  date: Date;
  status: "present" | "absent" | "late" | "excused";
  remarks?: string;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["present", "absent", "late", "excused"], required: true },
    remarks: { type: String },
  },
  { timestamps: true }
);

// Ensure one record per (student, course, date)
AttendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

export const Attendance = models.Attendance || model<IAttendance>("Attendance", AttendanceSchema);
