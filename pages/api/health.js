import allowCors from '../../lib/cors';

export default function handler(req, res) {
  if (allowCors(req, res)) return;
  res.status(200).json({ status: 'ok' });
}
