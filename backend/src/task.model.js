import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  status: { type: String, enum: ['todo','in_progress','done'], default: 'todo' },
  dueDate: { type: Date, required: true }
}, { timestamps: true });

export const Task = mongoose.model('Task', TaskSchema);
