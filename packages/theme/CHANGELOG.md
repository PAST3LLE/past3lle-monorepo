# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.1.2](https://github.com/PAST3LLE/schematics-monorepo/compare/@past3lle/theme@2.1.2-alpha.0...@past3lle/theme@2.1.2) (2024-09-28)

**Note:** Version bump only for package @past3lle/theme





## [2.1.2-alpha.0](https://github.com/PAST3LLE/schematics-monorepo/compare/@past3lle/theme@2.1.1...@past3lle/theme@2.1.2-alpha.0) (2024-09-17)


### Bug Fixes

* **theme:** allow passing of wcag options in contrast fn ([#105](https://github.com/PAST3LLE/schematics-monorepo/issues/105)) ([939cb69](https://github.com/PAST3LLE/schematics-monorepo/commit/939cb696b3c359384b77331b34a510a658c67d37))





## [2.1.1](https://github.com/PAST3LLE/schematics-monorepo/compare/@past3lle/theme@2.1.1-alpha.0...@past3lle/theme@2.1.1) (2024-09-05)

**Note:** Version bump only for package @past3lle/theme





## [2.1.1-alpha.0](https://github.com/PAST3LLE/schematics-monorepo/compare/@past3lle/theme@2.1.0...@past3lle/theme@2.1.1-alpha.0) (2024-09-04)


### Bug Fixes

* **skillforge-ui:** update skillforge-ui imports and update root yarn lock ([#101](https://github.com/PAST3LLE/schematics-monorepo/issues/101)) ([d4d714a](https://github.com/PAST3LLE/schematics-monorepo/commit/d4d714a45c9b9a18b870e218f2b5b4d70c34b744))





# [2.1.0](https://github.com/PAST3LLE/schematics-monorepo/compare/@past3lle/theme@2.0.0-alpha.3...@past3lle/theme@2.1.0) (2024-01-26)


### Features

* **web3-modal:** Button UX + HID Options access added to Account Modal ([#64](https://github.com/PAST3LLE/schematics-monorepo/issues/64)) ([24f4256](https://github.com/PAST3LLE/schematics-monorepo/commit/24f42567db28f175cadcd6ec581a5cb8b7ea6c74)), closes [#52](https://github.com/PAST3LLE/schematics-monorepo/issues/52) [#54](https://github.com/PAST3LLE/schematics-monorepo/issues/54) [#55](https://github.com/PAST3LLE/schematics-monorepo/issues/55) [#56](https://github.com/PAST3LLE/schematics-monorepo/issues/56) [#57](https://github.com/PAST3LLE/schematics-monorepo/issues/57) [#58](https://github.com/PAST3LLE/schematics-monorepo/issues/58) [#59](https://github.com/PAST3LLE/schematics-monorepo/issues/59) [#60](https://github.com/PAST3LLE/schematics-monorepo/issues/60) [#61](https://github.com/PAST3LLE/schematics-monorepo/issues/61)





## [2.0.2-alpha.2](https://github.com/PAST3LLE/schematics-monorepo/compare/@past3lle/theme@2.0.2-alpha.1...@past3lle/theme@2.0.2-alpha.2) (2024-01-25)


### Bug Fixes

* **packages:** update registries to standard NPM uri ([78fa2c8](https://github.com/PAST3LLE/schematics-monorepo/commit/78fa2c870d2458a22fa0109a2aa29fde94b1cb64))





## [2.0.2-alpha.1](https://github.com/PAST3LLE/schematics-monorepo/compare/@past3lle/theme@2.0.2-alpha.0...@past3lle/theme@2.0.2-alpha.1) (2024-01-25)

**Note:** Version bump only for package @past3lle/theme





## [2.0.2-alpha.0](https://github.com/PAST3LLE/schematics-monorepo/compare/@past3lle/theme@2.0.0-alpha.3...@past3lle/theme@2.0.2-alpha.0) (2024-01-24)

**Note:** Version bump only for package @past3lle/theme





# @past3lle/theme

## 2.0.1

### Patch Changes

- [#51](https://github.com/PAST3LLE/monorepo/pull/51) [`c89e0d6`](https://github.com/PAST3LLE/monorepo/commit/c89e0d68f2bcadfd418e04737b5ba1416d714796) Thanks [@W3stside](https://github.com/W3stside)! - Added version file

- Updated dependencies [[`c89e0d6`](https://github.com/PAST3LLE/monorepo/commit/c89e0d68f2bcadfd418e04737b5ba1416d714796)]:
  - @past3lle/constants@2.0.0
  - @past3lle/assets@2.0.0
  - @past3lle/types@2.0.0

## 2.0.0

### Patch Changes

- [#46](https://github.com/PAST3LLE/monorepo/pull/46) [`2a889a5`](https://github.com/PAST3LLE/monorepo/commit/2a889a5432ed9ed656b09a5cfb8f87448c526080) Thanks [@W3stside](https://github.com/W3stside)! - Prepare packages for V2 update.

  - Add changesets + github workflows to monorepo
  - web3-modal: updates to modals, types, logic, API, configuration
  - wagmi-connectors: update ledger-hid, iframe-ethereum, web3auth connectors to V2 wagmi
  - forge-web3: update to web3-modal/wagmi/viem V2 and optimise logic + API
  - skillforge-web3: update to forge-web3/wagmi/viem V2 and optimise logic + API
  - theme: fix deep merge logic
  - skillforge-ui: update types for migration to V2
