/**
 * tidy-text.mjs — text normalization for HD360 blog posts.
 * Brand rule: no em dashes (—) or en dashes (–) anywhere on the site.
 * Shouty (ALL-CAPS) titles are converted to Portuguese Title Case.
 */

// Portuguese minor words that stay lowercase when not the first word.
const MINOR_WORDS = new Set([
  'a', 'o', 'e', 'de', 'da', 'do', 'das', 'dos',
  'em', 'no', 'na', 'nos', 'nas',
  'um', 'uma', 'para', 'por', 'com', 'que',
  'ao', 'aos', 'à', 'às',
]);

// Acronyms / proper nouns to restore after title-casing.
// Keyed by lowercase form, value is the canonical uppercase form.
const ACRONYMS = {
  tea: 'TEA',
  aba: 'ABA',
  hd360: 'HD360',
  tdah: 'TDAH',
  tda: 'TDA',
  to: 'TO',
  poa: 'POA',
  rs: 'RS',
};

/**
 * Replace en/em dashes (with optional surrounding spaces) by ", ".
 */
function replaceDashes(str) {
  return str.replace(/\s*[–—]\s*/g, ', ');
}

/**
 * Capitalize the first letter of a word, unicode-aware for Portuguese.
 */
function capitalizeFirst(word) {
  if (!word) return word;
  return word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1);
}

/**
 * Detect whether a string is "shouty" (ALL-CAPS, at least one letter).
 * Returns true if string has letters and none of them are lowercase.
 */
function isShouty(str) {
  // Must have at least one uppercase letter
  if (!/[A-ZÀ-Ú]/.test(str)) return false;
  // Must have NO lowercase letters
  if (/[a-zà-ú]/.test(str)) return false;
  return true;
}

/**
 * Convert a lowercased string to Portuguese Title Case.
 * The first word is always capitalized. Minor words stay lowercase elsewhere.
 */
function toTitleCase(lower) {
  const words = lower.split(' ');
  return words.map((word, idx) => {
    if (!word) return word;
    // Force-capitalize the first word, and any word that follows
    // sentence-ending punctuation or a colon on the previous word.
    const prev = idx > 0 ? words[idx - 1] : '';
    const forceCap = idx === 0 || /[:.!?]$/.test(prev);
    if (forceCap) return capitalizeFirst(word);
    // Keep minor words lowercase (but only pure word matches — ignore punctuation attachment)
    // Strip trailing punctuation to test, then reattach
    const match = word.match(/^([\wÀ-ɏ]+)([\W]*)$/u);
    if (match) {
      const bare = match[1].toLowerCase();
      const punct = match[2];
      if (MINOR_WORDS.has(bare)) {
        return bare + punct;
      }
      return capitalizeFirst(bare) + punct;
    }
    return capitalizeFirst(word);
  }).join(' ');
}

/**
 * Restore acronyms in a title-cased string by whole-word case-insensitive replacement.
 */
function restoreAcronyms(str) {
  let result = str;
  for (const [lower, canonical] of Object.entries(ACRONYMS)) {
    // Match whole word (word boundary), case-insensitive
    const re = new RegExp(`\\b${lower}\\b`, 'gi');
    result = result.replace(re, canonical);
  }
  return result;
}

/**
 * Normalize a post title:
 * 1. Replace en/em dashes with ", ".
 * 2. If not shouty, return as-is (dash-cleaned only).
 * 3. If shouty, convert to Portuguese Title Case, then restore acronyms.
 * 4. Collapse double spaces and trim.
 */
export function tidyTitle(str) {
  // Step 1: Replace dashes
  let s = replaceDashes(str);

  // Step 2: If not shouty, return cleaned string (still strip a stray trailing period)
  if (!isShouty(s)) {
    return stripTrailingPeriod(s.replace(/  +/g, ' ').trim());
  }

  // Step 3: Convert to title case
  const lower = s.toLowerCase();
  let titled = toTitleCase(lower);

  // Step 4: Restore acronyms and proper nouns
  titled = restoreAcronyms(titled);

  // Step 5: Collapse double spaces, strip trailing period, trim
  return stripTrailingPeriod(titled.replace(/  +/g, ' ').trim());
}

/**
 * Remove a single trailing period from a title (keep ellipsis, ? and !).
 */
function stripTrailingPeriod(str) {
  if (str.endsWith('.') && !str.endsWith('..')) return str.slice(0, -1);
  return str;
}

/**
 * Normalize HTML content:
 * Only replace en/em dashes with ", ". Do NOT change casing.
 */
export function tidyContent(html) {
  return replaceDashes(String(html));
}
