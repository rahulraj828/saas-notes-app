import dbConnect from '../../../lib/dbConnect';
import Note from '../../../models/Note';
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
  const { id } = req.query;

  const note = await Note.findById(id);
  if (!note || note.tenantId.toString() !== tenantId.toString()) return res.status(404).json({ error: 'Not found' });

  if (req.method === 'GET') return res.status(200).json(note);
  if (req.method === 'PUT') {
    if (payload.role !== 'admin' && payload.userId !== note.owner.toString()) return res.status(403).json({ error: 'Forbidden' });
    note.content = req.body.content || note.content;
    await note.save();
    return res.status(200).json(note);
  }
  if (req.method === 'DELETE') {
    if (payload.role !== 'admin' && payload.userId !== note.owner.toString()) return res.status(403).json({ error: 'Forbidden' });
    await note.remove();
    return res.status(200).json({ message: 'Deleted' });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
