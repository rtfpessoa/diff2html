const specials = [
  // Order matters for these
  '-',
  '[',
  ']',
  // Order doesn't matter for any of these
  '/',
  '{',
  '}',
  '(',
  ')',
  '*',
  '+',
  '?',
  '.',
  '\\',
  '^',
  '$',
  '|',
];

// All characters will be escaped with '\'
// even though only some strictly require it when inside of []
const regex = RegExp('[' + specials.join('\\') + ']', 'g');

/**
 * Escapes all required characters for safe usage inside a RegExp
 */
export function escapeForRegExp(str: string): string {
  return str.replace(regex, '\\$&');
}

/**
 * Converts all '\' in @path to unix style '/'
 */
export function unifyPath(path: string): string {
  return path ? path.replace(/\\/g, '/') : path;
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

/**
 * @description Finds the maximum value in an array of numbers safely
 *
 * This function iterates through the array manually instead of using Math.max(...arr)
 * to avoid "Maximum call stack size exceeded" errors that can occur when spreading
 * very large arrays as function arguments. This is especially important when dealing
 * with large diffs that may contain thousands of lines.
 *
 * @param arr - The array of numbers
 * @returns The maximum value in the array
 */
export function max(arr: number[]): number {
  const length = arr.length;
  let max = -Infinity;

  for (let i = 0; i < length; i++) {
    max = Math.max(max, arr[i]);
  }
  return max;
}
