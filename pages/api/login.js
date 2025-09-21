import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';
import Tenant from '../../models/Tenant';
import { signToken } from '../../utils/auth';
import bcrypt from 'bcryptjs';
import allowCors from '../../lib/cors';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  await dbConnect();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password } = req.body;
  console.log('[API] /api/login attempt for', email);
  const user = await User.findOne({ email });
  console.log('[API] user found:', !!user);
  if (!user) return res.status(401).json({ error: 'Invalid credentials (user not found)' });
  const valid = await bcrypt.compare(password, user.password);
  console.log('[API] password valid:', valid);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials (bad password)' });
  const tenant = await Tenant.findById(user.tenantId);
  const token = signToken({ userId: user._id, tenantId: user.tenantId, role: user.role });
  res.status(200).json({ token, tenant: tenant.slug, role: user.role });
}
