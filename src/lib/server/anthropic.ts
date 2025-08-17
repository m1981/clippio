import Anthropic from '@anthropic-ai/sdk';
import { env } from '$env/dynamic/private';

if (!env.ANTHROPIC_API_KEY) {
	throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

export const anthropic = new Anthropic({
	apiKey: env.ANTHROPIC_API_KEY
});
