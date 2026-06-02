// Limpa a saída do editor (Quill) para o formato HTML dos posts:
// tira classes ql-* e parágrafos vazios. Sem DOM (regex puro), testável no Node.
export function normalizeEditorHtml(html) {
  return String(html ?? '')
    .replace(/\s*class="[^"]*\bql-[^"]*"/g, '') // remove atributos class que contêm ql-*
    .replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, '')   // <p><br></p> -> nada
    .replace(/<p>\s*<\/p>/g, '')                // <p></p> -> nada
    .trim();
}
