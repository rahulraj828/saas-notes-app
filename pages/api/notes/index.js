import dbConnect from '../../../lib/dbConnect';
import Note from '../../../models/Note';
import Tenant from '../../../models/Tenant';
import { getTokenFromHeader, verifyToken } from '../../../utils/auth';
import allowCors from '../../../lib/cors';

export default async function handler(req, res) {
  if (allowCors(req, res)) return;
  await dbConnect();
  const token = getTokenFromHeader(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  let payload;
  try { payload = verifyToken(token); } catch (e) { return res.status(401).json({ error: 'Invalid token' }); }
  const tenantId = payload.tenantId;
  try {
    if (req.method === 'GET') {
      const notes = await Note.find({ tenantId }).sort({ createdAt: -1 });
      return res.status(200).json(notes);
    }

    if (req.method === 'POST') {
      if (!tenantId) return res.status(401).json({ error: 'Tenant missing in token' });
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

      const noteCount = await Note.countDocuments({ tenantId });
      if ((tenant?.subscription || '') === 'free' && noteCount >= 3) {
        return res.status(403).json({ error: 'Free plan note limit reached' });
      }

      const { content } = req.body || {};
      if (!content || !content.trim()) return res.status(400).json({ error: 'Content is required' });

      const newNote = await Note.create({ content: content.trim(), tenantId, owner: payload.userId });
      return res.status(201).json(newNote);
    }
  } catch (err) {
    console.error('/api/notes error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
