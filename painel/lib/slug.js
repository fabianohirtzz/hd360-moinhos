// Título -> slug de URL: minúsculo, sem acento, só [a-z0-9-], hífens colapsados.
export function slugify(title) {
  return String(title ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')                       // não-alfanumérico -> hífen
    .replace(/^-+|-+$/g, '');                          // tira hífens das pontas
}
