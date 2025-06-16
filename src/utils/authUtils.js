// MockaVerse Authentication Utilities
// SHA-256 hash ile güvenli şifre yönetimi

/**
 * SHA-256 hash fonksiyonu
 * @param {string} message - Hash edilecek metin
 * @returns {Promise<string>} - Hex formatında hash
 */
async function sha256(message) {
  // Tarayıcı ortamında Web Crypto API kullan
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Node.js ortamında crypto modülü kullan
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(message).digest('hex');
}

/**
 * Güvenli salt oluşturma
 * @param {string} username - Kullanıcı adı
 * @returns {string} - Benzersiz salt
 */
function generateSalt(username) {
  const secretKey = "1907"; // Özel anahtar
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2, 15);
  
  // username + secret + timestamp + random kombinasyonu
  return `${secretKey}_${username}_${timestamp}_${randomString}`;
}

/**
 * Şifre hash'leme
 * @param {string} password - Ham şifre
 * @param {string} username - Kullanıcı adı
 * @returns {Promise<{hash: string, salt: string}>} - Hash ve salt
 */
async function hashPassword(password, username) {
  const salt = generateSalt(username);
  const saltedPassword = password + salt;
  const hash = await sha256(saltedPassword);
  
  return { hash, salt };
}

/**
 * Şifre doğrulama
 * @param {string} password - Girilen şifre
 * @param {string} storedHash - Veritabanındaki hash
 * @param {string} storedSalt - Veritabanındaki salt
 * @returns {Promise<boolean>} - Şifre doğru mu?
 */
async function verifyPassword(password, storedHash, storedSalt) {
  const saltedPassword = password + storedSalt;
  const computedHash = await sha256(saltedPassword);
  return computedHash === storedHash;
}

/**
 * Kullanıcı adı validasyonu
 * @param {string} username - Kontrol edilecek kullanıcı adı
 * @returns {boolean} - Geçerli mi?
 */
function validateUsername(username) {
  // Alfanumerik, 3-50 karakter arası
  const regex = /^[a-zA-Z0-9]{3,50}$/;
  return regex.test(username);
}

/**
 * Şifre gücü kontrolü
 * @param {string} password - Kontrol edilecek şifre
 * @returns {{isValid: boolean, message: string}} - Validasyon sonucu
 */
function validatePassword(password) {
  if (password.length < 6) {
    return { isValid: false, message: "Şifre en az 6 karakter olmalıdır" };
  }
  
  if (password.length > 128) {
    return { isValid: false, message: "Şifre en fazla 128 karakter olmalıdır" };
  }
  
  // En az bir harf ve bir rakam içermeli
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { isValid: false, message: "Şifre en az bir harf ve bir rakam içermelidir" };
  }
  
  return { isValid: true, message: "Şifre geçerli" };
}

/**
 * Session token oluşturma (basit JWT benzeri)
 * @param {Object} userData - Kullanıcı bilgileri
 * @returns {string} - Session token
 */
async function generateSessionToken(userData) {
  const payload = {
    userId: userData.id,
    username: userData.username,
    role: userData.role,
    timestamp: Date.now(),
    expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 saat
  };
  
  const tokenString = JSON.stringify(payload);
  const signature = await sha256(tokenString + "1907_session_secret");
  
  // Base64 encode
  if (typeof window !== 'undefined') {
    return btoa(tokenString + '.' + signature);
  } else {
    return Buffer.from(tokenString + '.' + signature).toString('base64');
  }
}

/**
 * Session token doğrulama
 * @param {string} token - Doğrulanacak token
 * @returns {Promise<{isValid: boolean, userData?: Object}>} - Doğrulama sonucu
 */
async function verifySessionToken(token) {
  try {
    // Base64 decode
    let decoded;
    if (typeof window !== 'undefined') {
      decoded = atob(token);
    } else {
      decoded = Buffer.from(token, 'base64').toString();
    }
    
    const [payloadStr, signature] = decoded.split('.');
    const payload = JSON.parse(payloadStr);
    
    // Signature doğrulama
    const expectedSignature = await sha256(payloadStr + "1907_session_secret");
    if (signature !== expectedSignature) {
      return { isValid: false };
    }
    
    // Expiry kontrolü
    if (payload.expiry < Date.now()) {
      return { isValid: false };
    }
    
    return { isValid: true, userData: payload };
  } catch (error) {
    return { isValid: false };
  }
}

// Export fonksiyonları
export {
  hashPassword,
  verifyPassword,
  validateUsername,
  validatePassword,
  generateSessionToken,
  verifySessionToken,
  sha256
};

// Default export
export default {
  hashPassword,
  verifyPassword,
  validateUsername,
  validatePassword,
  generateSessionToken,
  verifySessionToken,
  sha256
}; 