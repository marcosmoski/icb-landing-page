// Funções de validação e sanitização para a API de cadastros

/**
 * Valida formato de email
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Valida formato de telefone português
 */
export function validatePhone(phone) {
  // Remove espaços, hífens e parênteses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Padrões aceitos:
  // +351 965 169 925
  // 00351 965 169 925
  // 965169925
  // 965 169 925

  const phoneRegex = /^(\+351|00351)?[9][1236]\d{7}$/;
  return phoneRegex.test(cleanPhone);
}

/**
 * Sanitiza entrada removendo caracteres perigosos
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove tags HTML básicas
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 1000); // Limita tamanho
}

/**
 * Valida data de nascimento (idade entre 13 e 120 anos)
 */
export function validateBirthDate(dateString) {
  try {
    const birthDate = new Date(dateString);
    const today = new Date();

    if (isNaN(birthDate.getTime())) return false;

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 13 && age <= 120;
  } catch {
    return false;
  }
}

/**
 * Valida comprimento de strings
 */
export function validateLength(text, min = 1, max = 1000) {
  if (typeof text !== 'string') return false;
  const length = text.trim().length;
  return length >= min && length <= max;
}

/**
 * Detecta tentativas de spam básicas
 */
export function detectSpam(text) {
  if (!text) return false;

  const spamPatterns = [
    /viagra|casino|lottery|winner/gi,
    /http[s]?:\/\//gi, // URLs
    /[а-яё]/gi, // Cirílico (comum em spam)
    /(.)\1{4,}/gi, // Caracteres repetidos
  ];

  return spamPatterns.some(pattern => pattern.test(text));
}
