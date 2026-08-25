import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { PaymentEscrowService } from '../service/payment-escrow.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('payment-escrow')
@ApiTags('payment-escrow')
export class PaymentEscrowController {
  constructor(private readonly paymentEscrowService: PaymentEscrowService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new escrow payment' })
  async createPayment(@Res() response: Response, @Body() data: any) {
    try {
      const { paymentId, beneficiary, sender } = data;
      const result = await this.paymentEscrowService.createPayment(
        paymentId,
        beneficiary,
        sender,
      );
      return response.status(200).json({ result });
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Something went wrong', error: error.message });
    }
  }

  @Post('fund')
  @ApiOperation({ summary: 'Fund a previously created payment' })
  async fundPayment(@Res() response: Response, @Body() data: any) {
    try {
      const { paymentId, sender, amount } = data;
      const result = await this.paymentEscrowService.fundPayment(
        paymentId,
        sender,
        amount,
      );
      return response.status(200).json({ result });
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Something went wrong', error: error.message });
    }
  }

  @Post('release')
  @ApiOperation({
    summary: 'Release a funded payment to its beneficiary (arbiter only)',
  })
  async releasePayment(@Res() response: Response, @Body() data: any) {
    try {
      const { paymentId } = data;
      const result = await this.paymentEscrowService.releasePayment(paymentId);
      return response.status(200).json({ result });
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Something went wrong', error: error.message });
    }
  }

  @Post('refund')
  @ApiOperation({
    summary: 'Refund a funded payment back to its sender (arbiter only)',
  })
  async refundPayment(@Res() response: Response, @Body() data: any) {
    try {
      const { paymentId } = data;
      const result = await this.paymentEscrowService.refundPayment(paymentId);
      return response.status(200).json({ result });
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Something went wrong', error: error.message });
    }
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Withdraw the caller pending balance' })
  async withdraw(@Res() response: Response, @Body() data: any) {
    try {
      const { account } = data;
      const result = await this.paymentEscrowService.withdraw(account);
      return response.status(200).json({ result });
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Something went wrong', error: error.message });
    }
  }

  @Get('payment/:paymentId')
  @ApiOperation({ summary: 'Retrieve a payment by id' })
  @ApiResponse({ status: 200, description: 'the payment' })
  async getPayment(
    @Res() response: Response,
    @Param('paymentId') paymentId: string,
  ) {
    try {
      const payment = await this.paymentEscrowService.getPayment(paymentId);
      return response.status(200).json({ payment });
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Something went wrong', error: error.message });
    }
  }

  @Get('contract-name')
  async getContractName(@Res() response: Response) {
    try {
      const contractName = await this.paymentEscrowService.getContractName();
      return response.status(200).json({ contractName });
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Something went wrong', error: error.message });
    }
  }
}
