import cloudinary from '../../../utils/cloudinary';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { file } = req.body;

  if (!file) {
    return res.status(400).json({ message: 'Archivo no proporcionado' });
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(file, {
      resource_type: 'raw',
      folder: 'pdfs',
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    });

    return res.status(200).json({ url: uploadResponse.secure_url, public_id: uploadResponse.public_id });
  } catch (error) {
    console.error('Error al subir el PDF:', error);
    return res.status(500).json({ message: 'Error al subir el PDF' });
  }
}
