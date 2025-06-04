import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    uploadcareKey: process.env.UPLOADCARE_SECRET_KEY ?? 'NO_KEY_FOUND',
  });
};
