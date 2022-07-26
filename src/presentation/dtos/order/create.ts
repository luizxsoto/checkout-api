export class CreateOrderDto {
  public userId!: string;

  public paymentProfileId!: string;

  public orderItems!: { productId: string; quantity: number }[];
}
