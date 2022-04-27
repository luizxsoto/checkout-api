export type Params<RequestModel, ValidatorData extends Record<string, any[]>> = {
  requestModel: RequestModel;
  validatorData: ValidatorData;
};

export type Result<RequestModel> = RequestModel;

export interface Validator<RequestModel, ValidatorData extends Record<string, any[]>> {
  validate: (payload: Params<RequestModel, ValidatorData>) => Result<RequestModel>;
}
