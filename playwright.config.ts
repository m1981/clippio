import { defineConfig, devices } from '@playwright/test';
import { testConfig } from './e2e/config/testConfig';

export default defineConfig({
	testDir: './e2e',
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	
	// Shortened timeouts
	timeout: 15000, // Test timeout: 15s (was 30s default)
	expect: {
		timeout: 3000, // Expect timeout: 3s (was 5s default)
	},
	
	reporter: [
		['html'],
		['list'],
		['junit', { outputFile: 'test-results/junit.xml' }]
	],
	
	use: {
		baseURL: testConfig.baseUrl,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		
		// Shortened action timeouts
		actionTimeout: 5000, // Action timeout: 5s (was no timeout)
		navigationTimeout: 10000, // Navigation timeout: 10s (was no timeout)
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] },
		},
		{
			name: 'mobile-chrome',
			use: { ...devices['Pixel 5'] },
		},
	],

	webServer: {
		command: 'vite dev',
		port: 4173,
		reuseExistingServer: !process.env.CI,
	},
});