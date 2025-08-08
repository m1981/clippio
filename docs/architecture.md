
# TodoApp Architecture

This document describes the architecture of the TodoApp application, following SOLID principles and SvelteKit best practices.

## Overview

The application is structured using a layered architecture with clear separation of concerns:

- **Presentation Layer**: Svelte components for UI
- **Service Layer**: Business logic and external API integration
- **Data Layer**: State management and data models
- **Types Layer**: TypeScript interfaces and type definitions

## Class Diagram

```mermaid
classDiagram
    %% Types/Interfaces
    class Task {
        +string id
        +string title
        +boolean completed
        +string priority
        +string dueDate
    }

    class Project {
        +string id
        +string name
        +Task[] tasks
        +boolean open
    }

    class TaskSuggestion {
        +string suggestedProject
        +number confidence
        +string reasoning
        +string[] alternatives
    }

    class TaskInputEvents {
        <<interface>>
        +onTaskAdded(task Task, projectId string)
    }

    class ProjectEvents {
        <<interface>>
        +onTaskToggle(projectId string, taskId string)
        +onTaskDelete(projectId string, taskId string)
    }

    %% Service Layer
    class TaskSuggestionService {
        <<interface>>
        +getSuggestion(title string, projects Project[]) TaskSuggestion
    }

    class MockTaskSuggestionService {
        +getSuggestion(title string, projects Project[]) TaskSuggestion
    }

    class AnthropicTaskSuggestionService {
        +getSuggestion(title string, projects Project[]) TaskSuggestion
    }

    %% Store Layer
    class TodoStore {
        -Project[] projects
        +TodoStore(initialProjects Project[])
        +getProjects() Project[]
        +addTask(task Task, projectId string)
        +toggleTask(projectId string, taskId string)
        +deleteTask(projectId string, taskId string)
    }

    %% Component Layer
    class TodoApp {
        -TodoStore todoStore
        +handleTaskAdded(task Task, projectId string)
        +handleTaskToggle(projectId string, taskId string)
        +handleTaskDelete(projectId string, taskId string)
    }

    class TaskInput {
        +Project[] projects
        +TaskInputEvents onTaskAdded
        -string newTaskTitle
        -TaskSuggestion suggestion
        +handleInput()
    }

    class ProjectList {
        +Project[] projects
        +ProjectEvents onTaskToggle
        +ProjectEvents onTaskDelete
    }

    class ProjectCard {
        +Project project
        +ProjectEvents onTaskToggle
        +ProjectEvents onTaskDelete
        -CollapsibleElements elements
        -CollapsibleStates states
    }

    class TaskList {
        +Task[] tasks
        +string projectId
        +ProjectEvents onTaskToggle
        +ProjectEvents onTaskDelete
    }

    class ProjectHeader {
        +Project project
        +CollapsibleTrigger trigger
        +boolean isOpen
    }

    class TaskSuggestionComponent {
        +TaskSuggestion suggestion
        +TaskInputEvents onTaskAdded
    }

    %% Factory Functions
    class TaskSuggestionFactory {
        <<factory>>
        +createTaskSuggestion(title string, projects Project[]) TaskSuggestion
    }

    class TodoStoreFactory {
        <<factory>>
        +createTodoStore(initialProjects Project[]) TodoStore
    }

    %% External Dependencies
    class MeltUI {
        <<external>>
        +createCollapsible()
    }

    class AnthropicAPI {
        <<external>>
        +messagesCreate()
    }

    %% Relationships
    Project "1" *-- "many" Task : contains
    TodoStore "1" *-- "many" Project : manages
    
    TaskSuggestionService <|.. MockTaskSuggestionService : implements
    TaskSuggestionService <|.. AnthropicTaskSuggestionService : implements
    
    TodoApp --> TodoStore : uses
    TodoApp --> TaskInput : renders
    TodoApp --> ProjectList : renders
    
    TaskInput --> TaskSuggestionFactory : uses
    TaskInput --> TaskSuggestionComponent : renders
    TaskInput ..|> TaskInputEvents : implements
    
    ProjectList --> ProjectCard : renders
    ProjectCard --> TaskList : renders
    ProjectCard --> ProjectHeader : renders
    ProjectCard --> MeltUI : uses
    ProjectCard ..|> ProjectEvents : implements
    
    TaskList ..|> ProjectEvents : implements
    
    MockTaskSuggestionService --> TaskSuggestion : creates
    AnthropicTaskSuggestionService --> AnthropicAPI : uses
    AnthropicTaskSuggestionService --> TaskSuggestion : creates
    
    TaskSuggestionFactory --> TaskSuggestionService : creates
    TodoStoreFactory --> TodoStore : creates
```

## Architecture Principles

### SOLID Principles Applied

#### 1. Single Responsibility Principle (SRP)
- **TodoApp**: Orchestrates the application and handles top-level events
- **TaskInput**: Handles task creation and suggestion display
- **ProjectCard**: Manages individual project display and collapsible behavior
- **TaskList**: Renders and manages task interactions
- **TodoStore**: Manages application state and data operations

#### 2. Open/Closed Principle (OCP)
- **TaskSuggestionService**: Interface allows adding new suggestion providers without modifying existing code
- **Component composition**: New components can be added without changing existing ones

#### 3. Liskov Substitution Principle (LSP)
- **MockTaskSuggestionService** and **AnthropicTaskSuggestionService** are interchangeable
- Both implement the same interface contract

#### 4. Interface Segregation Principle (ISP)
- **TaskInputEvents** and **ProjectEvents** are focused, specific interfaces
- Components only depend on the methods they actually use

#### 5. Dependency Inversion Principle (DIP)
- **TaskInput** depends on the abstraction (TaskSuggestionService) not concrete implementations
- **TodoApp** depends on TodoStore abstraction, not specific state management details

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

