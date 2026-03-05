import app from '../server.js';

export default async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return app(req, res);
};