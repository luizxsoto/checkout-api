import bcrypt from 'bcrypt';

import { HashComparer, Hasher } from '@/data/contracts/cryptography';

export class BcryptCryptography implements Hasher, HashComparer {
  constructor(private readonly salt: number) {}

  public async hash(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, this.salt);
  }

  public async compare(plaintext: string, digest: string): Promise<boolean> {
    return bcrypt.compare(plaintext, digest);
  }
}
