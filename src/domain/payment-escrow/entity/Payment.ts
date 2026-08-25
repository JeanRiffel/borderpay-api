export enum PaymentStatus {
  Pending = 0,
  Funded = 1,
  Released = 2,
  Refunded = 3,
}

export interface Payment {
  sender: string;
  beneficiary: string;
  amount: string;
  status: PaymentStatus;
}
