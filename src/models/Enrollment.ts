import { Schema, model, models, Types } from 'mongoose'

export interface IEnrollment {
  _id?: Types.ObjectId
  student: Types.ObjectId
  course: Types.ObjectId
  active: boolean
  enrolledAt?: Date
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    active: { type: Boolean, default: true },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true })

export const Enrollment = models.Enrollment || model<IEnrollment>('Enrollment', EnrollmentSchema)
