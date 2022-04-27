import { BaseValidator } from '@/data/contracts/validators';
import { CustomerModel } from '@/domain/models';
import { CreateCustomerUseCase } from '@/domain/use-cases';

export type Params = BaseValidator.Params<
  CreateCustomerUseCase.RequestModel,
  { findedCustomers: CustomerModel[] }
>;

export type Result = BaseValidator.Result<CreateCustomerUseCase.RequestModel>;

export type Validator = BaseValidator.Validator<
  CreateCustomerUseCase.RequestModel,
  { findedCustomers: CustomerModel[] }
>;
