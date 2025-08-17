import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { anthropic } from '$lib/server/anthropic';
import type { TaskCategorizationRequest } from '$lib/types/api';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { taskTitle, existingProjects, context }: TaskCategorizationRequest = await request.json();
    
    // Validate input
    if (!taskTitle?.trim()) {
      return json({ error: 'Task title is required' }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1000,
      temperature: 0.3,
      system: `You are a task categorization assistant. Analyze task titles and suggest the most appropriate project category.

Available projects: ${existingProjects?.map(p => p.name).join(', ') || 'Work, Personal, Other'}

Rules:
- Return JSON only
- Be concise but confident
- Consider context if provided
- Suggest creating new project if none fit well`,
      
      messages: [{
        role: "user",
        content: `Categorize this task: "${taskTitle}"
        
        ${context ? `Additional context: ${context}` : ''}
        
        Respond with JSON in this format:
        {
          "suggestedProject": "project_name",
          "confidence": 0.85,
          "reasoning": "brief explanation",
          "alternativeProjects": ["alt1", "alt2"],
          "shouldCreateNew": false,
          "newProjectSuggestion": null
        }`
      }]
    });

    const aiResponse = response.content[0];
    if (aiResponse.type !== 'text') {
      throw new Error('Unexpected response type from AI');
    }

    // Parse AI response
    const result = JSON.parse(aiResponse.text);
    
    return json({
      success: true,
      categorization: result,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      }
    });

  } catch (error) {
    console.error('Task categorization error:', error);
    return json({ 
      error: 'Failed to categorize task',
      fallback: 'Other' 
    }, { status: 500 });
  }
};