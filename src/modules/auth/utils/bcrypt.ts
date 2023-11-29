import { randomBytes, pbkdf2, createHash } from "node:crypto";
async function hashPassword(
  password: string
): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    pbkdf2(password, salt, 1000, 64, "sha512", (error, derivedKey) => {
      if (error) {
        return reject(error);
      }
      return resolve({ hash: derivedKey.toString("hex"), salt });
    });
  });
}

async function comparePassword(
  password: string,
  salt: string,
  hash: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    pbkdf2(password, salt, 1000, 64, "sha512", (error, derivedKey) => {
      if (error) {
        return reject(error);
      }
      return resolve(hash === derivedKey.toString("hex"));
    });
  });
}

function md5hash(text: string) {
  return createHash("md5").update(text).digest("hex");
}

export { hashPassword, comparePassword, md5hash };