import { CreateCustomerDto } from './create';

export class UpdateCustomerDto extends CreateCustomerDto {
  public id!: string;
}
