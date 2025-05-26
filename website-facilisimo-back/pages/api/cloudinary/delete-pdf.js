import cloudinary from '../../../utils/cloudinary';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { public_id } = req.body;

  if (!public_id) {
    return res.status(400).json({ message: 'public_id no proporcionado' });
  }

  try {
    await cloudinary.uploader.destroy(public_id, {
      resource_type: 'raw',
    });

    return res.status(200).json({ message: 'PDF eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el PDF:', error);
    return res.status(500).json({ message: 'Error al eliminar el PDF' });
  }
}
