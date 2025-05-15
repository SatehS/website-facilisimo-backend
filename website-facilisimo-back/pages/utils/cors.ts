import Cors from 'cors'
import type { NextApiRequest, NextApiResponse } from 'next'

// Inicializar middleware CORS
const cors = Cors({
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  origin: 'http://localhost:5173',
  allowedHeaders: ['Content-Type'],
})

// Helper para ejecutar middlewares en Next.js
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

export default runMiddleware
export { cors }
