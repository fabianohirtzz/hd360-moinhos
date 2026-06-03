// Dado o conjunto de slugs gerados antes e agora, devolve os que devem ser
// removidos (estavam antes, sumiram agora). Puro, sem efeitos colaterais.
export function slugsToPrune(oldSlugs, newSlugs) {
  const keep = new Set(newSlugs || []);
  return [...new Set(oldSlugs || [])].filter(slug => !keep.has(slug));
}
