import { hashedPassword, comparePassword } from '../helper.mjs';

describe('hashedPassword', () => {
  test('should hash a password successfully', () => {
    const password = 'mySecretPassword123';
    const hash = hashedPassword(password);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(password);
  });

  test('should return different hashes for the same password (due to salting)', () => {
    const password = 'testPassword';
    const hash1 = hashedPassword(password);
    const hash2 = hashedPassword(password);

    expect(hash1).toBeDefined();
    expect(hash2).toBeDefined();
    expect(hash1).not.toBe(hash2);
  });

  test('should hash empty string password', () => {
    const password = '';
    const hash = hashedPassword(password);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
  });

  test('should hash passwords with special characters', () => {
    const password = 'p@$$w0rd!#%^&*()';
    const hash = hashedPassword(password);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(password);
  });

  test('should hash long passwords', () => {
    const password = 'a'.repeat(100);
    const hash = hashedPassword(password);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
  });

  test('hashed password should start with bcrypt identifier', () => {
    const password = 'testPassword123';
    const hash = hashedPassword(password);

    // bcrypt hashes start with $2a$, $2b$, or $2y$
    expect(hash).toMatch(/^\$2[aby]\$/);
  });
});

describe('comparePassword', () => {
  test('should return true when comparing correct password with its hash', () => {
    const plainPassword = 'myPassword123';
    const hash = hashedPassword(plainPassword);

    const result = comparePassword(plainPassword, hash);
    expect(result).toBe(true);
  });

  test('should return false when comparing incorrect password with hash', () => {
    const plainPassword = 'myPassword123';
    const wrongPassword = 'wrongPassword456';
    const hash = hashedPassword(plainPassword);

    const result = comparePassword(wrongPassword, hash);
    expect(result).toBe(false);
  });

  test('should return false for empty password against valid hash', () => {
    const plainPassword = 'myPassword123';
    const hash = hashedPassword(plainPassword);

    const result = comparePassword('', hash);
    expect(result).toBe(false);
  });

  test('should return true for empty password with its own hash', () => {
    const plainPassword = '';
    const hash = hashedPassword(plainPassword);

    const result = comparePassword(plainPassword, hash);
    expect(result).toBe(true);
  });

  test('should be case-sensitive', () => {
    const plainPassword = 'Password123';
    const hash = hashedPassword(plainPassword);

    const result = comparePassword('password123', hash);
    expect(result).toBe(false);
  });

  test('should handle special characters correctly', () => {
    const plainPassword = 'p@$$w0rd!#%^&*()';
    const hash = hashedPassword(plainPassword);

    const result = comparePassword(plainPassword, hash);
    expect(result).toBe(true);
  });

  test('should return false for slightly different passwords', () => {
    const plainPassword = 'myPassword123';
    const hash = hashedPassword(plainPassword);

    const result = comparePassword('myPassword124', hash);
    expect(result).toBe(false);
  });

  test('should handle long passwords correctly', () => {
    const plainPassword = 'a'.repeat(50) + 'b';
    const hash = hashedPassword(plainPassword);

    const resultCorrect = comparePassword(plainPassword, hash);
    const resultIncorrect = comparePassword('a'.repeat(50) + 'c', hash);

    expect(resultCorrect).toBe(true);
    expect(resultIncorrect).toBe(false);
  });
});


