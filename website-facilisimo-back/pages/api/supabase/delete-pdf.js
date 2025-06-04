import supabase from '../../../utils/supabase';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
      return res.status(405).json({ success: false, message: 'Método no permitido' });
    }
  
    const { path } = req.body;
    console.log('Path recibido:', path); // Para depuración de bugs
  
    if (!path) {
      return res.status(400).json({ success: false, message: 'Ruta del archivo no proporcionada' });
    }
  
    const bucketName = 'pdfs';
  
    try {
      // No necesitamos verificar si el archivo existe, intentamos eliminarlo directamente
      const { data, error } = await supabase.storage
        .from(bucketName)
        .remove([path]);
  
      if (error) {
        console.error('Error al eliminar de Supabase Storage:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Error al eliminar el PDF de Supabase', 
          error: error.message 
        });
      }
  
      console.log('Respuesta de Supabase después de eliminar:', data);
      return res.status(200).json({ 
        success: true, 
        message: 'PDF eliminado correctamente de Supabase',
        data 
      });
  
    } catch (deleteErr) {
      console.error('Error general en la eliminación:', deleteErr);
      return res.status(500).json({ 
        success: false, 
        message: 'Error inesperado al eliminar el PDF', 
        error: deleteErr.message 
      });
    }
  }