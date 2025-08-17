# TodoApp User Scenarios

## Primary User Flows

### 1. AI-Assisted Task Creation

```mermaid
sequenceDiagram
    participant User
    participant TaskInput
    participant AI as Claude API
    participant TodoStore
    participant UI

    User->>TaskInput: Types task title (3+ chars)
    TaskInput->>AI: Request categorization
    AI-->>TaskInput: Returns suggestion + confidence
    TaskInput->>UI: Display suggestion with reasoning

    alt User accepts suggestion
        User->>TaskInput: Clicks "Accept"
        TaskInput->>TodoStore: Add task to suggested project
    else User rejects suggestion
        User->>TaskInput: Selects different project
        TaskInput->>TodoStore: Add task to selected project
    else AI fails
        TaskInput->>UI: Show manual project selector
        User->>TaskInput: Selects project manually
        TaskInput->>TodoStore: Add task to selected project
    end

    TodoStore-->>UI: Update project list
    UI-->>User: Show task added with visual feedback
```

### 2. Task Management Operations

```mermaid
flowchart TD
    A[User views task] --> B{Action type?}

    B -->|Right-click| C[Context menu opens]
    B -->|Three-dots click| C
    B -->|Checkbox click| D[Toggle completion]

    C --> E{Menu selection?}
    E -->|Edit| F[Inline edit mode]
    E -->|Priority| G[Priority selector]
    E -->|Complete| D
    E -->|Delete| H[Confirm deletion]

    F --> I[Save changes]
    G --> J[Update priority badge]
    D --> K[Update visual state]
    H --> L[Remove from project]

    I --> M[Update TodoStore]
    J --> M
    K --> M
    L --> M

    M --> N[Refresh UI]
```

### 3. Project Management Flow

```mermaid
stateDiagram-v2
    [*] --> ProjectClosed: Default state

    ProjectClosed --> ProjectOpen: Click header/chevron
    ProjectOpen --> ProjectClosed: Click header/chevron

    state ProjectOpen {
        [*] --> ShowingTasks
        ShowingTasks --> TaskInteraction: User clicks task
        TaskInteraction --> ShowingTasks: Action completed

        state TaskInteraction {
            [*] --> ContextMenu
            ContextMenu --> EditMode: Edit selected
            ContextMenu --> PriorityChange: Priority selected
            ContextMenu --> Completion: Toggle selected
            ContextMenu --> Deletion: Delete selected

            EditMode --> [*]: Save/Cancel
            PriorityChange --> [*]: Priority set
            Completion --> [*]: Status updated
            Deletion --> [*]: Task removed
        }
    }

    note right of ProjectOpen
        Shows task count
        Displays all tasks
        Allows task interactions
    end note

    note right of ProjectClosed
        Shows task count only
        Hides task list
        Saves screen space
    end note
```

### 4. Responsive Design Scenarios

```mermaid
flowchart LR
    subgraph Desktop["Desktop Experience"]
        D1[Right-click context menu]
        D2[Hover states]
        D3[Keyboard navigation]
        D4[Full project visibility]
    end

    subgraph Mobile["Mobile Experience"]
        M1[Three-dots menu]
        M2[Touch interactions]
        M3[Swipe gestures]
        M4[Collapsible projects]
    end

    subgraph Shared["Shared Features"]
        S1[Task completion toggle]
        S2[Priority indicators]
        S3[AI suggestions]
        S4[Visual feedback]
    end

    Desktop --> Shared
    Mobile --> Shared
```

### 5. Error Handling Scenarios

```mermaid
flowchart TD
    A[User action initiated] --> B{Action type?}

    B -->|AI Request| C[Call Claude API]
    B -->|Task Operation| D[Update TodoStore]
    B -->|UI Interaction| E[Process interaction]

    C --> F{API Response?}
    F -->|Success| G[Show AI suggestion]
    F -->|Timeout| H[Show fallback options]
    F -->|Error| I[Show manual selector]

    D --> J{Store Update?}
    J -->|Success| K[Update UI]
    J -->|Error| L[Show error message]
    L --> M[Revert optimistic update]

    E --> N{Validation?}
    N -->|Valid| O[Execute action]
    N -->|Invalid| P[Show validation error]

    H --> Q[User selects manually]
    I --> Q
    Q --> D

    style H fill:#fff2cc
    style I fill:#fff2cc
    style L fill:#ffcccc
    style P fill:#ffcccc
```

### 6. Performance Optimization Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Debouncer
    participant AI
    participant Cache

    User->>UI: Types in task input
    UI->>Debouncer: Queue AI request

    Note over Debouncer: Wait 300ms for more input

    Debouncer->>Cache: Check for cached suggestion

    alt Cache hit
        Cache-->>UI: Return cached result
    else Cache miss
        Debouncer->>AI: Request categorization
        AI-->>Debouncer: Return suggestion
        Debouncer->>Cache: Store result
        Debouncer-->>UI: Return suggestion
    end

    UI-->>User: Show suggestion (<2s target)

    Note over UI: Optimistic updates for<br/>immediate feedback
```

## User Journey Examples

### New User Onboarding

1. **First Visit**: See demo data with Work/Personal projects
2. **Task Creation**: Experience AI suggestion for "Buy groceries" → Personal
3. **Context Menu**: Discover right-click/three-dots functionality
4. **Project Management**: Learn to collapse/expand projects
5. **Priority Setting**: Set task priorities and see visual indicators

### Power User Workflow

1. **Bulk Task Entry**: Quickly add multiple tasks with AI assistance
2. **Project Organization**: Manage multiple projects efficiently
3. **Priority Management**: Use priority levels for task organization
4. **Keyboard Navigation**: Navigate entirely via keyboard
5. **Mobile Usage**: Seamless experience across devices

### Error Recovery Scenarios

1. **AI Unavailable**: Graceful fallback to manual project selection
2. **Network Issues**: Offline functionality with local state
3. **Invalid Input**: Clear validation messages and recovery options
4. **Accidental Deletion**: Undo functionality (planned feature)

These scenarios guide development priorities and testing strategies, ensuring the app handles real-world usage patterns effectively.
