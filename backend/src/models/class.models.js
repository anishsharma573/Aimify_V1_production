// models/Class.js (Optional)
import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Add other fields as needed, e.g., section, academicYear, etc.
});

export default mongoose.model('Class', classSchema);
