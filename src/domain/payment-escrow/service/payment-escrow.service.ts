import { Injectable } from '@nestjs/common';
import { PaymentEscrowSmartContract } from '../entity/PaymentEscrowSmartContract';
import { Payment } from '../entity/Payment';
import { DefaultErrors } from '../utils/enumHelper';
import PaymentEscrowFactory from '../factory/PaymentEscrowFactory';

@Injectable()
export class PaymentEscrowService {
  private _paymentEscrowSmartContract: PaymentEscrowSmartContract;

  constructor() {
    const paymentEscrowFactory = new PaymentEscrowFactory();
    this._paymentEscrowSmartContract =
      paymentEscrowFactory.buildSmartContractPaymentEscrow();
  }

  async createPayment(
    paymentId: string,
    beneficiary: string,
    sender: string,
  ): Promise<any> {
    try {
      const result = await this._paymentEscrowSmartContract.createPayment(
        paymentId,
        beneficiary,
        sender,
      );
      return result;
    } catch (error) {
      throw new Error(
        DefaultErrors.CreatePaymentError.concat(' ', error.message),
      );
    }
  }

  async fundPayment(
    paymentId: string,
    sender: string,
    amount: string,
  ): Promise<any> {
    try {
      const result = await this._paymentEscrowSmartContract.fundPayment(
        paymentId,
        sender,
        amount,
      );
      return result;
    } catch (error) {
      throw new Error(
        DefaultErrors.FundPaymentError.concat(' ', error.message),
      );
    }
  }

  async releasePayment(paymentId: string): Promise<any> {
    try {
      const result =
        await this._paymentEscrowSmartContract.releasePayment(paymentId);
      return result;
    } catch (error) {
      throw new Error(
        DefaultErrors.ReleasePaymentError.concat(' ', error.message),
      );
    }
  }

  async refundPayment(paymentId: string): Promise<any> {
    try {
      const result =
        await this._paymentEscrowSmartContract.refundPayment(paymentId);
      return result;
    } catch (error) {
      throw new Error(
        DefaultErrors.RefundPaymentError.concat(' ', error.message),
      );
    }
  }

  async withdraw(account: string): Promise<any> {
    try {
      const result = await this._paymentEscrowSmartContract.withdraw(account);
      return result;
    } catch (error) {
      throw new Error(DefaultErrors.WithdrawError.concat(' ', error.message));
    }
  }

  async getPayment(paymentId: string): Promise<Payment> {
    try {
      const result =
        await this._paymentEscrowSmartContract.getPayment(paymentId);
      return result;
    } catch (error) {
      throw new Error(DefaultErrors.GetPaymentError.concat(' ', error.message));
    }
  }

  async getContractName(): Promise<string> {
    try {
      const result = await this._paymentEscrowSmartContract.contractName();
      return result;
    } catch (error) {
      return DefaultErrors.ContractNameError;
    }
  }
}
