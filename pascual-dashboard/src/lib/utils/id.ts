/**
 * Utilidades para generación de IDs únicos
 */

/**
 * Genera un ID único con prefijo opcional
 *
 * @param prefix - Prefijo para el ID (default: 'id')
 * @returns ID único en formato: prefix-timestamp-random
 *
 * @example
 * generateId() // "id-1699123456789-abc123def"
 * generateId("msg") // "msg-1699123456789-xyz789ghi"
 * generateId("user") // "user-1699123456789-jkl456mno"
 */
export function generateId(prefix = "id"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Genera un ID corto (solo parte aleatoria)
 *
 * @param length - Longitud del ID (default: 8)
 * @returns ID aleatorio
 *
 * @example
 * generateShortId() // "x7k9m2n4"
 * generateShortId(12) // "x7k9m2n4p6q8"
 */
export function generateShortId(length = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

/**
 * Genera un UUID v4 compatible
 *
 * @returns UUID en formato estándar
 *
 * @example
 * generateUUID() // "550e8400-e29b-41d4-a716-446655440000"
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
