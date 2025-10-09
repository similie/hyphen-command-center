import bcrypt from "bcryptjs";
import CryptoJS from "crypto-js";

const SALT_ROUNDS = 10;
export const OPT_EXPIRE_IN_MINUTES = process.env.OPT_EXPIRE_IN_MINUTES
  ? +process.env.OPT_EXPIRE_IN_MINUTES
  : 5;
export const toHash = (value: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(value, SALT_ROUNDS, (err, hash) => {
      if (err || !hash) {
        return reject(err || "Hash generation failed");
      }
      resolve(hash);
    });
  });
};

export const compareHash = (hash: string, value: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(value, hash, function (err, result) {
      if (err) {
        return reject(err);
      }
      resolve(result || false);
    });
  });
};

/**
 * Generates a cryptographically secure API key.
 * @returns A 64-character hexadecimal string (256 bits).
 */
export const generateUserApiKey = (): string => {
  // Generate 32 random bytes (256 bits) and convert to hex.
  const apiKey = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
  return apiKey;
};

export const sha256Hash = (value: string): string => {
  // Generate a SHA-256 hash of the value and convert to hex.
  const hash = CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex);
  return hash;
};
