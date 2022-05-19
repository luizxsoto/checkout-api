import bcrypt from 'bcrypt';

import { Hasher } from '@/data/contracts/cryptography';

export class BcryptCryptography implements Hasher {
  constructor(private readonly salt: number) {}

  public async hash(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, this.salt);
  }
}
