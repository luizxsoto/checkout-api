import jwt from 'jsonwebtoken';

import { Encrypter } from '@/data/contracts/cryptography';

export class JwtCryptography implements Encrypter {
  constructor(private readonly secret: string) {}

  public async encrypt(plaintext: string): Promise<string> {
    return jwt.sign({ id: plaintext }, this.secret);
  }
}
