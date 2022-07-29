import jwt from 'jsonwebtoken'

import { Decrypter, Encrypter } from '@/data/contracts/cryptography'

export class JwtCryptography implements Encrypter, Decrypter {
  constructor(private readonly secret: string) {}

  public async encrypt(params: Record<string, unknown>): Promise<string> {
    return jwt.sign(params, this.secret)
  }

  public async decrypt<ResponseT>(ciphertext: string): Promise<ResponseT> {
    return jwt.verify(ciphertext, this.secret) as ResponseT
  }
}
