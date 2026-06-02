import { STORAGE_BUCKET } from '../config.js';

// Sobe uma imagem pro bucket público e devolve a URL pública absoluta.
// Caminho com timestamp + nome higienizado evita colisão e mantém legível.
export async function uploadImage(supabase, file) {
  const safe = file.name.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9.]+/g, '-').toLowerCase();
  const path = `posts/${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
