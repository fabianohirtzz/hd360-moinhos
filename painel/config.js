// Configuração pública do painel HD360. A anon key é segura por design (RLS no banco).
export const SUPABASE_URL = 'https://euzmbswywwhmicjlszqw.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1em1ic3d5d3dobWljamxzenF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDEyODYsImV4cCI6MjA5NjAxNzI4Nn0.oSIv6fSKVxO9Umuii6xt98cT0yoSqepTIzVCdcocfuU';

export const STORAGE_BUCKET = 'blog-images';

// As 5 categorias do blog, cada uma na sua cor de marca (ver hd360-design).
export const CATEGORIES = [
  { name: 'Terapias e Abordagens', color: 'azul' },
  { name: 'Entendendo o Autismo', color: 'verde' },
  { name: 'Dia a Dia da Família', color: 'rosa' },
  { name: 'Histórias HD360', color: 'amarelo' },
  { name: 'Dicas dos Especialistas', color: 'lilas' },
];

// Mapa cor de marca -> hex (para a bolinha de categoria na tabela/select).
export const COLOR_HEX = {
  azul: '#00A5EA', amarelo: '#FFC700', rosa: '#FB3C63', lilas: '#8F64C8', verde: '#A8C420',
};
