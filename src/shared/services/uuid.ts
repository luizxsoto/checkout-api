import crypto from 'crypto';

import { GenerateUniqueIDService } from '@/shared/contracts/services';

export class UUIDService implements GenerateUniqueIDService {
  public generateUniqueID(): string {
    return crypto.randomUUID();
  }
}
