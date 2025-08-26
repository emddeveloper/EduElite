import { Schema, model, models, Types } from "mongoose";

export interface IParentInfo {
  name?: string;
  email?: string;
  mobile?: string;
  occupation?: string;
  address?: string;
}

export interface IStudent {
  _id?: Types.ObjectId;
  // Core fields
  name: string;
  email: string;
  grade: string;
  enrollmentDate: Date;
  parentContact: string;

  // Extended student profile
  firstName?: string;
  lastName?: string;
  dob?: Date;
  gender?: string; // e.g., 'Male' | 'Female' | 'Other'
  nationality?: string;
  contactNo?: string;
  photoUrl?: string;
  admissionNo?: string;
  rollNo?: string;
  bloodGroup?: string;
  category?: string;
  religion?: string;
  studentAddress?: string;
  addressSameAsStudent?: boolean;

  // Nested parent information
  parent?: IParentInfo;

  // Flexible bag for future fields
  meta?: Record<string, unknown>;
}

const ParentSchema = new Schema<IParentInfo>(
  {
    name: String,
    email: String,
    mobile: String,
    occupation: String,
    address: String,
  },
  { _id: false }
);

const StudentSchema = new Schema<IStudent>(
  {
    // Core
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    grade: { type: String, required: true },
    enrollmentDate: { type: Date, required: true },
    parentContact: { type: String, required: true },

    // Extended
    firstName: String,
    lastName: String,
    dob: Date,
    gender: String,
    nationality: String,
    contactNo: String,
    photoUrl: String,
    admissionNo: String,
    rollNo: String,
    bloodGroup: String,
    category: String,
    religion: String,
    studentAddress: String,
    addressSameAsStudent: { type: Boolean, default: false },

    parent: { type: ParentSchema },

    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Student = models.Student || model<IStudent>("Student", StudentSchema);

export default Student;
