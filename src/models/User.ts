import mongoose, { Schema, Document, Model } from 'mongoose';

export type Role = 'admin' | 'teacher' | 'student';

export interface IPermission {
  module: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
  permissions: IPermission[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema<IPermission>({
  module: { type: String, required: true },
  canView: { type: Boolean, default: true },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
    isActive: { type: Boolean, default: true },
    permissions: { type: [PermissionSchema], default: [] },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
