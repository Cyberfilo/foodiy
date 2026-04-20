import bcrypt from 'bcryptjs';

export async function hashPin(pin: string): Promise<string> {
  if (!/^\d{4,8}$/.test(pin)) {
    throw new Error('PIN must be 4–8 digits');
  }
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  if (!pin || !hash) return false;
  return bcrypt.compare(pin, hash);
}
