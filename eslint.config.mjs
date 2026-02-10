// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
    {ignores: ['dist', '.output', '.nuxt', '.idea']},

    eslint.configs.recommended,
    tseslint.configs.recommended,
);