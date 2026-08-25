
# Back End Payment Escrow

## Project Overview

This project serves educational purposes, offering a REST API that bridges a web front-end to an Ethereum conditional payment escrow smart contract. A `sender` opens and funds a payment for a `beneficiary`, and a trusted `arbiter` — confirming off-chain that the underlying transfer settled or failed — releases the funds to the beneficiary or refunds them to the sender.

The project is divided into 3 projects:

 - [Payment Escrow Smart Contract](https://github.com/JeanRiffel/lottery-smart-contract): This holds the funds and exposes `createPayment`/`fundPayment`/`releasePayment`/`refundPayment`/`withdraw`;
- Back-end Payment Escrow*: This handles the requests from the user and sends them to the smart contract.
- [Front-end Payment Escrow](https://github.com/JeanRiffel/front-end-lottery-smart-contract): This is the user interface that the user performs actions through.


## For this project I used

[Nest](https://github.com/nestjs/nest): A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.



## Execution Instructions

```bash
$ yarn install
```

Copy `.env.example`-style values into your own `.env` (see `CLAUDE.md` for what each variable means) — in particular `CONTRACT_ADDRESS`, `RPC_ADDRESS` and `ABI` need to point at a real deployed `PaymentEscrow` contract.

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Run Swagger

http://localhost:3001/api-docs#/
