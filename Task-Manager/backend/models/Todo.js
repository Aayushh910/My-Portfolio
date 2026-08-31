import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Todo title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['incomplete', 'completed'],
      default: 'incomplete',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    createdBy: {
      type: String,
      default: 'admin',
      trim: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index for sorting & filtering
todoSchema.index({ status: 1, createdAt: -1 });
todoSchema.index({ title: 'text', description: 'text' });

export const Todo = mongoose.model('Todo', todoSchema);
