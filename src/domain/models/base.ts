export type BaseModel = {
  id: string;
  createUserId: string;
  updateUserId?: string;
  deleteUserId?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};
