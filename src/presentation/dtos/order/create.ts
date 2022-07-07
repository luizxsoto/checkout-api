export class CreateOrderDto {
  public customerId!: string;

  public paymentProfileId!: string;

  public orderItems!: { productId: string; quantity: number }[];
}
