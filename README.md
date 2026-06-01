# HD360 Moinhos — Site

Site institucional da **HD360 Moinhos**, clínica de autismo (TEA) infantil em Porto Alegre/RS.
*Especialista em autismo, atendimento humanizado.*

> 🚧 **Em construção.** No ar atualmente: uma página placeholder. A construção do site começa em breve.

## Sobre o projeto

- **Identidade visual:** clara, alegre e acolhedora — paleta multicolor (azul, amarelo, rosa, lilás, verde) sobre fundo branco/creme, tipografia *Barnacle Boy* (display) × *Montserrat* (corpo), personagens próprios e movimento calmo/acessível.
- O sistema de design completo vive na skill **`.claude/skills/hd360-design/`** (tokens, componentes, animações, layout).

## Estrutura

```
hd360-project/
├── index.html          # página placeholder (em construção)
├── fonts/              # Barnacle Boy (fonte display da marca)
├── images/             # personagens (Li, Lo, Turminha, Pets) e mundos temáticos
├── videos/             # vídeo institucional
└── .claude/skills/     # sistema de design hd360-design
```

## Desenvolvimento

Site estático (HTML/CSS/JS). Para visualizar localmente, basta abrir `index.html` ou servir a pasta:

```bash
python -m http.server 8000
# acesse http://localhost:8000
```

## Deploy

Publicado via **GitHub Pages** a partir da branch `main`.

---

Clínica: Rua Quintino Bocaiúva, 451 · Moinhos de Vento · Porto Alegre/RS
Casa ABA: Rua Dr. Freire Alemão, 366 · Mont'Serrat
Contato: (51) 2112-8884 · contato@hd360.com.br · [@hd360moinhos](https://instagram.com/hd360moinhos)
