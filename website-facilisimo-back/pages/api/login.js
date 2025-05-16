import jwt from 'jsonwebtoken';
import runMiddleware, { cors } from '../../utils/cors';
import { serialize } from 'cookie'; // 👈 Agregado

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;

  if (username === 'AdminFacilisimo' && password === 'Facilisimo123*') {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '200h' });

    const serialized = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60,
      path: '/',
    });

    res.setHeader('Set-Cookie', serialized);
    return res.status(200).json({ message: 'Autenticado' }); // 👈 Ya no mandas el token al frontend
  }

  return res.status(401).json({ message: 'Credenciales incorrectas' });
}
