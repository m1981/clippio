
# TodoApp Architecture

This document describes the architecture of the TodoApp application, following SOLID principles and SvelteKit best practices.

## Overview

The application is structured using a layered architecture with clear separation of concerns:

- **Presentation Layer**: Svelte components for UI
- **Service Layer**: Business logic and external API integration
- **Data Layer**: State management and data models
- **Types Layer**: TypeScript interfaces and type definitions

## Current Implementation Status

### ✅ Implemented Components
- **TodoApp**: Main orchestrator ✓
- **TaskInput**: Task creation with AI suggestions ✓  
- **ProjectList**: Renders project list ✓
- **ProjectHeader**: Project header with toggle ✓
- **TaskList**: Task rendering and interactions ✓
- **TaskSuggestion**: AI suggestion display ✓
- **TodoStore**: State management ✓

### ⚠️ Simplified from Architecture
- **No Factory Pattern**: Direct instantiation used for simplicity
- **No Service Interface**: Mock function used instead of service classes
- **No Melt UI**: Replaced with simple onclick handlers for reliability
- **No ProjectCard**: ProjectList directly manages header/tasks

### ❌ Not Yet Implemented  
- **TaskSuggestionService Interface**: Should be added for extensibility
- **AnthropicTaskSuggestionService**: Planned for production AI integration
- **Factory Functions**: Could be added for better testability

## Updated Class Diagram

```mermaid
classDiagram
    %% Current Implementation
    class TodoApp {
        -TodoStore todoStore
        +handleTaskAdded(task Task, projectId string)
        +handleTaskToggle(projectId string, taskId string)
        +handleTaskDelete(projectId string, taskId string)
    }

    class TaskInput {
        +Project[] projects
        +function onTaskAdded
        -string newTaskTitle
        -TaskSuggestion suggestion
        +handleInput()
        +mockAIResponse(title string) TaskSuggestion
    }

    class ProjectList {
        +Project[] projects
        +function onTaskToggle
        +function onTaskDelete
    }

    class ProjectHeader {
        +Project project
        +boolean isOpen
        +function onToggle
    }

    class TaskList {
        +Task[] tasks
        +string projectId
        +function onTaskToggle
        +function onTaskDelete
    }

    class TaskSuggestion {
        +TaskSuggestion suggestion
        +function onTaskAdded
    }

    class TodoStore {
        -Project[] projects
        +getProjects() Project[]
        +addTask(task Task, projectId string)
        +toggleTask(projectId string, taskId string)
        +deleteTask(projectId string, taskId string)
    }

    %% Relationships
    TodoApp --> TodoStore : uses
    TodoApp --> TaskInput : renders
    TodoApp --> ProjectList : renders
    
    TaskInput --> TaskSuggestion : renders
    TaskInput --> TodoApp : calls onTaskAdded
    
    ProjectList --> ProjectHeader : renders
    ProjectList --> TaskList : renders
    
    TaskSuggestion --> TaskInput : calls onTaskAdded
```

## Implementation Gaps

### 1. Add Service Interface (Recommended)
```typescript
// src/lib/services/taskSuggestion.ts
export interface TaskSuggestionService {
  getSuggestion(title: string, projects: Project[]): Promise<TaskSuggestion>;
}

export class MockTaskSuggestionService implements TaskSuggestionService {
  async getSuggestion(title: string, projects: Project[]): Promise<TaskSuggestion> {
    // Current mockAIResponse logic
  }
}
```

### 2. Add Factory Functions (Optional)
```typescript
// src/lib/factories/index.ts
export function createTaskSuggestionService(): TaskSuggestionService {
  return new MockTaskSuggestionService();
}
```

### 3. Future: Add Anthropic Service
```typescript
export class AnthropicTaskSuggestionService implements TaskSuggestionService {
  async getSuggestion(title: string, projects: Project[]): Promise<TaskSuggestion> {
    // Anthropic API integration
  }
}
```


### Component Communication Patterns

#### Parent-Child Communication
```mermaid
sequenceDiagram
    participant TodoApp
    participant TaskInput
    participant TaskSuggestionComponent
    
    TodoApp->>TaskInput: Pass projects prop
    TaskInput->>TaskSuggestionComponent: Pass suggestion data
    TaskSuggestionComponent->>TaskInput: Trigger onTaskAdded callback
    TaskInput->>TodoApp: Bubble up onTaskAdded event
```

#### Service Layer Integration
```mermaid
sequenceDiagram
    participant TaskInput
    participant TaskSuggestionFactory
    participant MockService
    participant TodoStore
    
    TaskInput->>TaskSuggestionFactory: createTaskSuggestion()
    TaskSuggestionFactory->>MockService: getSuggestion()
    MockService-->>TaskSuggestionFactory: TaskSuggestion
    TaskSuggestionFactory-->>TaskInput: TaskSuggestion
    TaskInput->>TodoStore: addTask()
```

