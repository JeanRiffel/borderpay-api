import Web3Connection from './Web3Connection';
import { PaymentEscrowSmartContract } from './PaymentEscrowSmartContract';
import { Payment } from './Payment';

class PaymentEscrowContract implements PaymentEscrowSmartContract {
  private _contract: any;
  private _web3: any;
  private _contractAddress: any;

  public constructor(web3Conn: Web3Connection) {
    const abi = JSON.parse(process.env.ABI) || [];
    this._contractAddress = process.env.CONTRACT_ADDRESS;
    this._web3 = web3Conn.getConnection();
    this._contract = new this._web3.eth.Contract(abi, this._contractAddress);
  }

  public async contractName(): Promise<string> {
    const result = await this._contract.methods.contractName().call();
    return result;
  }

  public async createPayment(
    paymentId: string,
    beneficiary: string,
    sender: string,
  ): Promise<any> {
    const payload = { from: sender };
    const result = await this._contract.methods
      .createPayment(paymentId, beneficiary)
      .send(payload);
    return result;
  }

  public async fundPayment(
    paymentId: string,
    sender: string,
    amount: string,
  ): Promise<any> {
    const valueWei = this._web3.utils.toWei(amount, 'ether');
    const payload = { from: sender, value: valueWei };
    const result = await this._contract.methods
      .fundPayment(paymentId)
      .send(payload);
    return result;
  }

  public async releasePayment(paymentId: string): Promise<any> {
    const arbiter = await this._contract.methods.arbiter().call();
    const payload = { from: arbiter };
    const result = await this._contract.methods
      .releasePayment(paymentId)
      .send(payload);
    return result;
  }

  public async refundPayment(paymentId: string): Promise<any> {
    const arbiter = await this._contract.methods.arbiter().call();
    const payload = { from: arbiter };
    const result = await this._contract.methods
      .refundPayment(paymentId)
      .send(payload);
    return result;
  }

  public async withdraw(account: string): Promise<any> {
    const payload = { from: account };
    const result = await this._contract.methods.withdraw().send(payload);
    return result;
  }

  public async getPayment(paymentId: string): Promise<Payment> {
    const result = await this._contract.methods.getPayment(paymentId).call();
    return {
      sender: result.sender,
      beneficiary: result.beneficiary,
      amount: result.amount,
      status: Number(result.status),
    };
  }
}

export default PaymentEscrowContract;
