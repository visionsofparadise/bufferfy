import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		root: './src',
		exclude: ['**/*.bench.ts', '**/node_modules/**'],
	},
});
