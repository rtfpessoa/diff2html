const specials = [
  // Order matters for these
  "-",
  "[",
  "]",
  // Order doesn't matter for any of these
  "/",
  "{",
  "}",
  "(",
  ")",
  "*",
  "+",
  "?",
  ".",
  "\\",
  "^",
  "$",
  "|"
];

// All characters will be escaped with '\'
// even though only some strictly require it when inside of []
const regex = RegExp("[" + specials.join("\\") + "]", "g");

/**
 * Escapes all required characters for safe usage inside a RegExp
 */
export function escapeForRegExp(str: string): string {
  return str.replace(regex, "\\$&");
}

/**
 * Escapes all required characters for safe HTML rendering
 */
export function escapeForHtml(str: string): string {
  return str
    .slice(0)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Converts all '\' in @path to unix style '/'
 */
export function unifyPath(path: string): string {
  return path ? path.replace("\\", "/") : path;
}

/**
 * Create unique number identifier for @text
 */
export function hashCode(text: string): number {
  let i, chr, len;
  let hash = 0;

  for (i = 0, len = text.length; i < len; i++) {
    chr = text.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }

  return hash;
}
