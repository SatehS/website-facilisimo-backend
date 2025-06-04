// import supabase from '../../../utils/supabase';
// import { IncomingForm } from 'formidable';

// export const config = {
//   api: {
//     bodyParser: false, // Desactiva el body parser para manejar multipart/form-data
//   },
// };

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Método no permitido' });
//   }

//   const form = new IncomingForm({ keepExtensions: true });

//   form.parse(req, async (err, fields, files) => {
//     if (err) {
//       console.error('Error al procesar el formulario:', err);
//       return res.status(500).json({ message: 'Error al procesar el archivo' });
//     }

//     const pdfFile = files.file;
//     if (!pdfFile) {
//       return res.status(400).json({ message: 'Archivo no proporcionado' });
//     }

//     console.log('📄 Archivo recibido para Supabase:', pdfFile);
//   console.log('📄 originalFilename:', pdfFile.originalFilename);
//   console.log('📄 newFilename (temp):', pdfFile.newFilename);
//   console.log('📄 mimetype:', pdfFile.mimetype);

//     try {
//       const bucketName = 'pdfs'; // Nombre del bucket en Supabase
//       const path = `documentos/${pdfFile.originalFilename}`; // Ruta dentro del bucket

//       const { data, error } = await supabase.storage
//         .from(bucketName)
//         .upload(path, pdfFile.filepath, {
//           contentType: 'application/pdf',
//         });

//       if (error) {
//         console.error('Error al subir el archivo a Supabase:', error);
//         return res.status(500).json({ message: 'Error al subir el archivo', error: error.message });
//       }

//       const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL_STORAGE}/${bucketName}/${path}`;
//       return res.status(200).json({ url: publicUrl });
//     } catch (uploadErr) {
//       console.error('Error general al subir el archivo:', uploadErr);
//       return res.status(500).json({ message: 'Error inesperado al subir el archivo', error: uploadErr.message });
//     }
//   });
// }

// pages/api/supabase/upload-pdf.js
import { IncomingForm } from 'formidable';
import supabase from '../../../utils/supabase';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs'; // Asegúrate de importar fs

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log('--- API Route /api/supabase/upload-pdf alcanzada ---');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const form = new IncomingForm({
    keepExtensions: true,
    maxFileSize: 20 * 1024 * 1024, // 20 MB
  });

  const data = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  }).catch(err => {
    console.error('Error al parsear el formulario:', err);
    return res.status(500).json({ message: 'Error al procesar el formulario' });
  });

  if (!data) return;

  // ESTA LÍNEA ES CLAVE: ASEGÚRATE DE QUE pdfFile ES EL OBJETO PersistentFile
  const pdfFile = Array.isArray(data.files.file) ? data.files.file[0] : data.files.file;

  if (!pdfFile) {
    console.warn('⚠️ No se encontró el archivo');
    return res.status(400).json({ message: 'Archivo no proporcionado' });
  }

  console.log('📄 Archivo recibido para Supabase (objeto real):', pdfFile);
  console.log('📄 originalFilename (del objeto):', pdfFile.originalFilename); // <-- Correcto ahora
  console.log('📄 newFilename (temp del objeto):', pdfFile.newFilename);     // <-- Correcto ahora
  console.log('📄 mimetype (del objeto):', pdfFile.mimetype);               // <-- Correcto ahora

  try {
    const originalFileName = pdfFile.originalFilename || pdfFile.newFilename; // Usar newFilename como fallback
    let fileExtension = originalFileName.split('.').pop();

    // Lógica robusta para obtener la extensión
    if (fileExtension === originalFileName || !fileExtension) {
        if (pdfFile.mimetype === 'application/pdf') {
            fileExtension = 'pdf';
        } else {
            console.warn(`No se pudo determinar la extensión para ${originalFileName}. Usando 'bin'. Mimetype: ${pdfFile.mimetype}`);
            fileExtension = 'bin';
        }
    }

    // Asegúrate de que el nombre base no incluya la extensión para evitar duplicados
    const baseFileName = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName;

    // Genera un nombre de archivo único con la extensión correcta
    const uniqueFileName = `${baseFileName.replace(/[^a-zA-Z0-9-_.]/g, '_')}-${uuidv4()}.${fileExtension}`; // Sanitizar nombre y añadir UUID

    const bucketName = 'pdfs';
    const folderPath = 'documentos';
    const storagePath = folderPath ? `${folderPath}/${uniqueFileName}` : uniqueFileName;

    console.log('✨ Nombre de archivo generado:', storagePath);
    console.log('📂 Ruta de carpeta:', folderPath);
    console.log('📝 Nombre único de archivo:', uniqueFileName);
    console.log('📦 Ruta completa de almacenamiento:', storagePath);

    const fileContent = await fs.promises.readFile(pdfFile.filepath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, fileContent, {
        cacheControl: '3600',
        upsert: false,
        contentType: pdfFile.mimetype,
      });

    if (uploadError) {
      console.error('❌ Error subiendo a Supabase Storage:', uploadError);
      return res.status(500).json({ message: 'Error al subir el PDF a Supabase', error: uploadError.message });
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      console.error('❌ No se pudo obtener la URL pública de Supabase.');
      return res.status(500).json({ message: 'Error al obtener la URL pública del PDF.' });
    }

    console.log('✅ Subida completa a Supabase Storage:', publicUrlData.publicUrl);

    fs.promises.unlink(pdfFile.filepath)
      .catch(err => console.error("Error al eliminar archivo temporal:", err));

    return res.status(200).json({
      url: publicUrlData.publicUrl,
      public_id: storagePath,
    });

  } catch (uploadErr) {
    console.error('❌ Error general en la subida a Supabase:', uploadErr);
    return res.status(500).json({ message: 'Error inesperado al subir el PDF', error: uploadErr.message });
  }
}