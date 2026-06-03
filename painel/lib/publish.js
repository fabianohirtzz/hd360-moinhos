// Estado puro do controle "Atualizar site" a partir do site_meta.
export function publishUiState({ dirty, publishing } = {}) {
  if (publishing) return { flagVisible: false, btnLabel: 'Publicando…', btnDisabled: true };
  return { flagVisible: !!dirty, btnLabel: 'Atualizar site', btnDisabled: false };
}

// Lê o estado de publicação (linha única id=1).
export async function fetchSiteMeta(supabase) {
  const { data, error } = await supabase
    .from('site_meta').select('dirty,publishing,last_published_at').eq('id', 1).single();
  if (error) return { dirty: false, publishing: false };
  return data;
}

// Invoca a Edge Function que dispara o rebuild.
export async function requestPublish(supabase) {
  const { data, error } = await supabase.functions.invoke('publish', { body: {} });
  if (error) throw error;
  return data;
}
