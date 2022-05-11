import { BaseModel } from '@/domain/models';

export function makeBaseModelMock(extraData?: Partial<BaseModel>) {
  return new (class extends BaseModel {
    constructor(partial: BaseModel) {
      super();
      Object.assign(this, partial);
    }
  })({ id: 'any_id', createdAt: new Date(), ...extraData });
}
