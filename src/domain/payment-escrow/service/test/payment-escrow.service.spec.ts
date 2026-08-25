import { Test, TestingModule } from '@nestjs/testing';
import { PaymentEscrowService } from '../payment-escrow.service';
import { PaymentEscrowSmartContract } from '../../entity/PaymentEscrowSmartContract';
import { PaymentStatus } from '../../entity/Payment';
import { DefaultErrors } from '../../utils/enumHelper';
import PaymentEscrowFactory from '../../factory/PaymentEscrowFactory';

jest.mock('../../factory/PaymentEscrowFactory');

describe('PaymentEscrowService', () => {
  let paymentEscrowService: PaymentEscrowService;
  let mockPaymentEscrowSmartContract: jest.Mocked<PaymentEscrowSmartContract>;

  beforeEach(async () => {
    mockPaymentEscrowSmartContract = {
      contractName: jest.fn(),
      createPayment: jest.fn(),
      fundPayment: jest.fn(),
      releasePayment: jest.fn(),
      refundPayment: jest.fn(),
      withdraw: jest.fn(),
      getPayment: jest.fn(),
    };

    (PaymentEscrowFactory as jest.Mock).mockImplementation(() => ({
      buildSmartContractPaymentEscrow: jest
        .fn()
        .mockReturnValue(mockPaymentEscrowSmartContract),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentEscrowService],
    }).compile();

    paymentEscrowService =
      module.get<PaymentEscrowService>(PaymentEscrowService);
  });

  it('should create a payment', async () => {
    mockPaymentEscrowSmartContract.createPayment.mockResolvedValue({
      transactionHash: '0xabc',
    });

    const result = await paymentEscrowService.createPayment(
      '0x01',
      '0xBeneficiary',
      '0xSender',
    );
    expect(result).toEqual({ transactionHash: '0xabc' });
    expect(mockPaymentEscrowSmartContract.createPayment).toHaveBeenCalledWith(
      '0x01',
      '0xBeneficiary',
      '0xSender',
    );
  });

  it('should throw when creating a payment fails', async () => {
    mockPaymentEscrowSmartContract.createPayment.mockRejectedValue(
      new Error('reverted'),
    );

    await expect(
      paymentEscrowService.createPayment('0x01', '0xBeneficiary', '0xSender'),
    ).rejects.toThrow(DefaultErrors.CreatePaymentError);
  });

  it('should fund a payment', async () => {
    mockPaymentEscrowSmartContract.fundPayment.mockResolvedValue({
      transactionHash: '0xdef',
    });

    const result = await paymentEscrowService.fundPayment(
      '0x01',
      '0xSender',
      '1',
    );
    expect(result).toEqual({ transactionHash: '0xdef' });
    expect(mockPaymentEscrowSmartContract.fundPayment).toHaveBeenCalledWith(
      '0x01',
      '0xSender',
      '1',
    );
  });

  it('should throw when funding a payment fails', async () => {
    mockPaymentEscrowSmartContract.fundPayment.mockRejectedValue(
      new Error('reverted'),
    );

    await expect(
      paymentEscrowService.fundPayment('0x01', '0xSender', '1'),
    ).rejects.toThrow(DefaultErrors.FundPaymentError);
  });

  it('should release a payment', async () => {
    mockPaymentEscrowSmartContract.releasePayment.mockResolvedValue({
      transactionHash: '0x111',
    });

    const result = await paymentEscrowService.releasePayment('0x01');
    expect(result).toEqual({ transactionHash: '0x111' });
    expect(mockPaymentEscrowSmartContract.releasePayment).toHaveBeenCalledWith(
      '0x01',
    );
  });

  it('should throw when releasing a payment fails', async () => {
    mockPaymentEscrowSmartContract.releasePayment.mockRejectedValue(
      new Error('reverted'),
    );

    await expect(paymentEscrowService.releasePayment('0x01')).rejects.toThrow(
      DefaultErrors.ReleasePaymentError,
    );
  });

  it('should refund a payment', async () => {
    mockPaymentEscrowSmartContract.refundPayment.mockResolvedValue({
      transactionHash: '0x222',
    });

    const result = await paymentEscrowService.refundPayment('0x01');
    expect(result).toEqual({ transactionHash: '0x222' });
    expect(mockPaymentEscrowSmartContract.refundPayment).toHaveBeenCalledWith(
      '0x01',
    );
  });

  it('should throw when refunding a payment fails', async () => {
    mockPaymentEscrowSmartContract.refundPayment.mockRejectedValue(
      new Error('reverted'),
    );

    await expect(paymentEscrowService.refundPayment('0x01')).rejects.toThrow(
      DefaultErrors.RefundPaymentError,
    );
  });

  it('should withdraw the caller balance', async () => {
    mockPaymentEscrowSmartContract.withdraw.mockResolvedValue({
      transactionHash: '0x333',
    });

    const result = await paymentEscrowService.withdraw('0xAccount');
    expect(result).toEqual({ transactionHash: '0x333' });
    expect(mockPaymentEscrowSmartContract.withdraw).toHaveBeenCalledWith(
      '0xAccount',
    );
  });

  it('should throw when withdrawing fails', async () => {
    mockPaymentEscrowSmartContract.withdraw.mockRejectedValue(
      new Error('reverted'),
    );

    await expect(paymentEscrowService.withdraw('0xAccount')).rejects.toThrow(
      DefaultErrors.WithdrawError,
    );
  });

  it('should return a payment', async () => {
    const payment = {
      sender: '0xSender',
      beneficiary: '0xBeneficiary',
      amount: '1000000000000000000',
      status: PaymentStatus.Funded,
    };
    mockPaymentEscrowSmartContract.getPayment.mockResolvedValue(payment);

    const result = await paymentEscrowService.getPayment('0x01');
    expect(result).toEqual(payment);
  });

  it('should throw when retrieving a payment fails', async () => {
    mockPaymentEscrowSmartContract.getPayment.mockRejectedValue(
      new Error('reverted'),
    );

    await expect(paymentEscrowService.getPayment('0x01')).rejects.toThrow(
      DefaultErrors.GetPaymentError,
    );
  });

  it('should return the contract name', async () => {
    mockPaymentEscrowSmartContract.contractName.mockResolvedValue(
      'The PaymentEscrow Contract is OnLine',
    );

    const result = await paymentEscrowService.getContractName();
    expect(result).toBe('The PaymentEscrow Contract is OnLine');
  });

  it('should handle error when retrieving the contract name', async () => {
    mockPaymentEscrowSmartContract.contractName.mockRejectedValue(new Error());

    const result = await paymentEscrowService.getContractName();
    expect(result).toBe(DefaultErrors.ContractNameError);
  });
});
