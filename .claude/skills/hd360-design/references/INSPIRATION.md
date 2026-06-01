# INSPIRATION.md — Creative library

Read this when ideating a new feature or unsure how to approach something. It maps creative directions to sources and to the HD360 vocabulary, so you reach for the *right* kind of inspiration — joyful, warm, accessible, trustworthy — and avoid the generic clinic/kids traps.

## How to use this file
1. Name the job ("I need a way to show the therapy rooms", "the hero feels flat").
2. Find the closest direction below.
3. Translate it into HD360 tokens & components (light canvas, rounded, coded color, calm motion, a character).
4. If it would pull the brand dark, cold, or overstimulating — discard it. The brand's north star is *a trustworthy, joyful clinic for autistic children*.

---

## North-star references (the right vibe)

- **Modern pediatric / family healthcare brands** — clean white, big rounded cards, one friendly accent per block, generous whitespace, real warmth without cartoon overload. Study how the best ones stay *credible* while being soft.
- **Children's brands with a character cast** (Lovevery, Khan Academy Kids, Sesame-adjacent) — how a small set of recurring characters carries personality across a whole product without becoming noise. HD360 has Li, Lo, Turminha, Zig & Dom — use them like that.
- **Illustration-led, blobby, friendly product sites** (Duolingo's softer moments, Headspace's calm) — Headspace especially for the *calm* register: soft color, slow motion, breathing space. HD360 should feel closer to Headspace-calm than to a hyperactive kids' game.
- **Inclusive / accessibility-forward design** — sites that treat reduced motion, contrast, and plain language as features. For this audience that *is* the premium signal.

## Anti-references (the wrong vibe — avoid)

- Dark, "cinematic", glassmorphism-on-black SaaS sites (that's the NOX/Quarezemin world — opposite brand).
- Generic medical/corporate templates: stock doctor photos, thin grey dividers, cold blue gradients, "Schedule your appointment" hero with no soul.
- Over-animated, autoplay-everything, confetti-cannon kids' sites — overstimulating and erodes parent trust.
- The autism cliché stock photo (hands cupping a puzzle piece, a single child looking out a window). Use the bespoke character cast instead.

---

## Direction map

| The job | Direction | HD360 translation |
|---|---|---|
| Hero feels flat | Friendly split: warm headline + a character greeting, soft floating blobs, a small trust row | COMPONENTS § Hero; Barnacle Boy title with one coded word; Turminha/Li art; blob morph (ANIMATIONS § 5) |
| Show the specialties (11+) without a wall | Coded card grid + filter by area | COMPONENTS § Specialty card; INTERACTIONS § Filter; rotate the 5 colors so neighbors differ |
| Present the therapy rooms | Themed "worlds" as immersive cards | COMPONENTS § World card; Espaço/Floresta/Fundo do Mar art; **Unidades page only** |
| Build trust fast | A soft stat band + named responsible professional + real credentials | COMPONENTS § Stat band (count-up); cite Dr. Guilherme B. Sander, CRM/RQE; plain credible copy |
| Explain "how to start" | A 4-step warm timeline | COMPONENTS § Steps; coded numbered nodes + soft connecting line |
| Make it feel alive but calm | Ambient breathing: slow blob morph + gentle character float + sparse dots | ANIMATIONS § 4, 5, 8 — all reduced-motion aware |
| Give the brand personality | The character cast everywhere, with intent | COMPONENTS § Character block; map characters to coded colors; headphones = sensory care |
| Answer parent doubts | Warm FAQ accordion | COMPONENTS § FAQ; INTERACTIONS § Accordion; native `<details>` base |
| Social proof | Quiet testimonial cards (first name + relationship, no stock faces) | COMPONENTS § Testimonial; privacy-respecting |
| Section transitions feel hard | Soft wave dividers + whitespace, never a 1px line | ANIMATIONS § 9; LAYOUT § Section anatomy |
| The CTA | One full-color brand-gradient band with a peeking character | COMPONENTS § Appointment CTA; the only flooded-color moment per page |

---

## Motifs unique to HD360 (lean on these to avoid "generic clinic")

- **Puzzle-piece + 360° ring** — the logo's DNA. Use puzzle bits among the decorative dots, the ring as a section frame or photo mask, a single puzzle piece as a list bullet or an eyebrow icon. Subtle, never overused.
- **The five-color spectrum as a coded system** — colors aren't decoration, they're a wayfinding language (per specialty, per world, per character). This is the brand's smartest, most ownable device — protect the discipline.
- **The character cast** — Li (rosa), Lo (verde), the Turminha HD (amarelo/group), pets Zig & Dom. Recurring, warm, expressive, many in headphones. They turn a clinic site into *a place with a personality*.
- **Themed worlds** — Espaço 🪐, Floresta 🌳, Fundo do Mar 🐠. The real therapy rooms become immersive environments on the Unidades page — a memorable, true-to-life differentiator.
- **Calm as craft** — slow motion, reduced-motion respected, a "Reduzir animações" toggle, plain kind language. For this audience, restraint reads as expertise and care.

---

## Component libraries & tools (when you want a head start)

- **21st.dev / shadcn registry** — only if the build is React + Tailwind. For a vanilla HTML/CSS/JS build (the likely path here), port ideas by hand into the BEM + token system; don't drop React components in. (See the `21st-dev-components` skill.)
- **Lucide / Phosphor (rounded)** — outline icons at 2px round-cap stroke for specialty tiles and UI.
- **Google Fonts** — Montserrat (body). Display is the local Barnacle Boy face — see DESIGN § Typography.
- **SVG wave/blob generators** (getwaves.io, blobmaker.app style tools) — to author the divider paths and blob shapes; then commit them as inline SVG/CSS, tuned to brand colors.
- **Motion (motion.dev)** — only if CSS can't express a needed effect; the `motion-vanilla` skill documents the vanilla API. Default to CSS here — the brand's motion is simple by design, and simpler is calmer.

---

## A senior gut-check before shipping any section

1. Is the canvas light and the corners round? (If not, you've drifted to the wrong brand.)
2. Is there exactly **one** coded color leading this section?
3. Is there a moment of warmth — a character, a soft shape, kind copy?
4. Does every motion respect reduced-motion, and is nothing overstimulating?
5. Would a tired, hopeful parent feel *safe* and *welcomed* here — and could their autistic child use it comfortably?

If all five are yes, it's HD360. If any is no, fix that before adding anything new.
