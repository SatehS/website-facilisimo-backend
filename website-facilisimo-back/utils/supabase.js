// utils/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // ¡Usa la clave de rol de servicio para el backend!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase URL or Service Role Key in environment variables.");
  // Puedes lanzar un error o manejarlo de otra manera si estas variables son críticas
}

// Crea un cliente Supabase con la clave de rol de servicio (solo para uso en el servidor)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);


export default supabase;