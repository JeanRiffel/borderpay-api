# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS backend that bridges a web front-end to an Ethereum `PaymentEscrow` smart contract via web3.js. It is the middle piece of a 3-repo system:

- [Payment Escrow Smart Contract](https://github.com/JeanRiffel/lottery-smart-contract) — Solidity contract holding a `sender`'s funds for a `beneficiary`, released or refunded by a trusted `arbiter`.
- **This repo** — REST API that receives requests and forwards them to the smart contract via web3.
- [Front-end Payment Escrow](https://github.com/JeanRiffel/front-end-lottery-smart-contract) — user-facing UI, organized into Sender / Arbiter / "any account" action groups matching this API.

This repo (and its two siblings) previously targeted a different contract — a pseudo-random `Lottery` (bets, `pickWinner`, `manager`). That domain is gone; nothing here references it anymore.

## Commands

```bash
yarn install          # install deps (Node version pinned in .nvmrc)

yarn start             # run app
yarn start:dev         # run app in watch mode
yarn start:prod        # run compiled app (dist/main)
yarn build              # nest build

yarn lint               # eslint --fix on src/apps/libs/test
yarn format              # prettier --write on src/**/*.ts and test/**/*.ts

yarn test                # unit tests (jest, rootDir: src, pattern *.spec.ts)
yarn test:watch          # unit tests in watch mode
yarn test:cov            # unit tests with coverage
yarn test:e2e            # e2e tests (jest config in test/jest-e2e.json)
```

To run a single unit test file: `yarn test <path-or-pattern>` (e.g. `yarn test payment-escrow.service.spec.ts`).

Swagger docs are served at `http://localhost:3001/api-docs#/` once the app is running.

## Configuration

Environment variables are loaded via `dotenv` in `src/main.ts` from a `.env` file at the repo root:

- `LOCAL_PORT` — port the Nest app listens on.
- `CONTRACT_ADDRESS` — deployed `PaymentEscrow` contract address (from `hardhat ignition deploy` in the `lottery-smart-contract` repo).
- `RPC_ADDRESS` — HTTP RPC endpoint used to build the web3 connection (a local Hardhat node by default — this repo used to point at Ganache, which the contract repo has since dropped in favor of Hardhat).
- `ABI` — JSON-stringified `PaymentEscrow` ABI, parsed at runtime in `PaymentEscrowContract`. Copy it from `lottery-smart-contract/artifacts/contracts/PaymentEscrow.sol/PaymentEscrow.json`'s `.abi` field after `npx hardhat compile`; re-copy whenever the contract's public interface changes.
- `FRONT_END_ADDRESS` — allowed CORS origin, applied globally in `GeneralModule`.

## Architecture

The code under `src/domain/payment-escrow/` follows a layered/DDD-ish structure with an interface + factory pattern to decouple the NestJS service layer from the concrete web3 implementation:

- **`entity/PaymentEscrowSmartContract.ts`** — interface defining the contract-facing operations (`contractName`, `createPayment`, `fundPayment`, `releasePayment`, `refundPayment`, `withdraw`, `getPayment`). This is the abstraction the rest of the app depends on.
- **`entity/PaymentEscrowContract.ts`** — concrete implementation of `PaymentEscrowSmartContract`, wrapping a `web3.eth.Contract` instance built from `CONTRACT_ADDRESS` and `ABI` env vars. All actual contract calls (`.methods.xxx().call()/.send()`) live here. `releasePayment`/`refundPayment` first read the on-chain `arbiter()` address and send the transaction `from` it, mirroring the contract's `onlyArbiter` restriction — there is no notion of a separate signing key here, this assumes the configured node account matches the arbiter (fine for local/dev use with an unlocked account; a production setup would need a real signer).
- **`entity/Payment.ts`** — `Payment` interface (`sender`, `beneficiary`, `amount`, `status`) and `PaymentStatus` enum (`Pending`/`Funded`/`Released`/`Refunded`), mirroring the contract's `struct Payment`/`enum Status`.
- **`entity/Web3Connection.ts`** — thin interface abstracting the web3 provider connection (`getConnection()`), implemented in `src/infra/Web3ConnectionPaymentEscrow.ts` (wraps `Web3` + `HttpProvider`).
- **`factory/PaymentEscrowFactory.ts`** — builds a `PaymentEscrowContract` wired to a `Web3ConnectionPaymentEscrow` using `RPC_ADDRESS`. This is the only place that wires the infra implementation to the domain interface.
- **`service/payment-escrow.service.ts`** — NestJS `@Injectable` service. Constructs the factory directly (not via NestJS DI/providers) and delegates all business calls to the resulting `PaymentEscrowSmartContract` instance. Catches errors and re-throws them prefixed with `DefaultErrors` enum messages (`utils/enumHelper.ts`), except `getContractName()` which swallows the error and returns the message instead (kept from the original lottery service's pattern, used by the front-end's health-check hook).
- **`controller/payment-escrow.controller.ts`** — REST endpoints under `/payment-escrow`:
  | Method | Route | Body/Params |
  |---|---|---|
  | POST | `/payment-escrow/create` | `{ paymentId, beneficiary, sender }` |
  | POST | `/payment-escrow/fund` | `{ paymentId, sender, amount }` (amount in ETH) |
  | POST | `/payment-escrow/release` | `{ paymentId }` |
  | POST | `/payment-escrow/refund` | `{ paymentId }` |
  | POST | `/payment-escrow/withdraw` | `{ account }` |
  | GET | `/payment-escrow/payment/:paymentId` | — |
  | GET | `/payment-escrow/contract-name` | — |

  Each handler wraps the service call in try/catch and returns a raw `Response` via `@Res()`, responding with `500` and `{ message, error }` on failure.
- **`module/payment-escrow.module.ts`** — wires `PaymentEscrowController` + `PaymentEscrowService`.

`src/general.modules.ts` is the app's root module, importing `PaymentEscrowModule` and applying `cors()` middleware globally scoped to `FRONT_END_ADDRESS`.

Since `PaymentEscrowService` builds its dependencies manually via `new PaymentEscrowFactory()` rather than through Nest's DI container, there's no provider binding to override for tests — `service/test/payment-escrow.service.spec.ts` mocks `PaymentEscrowFactory` at the module level (`jest.mock('../../factory/PaymentEscrowFactory')`) and stubs `buildSmartContractPaymentEscrow()` to return a mocked `PaymentEscrowSmartContract`; follow this pattern for new service tests rather than trying to override providers.
