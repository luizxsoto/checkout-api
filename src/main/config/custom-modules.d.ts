declare namespace Express {
  export interface Request {
    session?: import('@/domain/models').SessionModel;
  }
}
