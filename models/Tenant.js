import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  subscription: { type: String, enum: ['free', 'pro'], default: 'free' },
});

export default mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);
