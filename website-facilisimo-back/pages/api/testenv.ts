export default function handler(req, res) {
    res.status(200).json({
      uploadcareKey: process.env.UPLOADCARE_SECRET_KEY ?? 'NO_KEY_FOUND',
    });
  }
  