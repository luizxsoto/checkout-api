export class CreateOrderDto {
  public userId!: string;

  public orderItems!: { productId: string; quantity: number }[];
}
