// Utility methods for the application

/**
 * Generates a random integer between min (inclusive) and max (inclusive).
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @returns A random integer between min and max.
 */
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random integer between 0 and array length.
 * @param arrayLength - The size of the array.
 * @returns A random integer between 0 and array length.
 */
export function getRandomIndex(arrayLength: number) {
  return Math.floor(Math.random() * arrayLength);
}
/**
 * Formats a date object into a readable string.
 * @param date - The date to format.
 * @returns A formatted date string (e.g., 'YYYY-MM-DD').
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Capitalizes the first letter of a string.
 * @param str - The string to capitalize.
 * @returns The string with the first letter capitalized.
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
