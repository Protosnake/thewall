import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
export const hashPassword = (password) => {
    const salt = randomBytes(16).toString("hex");
    // 64 is the length of the derived key
    const hashed = scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hashed}`;
};
export const verifyPassword = (password, storedValue) => {
    const [salt, hash] = storedValue.split(":");
    const hashedInput = scryptSync(password, salt, 64);
    const hashBuffer = Buffer.from(hash, "hex");
    // timingSafeEqual prevents "timing attacks" where hackers measure
    // how long it takes for a comparison to fail
    return timingSafeEqual(hashBuffer, hashedInput);
};
