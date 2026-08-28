# Contributing to BorderPay API

Thanks for taking the time to contribute. This project is part of the 3-repo **BorderPay**
system — see [README.md](README.md) for how it relates to `borderpay-escrow` and `borderpay-app`,
and [CLAUDE.md](CLAUDE.md) for the internal architecture.

## Getting started

```bash
yarn install
```

Node version is pinned in [.nvmrc](.nvmrc) (`nvm use`).

Copy `.env.example` to `.env` and fill it in — see [CLAUDE.md](CLAUDE.md#configuration) for what
each variable means. You'll need a local Hardhat node and a deployed `PaymentEscrow` contract
(from the [borderpay-escrow](https://github.com/JeanRiffel/borderpay-escrow) repo) to exercise
the API end to end.

A [Bruno](https://www.usebruno.com/) collection with every endpoint pre-filled is available at
[bruno/borderpay-api/](bruno/borderpay-api/) — open it via **File → Open Collection** to try the
API manually.

## Development workflow

1. Branch off `main`, naming the branch `<type>/<short-description>` (e.g. `feat/add-refund-endpoint`,
   `fix/withdraw-validation`, `docs/update-readme`).
2. Make your changes, following the code style below.
3. Open a pull request into `main`. Squash/merge history should stay readable — keep commits
   focused and use the commit convention below.
4. At least one review is expected before merging.

## Commit messages

This repo follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short summary>
```

Common types used here: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`. Look at `git log` for
examples already in the history.

## Code style & pre-commit hooks

```bash
yarn lint     # eslint --fix on src/apps/libs/test
yarn format   # prettier --write on src/**/*.ts and test/**/*.ts
```

A Husky `pre-commit` hook runs `lint-staged` automatically, which applies ESLint and Prettier to
staged `.ts` files — most style issues are fixed for you on commit. If the hook fails, fix the
reported errors and re-commit.

## Tests

```bash
yarn test        # unit tests (jest, *.spec.ts under src/)
yarn test:watch  # watch mode
yarn test:cov    # coverage
yarn test:e2e    # e2e tests
```

`PaymentEscrowService` builds its dependencies manually (`new PaymentEscrowFactory()`), not
through Nest's DI container, so there's no provider to override in tests. Follow the existing
pattern in `src/domain/payment-escrow/service/test/payment-escrow.service.spec.ts`: mock the
factory module (`jest.mock('../../factory/PaymentEscrowFactory')`) and stub
`buildSmartContractPaymentEscrow()` to return a mocked `PaymentEscrowSmartContract`.

Add or update tests for any behavior change, and make sure `yarn test` and `yarn lint` pass
before opening a PR.

## Changing the contract interface

If a change in [borderpay-escrow](https://github.com/JeanRiffel/borderpay-escrow) alters the
`PaymentEscrow` contract's public interface, remember to:

1. Re-run `npx hardhat compile` in that repo and copy the new `.abi` into this repo's `ABI` env var.
2. Update `PaymentEscrowContract`, the `PaymentEscrowSmartContract` interface, and the Swagger
   docs/controller as needed.
3. Update the Bruno collection under `bruno/borderpay-api/` if request/response shapes changed.

## Questions

Open an issue or start a discussion on the repo if anything here is unclear.
