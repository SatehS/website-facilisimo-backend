// pages/api/verifyToken.js

import jwt from 'jsonwebtoken';
import runMiddleware, { cors } from '../../utils/cors';
import { parse } from 'cookie';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  try {
    // Ejecuta middleware CORS
    await runMiddleware(req, res, cors);

    // Maneja preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const cookies = parse(req.headers.cookie || '');
    const token = cookies.token;

    if (!token) {
      return res.status(401).json({ valid: false, message: 'No autorizado' });
    }

    if (!SECRET_KEY) {
      console.error("JWT_SECRET no está definido");
      return res.status(500).json({ message: 'Error del servidor' });
    }

    jwt.verify(token, SECRET_KEY);
    return res.status(200).json({ valid: true });

  } catch (err) {
    console.error("Error en verifyToken:", err);

    // Asegura que incluso los errores tengan los headers CORS
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    return res.status(500).json({ valid: false, message: 'Error interno del servidor' });
  }
}
