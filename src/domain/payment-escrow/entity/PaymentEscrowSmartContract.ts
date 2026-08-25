import { Payment } from './Payment';

export interface PaymentEscrowSmartContract {
  contractName(): Promise<string>;
  createPayment(
    paymentId: string,
    beneficiary: string,
    sender: string,
  ): Promise<any>;
  fundPayment(paymentId: string, sender: string, amount: string): Promise<any>;
  releasePayment(paymentId: string): Promise<any>;
  refundPayment(paymentId: string): Promise<any>;
  withdraw(account: string): Promise<any>;
  getPayment(paymentId: string): Promise<Payment>;
}
