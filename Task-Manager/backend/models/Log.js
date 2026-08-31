import mongoose from 'mongoose';

const logSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN',
        'LOGOUT',
        'USER_REGISTERED',
        'PROFILE_UPDATED',
        'TODO_CREATED',
        'TODO_UPDATED',
        'TODO_COMPLETED',
        'TODO_MARKED_INCOMPLETE',
        'TODO_DELETED',
        'EXPORT_PDF',
        'EXPORT_CSV',
      ],
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    username: {
      type: String,
      default: 'admin',
      trim: true,
      index: true,
    },
    todoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Todo',
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    versionKey: false,
  }
);

logSchema.index({ timestamp: -1 });

export const Log = mongoose.model('Log', logSchema);
