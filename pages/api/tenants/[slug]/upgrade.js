import dbConnect from '../../../../lib/dbConnect';
import Tenant from '../../../../models/Tenant';
import { getTokenFromHeader, verifyToken } from '../../../../utils/auth';
import allowCors from '../../../../lib/cors';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  await dbConnect();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  let payload;
  try { payload = verifyToken(token); } catch (e) { return res.status(401).json({ error: 'Invalid token' }); }
  if (payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { slug } = req.query;
  const tenant = await Tenant.findOne({ slug });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  tenant.subscription = 'pro';
  await tenant.save();
  return res.status(200).json({ message: 'Tenant upgraded to Pro' });
}
