import crypto from 'crypto';

import { GenerateUniqueIDService } from '@/data/contracts/services';

export class UUIDService implements GenerateUniqueIDService {
  public generateUniqueID(): string {
    return crypto.randomUUID();
  }
}
