# Vitest Testing Setup

**Implemented:** February 15, 2026

## Overview
Vitest is integrated as the primary unit testing framework for StashSnap Vault. It provides a fast, modern testing experience with native Vite support and JSDOM for component testing.

## Files Created
- **[vite.config.ts](file:///c:/aom_NewXPS/ClaudeProjects/stashsnap/vite.config.ts)**: Updated with `test` configuration.
- **[tsconfig.json](file:///c:/aom_NewXPS/ClaudeProjects/stashsnap/tsconfig.json)**: Updated with `vitest/globals` types.
- **[src/test/setup.ts](file:///c:/aom_NewXPS/ClaudeProjects/stashsnap/src/test/setup.ts)**: Global setup for `@testing-library/jest-dom`.
- **[src/test/basic.test.ts](file:///c:/aom_NewXPS/ClaudeProjects/stashsnap/src/test/basic.test.ts)**: Basic math sanity test.

## How to Run Tests
- **Standard Run**: `npm test`
- **UI Mode**: `npm run test:ui` (Launches a visual test runner in the browser)

## Test Standards
- **Pattern**: AAA (Arrange, Act, Assert)
- **Environment**: JSDOM (React Component testing)
- **Globals**: `describe`, `it`, `expect` are available globally without imports.
