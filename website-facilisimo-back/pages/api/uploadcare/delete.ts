import type { NextApiRequest, NextApiResponse } from 'next';
import runMiddleware, { cors } from '../../../utils/cors';
import { deleteFile, UploadcareSimpleAuthSchema } from '@uploadcare/rest-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await runMiddleware(req, res, cors);
  } catch (error) {
    console.error('Error al aplicar CORS:', error);
    return res.status(500).json({ error: 'Error al aplicar CORS' });
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { uuid } = req.body;

  if (!uuid) {
    return res.status(400).json({ error: 'Falta UUID del archivo' });
  }

  try {
    const uploadcarePublicKey = process.env.UPLOADCARE_PUBLIC_KEY;
    const uploadcareSecretKey = process.env.UPLOADCARE_SECRET_KEY;

    if (!uploadcarePublicKey || !uploadcareSecretKey) {
      console.error('Claves de Uploadcare no configuradas en las variables de entorno del servidor.');
      return res.status(500).json({ error: 'Error de configuración del servidor: Faltan claves de Uploadcare' });
    }

    const authSchema = new UploadcareSimpleAuthSchema({
      publicKey: uploadcarePublicKey,
      secretKey: uploadcareSecretKey,
    });

    try {
      await deleteFile(
        { uuid: uuid },
        { authSchema: authSchema }
      );

      return res.status(200).json({ success: true, message: 'Archivo eliminado de Uploadcare correctamente.' });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (uploadcareError: any) {
      console.error('Error al eliminar archivo en Uploadcare:', uploadcareError);
      return res.status(uploadcareError.statusCode || 500).json({
        error: 'Error al eliminar en Uploadcare',
        details: uploadcareError.message || 'Error desconocido al eliminar el archivo.',
      });
    }
    
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error interno del servidor al procesar la eliminación:', error);
    return res.status(500).json({ error: 'Error interno al intentar eliminar el archivo', details: error.message });
  }
}