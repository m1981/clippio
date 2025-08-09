<script lang="ts">
  import type { Project, Task, TaskSuggestion } from '$lib/types';
  import TaskSuggestionComponent from './TaskSuggestion.svelte';
  
  interface Props {
    projects: Project[];
    onTaskAdded: (task: Task, projectId: string) => void;
  }
  
  let { projects, onTaskAdded }: Props = $props();
  
  let newTaskTitle = $state('');
  let suggestion = $state<TaskSuggestion | null>(null);
  
  // Mock AI response for testing
  function mockAIResponse(title: string): TaskSuggestion {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('work') || lowerTitle.includes('bug') || lowerTitle.includes('meeting')) {
      return {
        suggestedProject: 'Work Projects',
        confidence: 0.85,
        reasoning: 'Contains work-related keywords',
        alternatives: ['Personal'],
        taskTitle: title
      };
    } else if (lowerTitle.includes('kids') || lowerTitle.includes('family') || lowerTitle.includes('grocery')) {
      return {
        suggestedProject: 'Personal',
        confidence: 0.90,
        reasoning: 'Contains personal/family keywords',
        alternatives: ['Work Projects'],
        taskTitle: title
      };
    } else {
      return {
        suggestedProject: 'Other',
        confidence: 0.60,
        reasoning: 'No specific keywords found, defaulting to Other',
        alternatives: ['Work Projects', 'Personal'],
        taskTitle: title
      };
    }
  }
  
  function handleInput() {
    if (newTaskTitle.trim().length > 3) {
      suggestion = mockAIResponse(newTaskTitle);
    } else {
      suggestion = null;
    }
  }
  
  function handleTaskAdded(task: Task, projectId: string) {
    console.log('🟢 TaskInput: handleTaskAdded called');
    console.log('🟢 Task:', task);
    console.log('🟢 ProjectId:', projectId);
    console.log('🟢 Available projects:', projects.map(p => p.name));
    
    onTaskAdded(task, projectId);
    console.log('🟢 Bubbled up to TodoApp');
    
    newTaskTitle = '';
    suggestion = null;
  }
</script>

<div class="bg-white border border-gray-200 rounded-lg p-4">
  <input
    bind:value={newTaskTitle}
    oninput={handleInput}
    placeholder="Add a new task... (try 'fix work bug' or 'pick up kids')"
    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    data-testid="task-input"
  />
  
  {#if suggestion}
    <TaskSuggestionComponent {suggestion} onTaskAdded={handleTaskAdded} />
  {/if}
</div>