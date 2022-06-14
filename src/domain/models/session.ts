export type Roles = 'admin' | 'moderator';

export class SessionModel {
  public userId!: string;

  public roles!: Roles[];

  constructor(partial: SessionModel) {
    Object.assign(this, partial);
  }
}
