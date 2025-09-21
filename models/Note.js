import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
