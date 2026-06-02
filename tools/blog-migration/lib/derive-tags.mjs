// Dicionário: tag canônica -> regex de detecção (case-insensitive, sem acento sensível).
const KEYWORDS = [
  ['TEA', /\b(tea|autis\w*|espectro autista)\b/i],
  ['ABA', /\baba\b/i],
  ['Fonoaudiologia', /\bfonoaudiolog\w*|\bfono\b/i],
  ['Terapia Ocupacional', /terapia ocupacional|\bto\b/i],
  ['Diagnóstico', /diagn[oó]stic\w*/i],
  ['Família', /fam[ií]lia\w*/i],
  ['Escola', /escola\w*|inclus[aã]o escolar|alfabetiza\w*/i],
  ['Comunicação', /comunica\w*|\bcaa\b|alternativa e aumentativa/i],
  ['Desenvolvimento', /desenvolvimento\w*/i],
  ['Alimentação', /alimenta\w*|seletividade|desfralde/i],
  ['Neurologia', /neurolog\w*/i],
];

export function deriveTags(post) {
  const text = `${post.title || ''} ${String(post.content || '').replace(/<[^>]+>/g, ' ')}`;
  const tags = [];
  for (const [tag, re] of KEYWORDS) {
    if (re.test(text) && !tags.includes(tag)) tags.push(tag);
    if (tags.length >= 5) break;
  }
  return tags;
}
