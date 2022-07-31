export class CreateOrderDto {
  public orderItems!: { productId: string; quantity: number }[]
}
