import { BaseModel } from '@/domain/models';

export function makeBaseModelMock(extraData?: Partial<BaseModel>) {
  return new (class extends BaseModel {
    constructor(partial: BaseModel) {
      super();
      Object.assign(this, partial);
    }
  })({
    id: 'any_id',
    createUserId: '00000000-0000-4000-8000-000000000001',
    createdAt: new Date(),
    ...extraData,
  });
}
