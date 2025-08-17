# TodoApp Technical Specification

## Core Requirements

### Functional Requirements

- **Task Management**: Create, edit, complete, delete tasks with priority levels
- **Project Organization**: Group tasks into collapsible projects with task counts
- **AI Categorization**: Auto-suggest project placement using Claude API
- **Context Operations**: Right-click/three-dots menu for task actions
- **Responsive UI**: Mobile-first design with touch/keyboard support

### Non-Functional Requirements

- **Performance**: <100ms UI responses, debounced AI calls
- **Reliability**: Graceful AI fallback, optimistic updates
- **Accessibility**: ARIA compliance, keyboard navigation
- **Browser Support**: Modern browsers, mobile Safari/Chrome

## Technical Stack

```typescript
// Core Technologies
Frontend: SvelteKit + Svelte 5 (runes) + TypeScript + Tailwind
Backend: SvelteKit API routes + SQLite + Drizzle ORM
AI: Anthropic Claude 3.5 Sonnet
Auth: Lucia Auth + session management
Testing: Playwright (E2E) + Vitest (unit) + Storybook
```

## Data Models

```typescript
interface Task {
	id: string;
	title: string;
	completed: boolean;
	priority: 'low' | 'medium' | 'high';
	dueDate?: string;
}

interface Project {
	id: string;
	name: string;
	tasks: Task[];
	open: boolean; // collapse state
}

interface TaskSuggestion {
	suggestedProject: string;
	confidence: number;
	reasoning: string;
	alternatives: string[];
}
```

## Component Architecture

```
TodoApp (orchestrator)
├── TaskInput + TaskSuggestion (AI-powered input)
└── ProjectList
    ├── ProjectHeader (collapsible)
    └── TaskList → TaskItem (context menu)
```

## API Endpoints

- `POST /api/tasks/categorize` - AI task categorization
- Database operations via Drizzle ORM
- Session management via Lucia Auth

## State Management

- **Svelte 5 Runes**: `$state()`, `$derived()`, `$effect()`
- **TodoStore**: Centralized project/task state
- **Real-time Updates**: Reactive UI with optimistic updates

## User Interactions

### Task Creation Flow

1. Type task title (3+ chars triggers AI)
2. AI suggests project + confidence score
3. Accept/reject suggestion or manual select
4. Task added with visual feedback

### Context Menu Actions

- Edit task title
- Toggle completion
- Set priority (high/medium/low)
- Delete task

### Project Management

- Collapse/expand projects
- View task counts
- Visual priority indicators

## Development Standards

### Code Organization

```
src/
├── lib/
│   ├── components/     # Svelte components
│   ├── stores/         # State management
│   ├── services/       # Business logic
│   └── types/          # TypeScript definitions
├── routes/             # SvelteKit routes + API
└── app.html           # Root template
```

## Implementation Status

### ✅ Complete
- Core CRUD operations
- AI integration with fallback
- Responsive design
- Collapsible projects
- Project ID/name consistency fixes
- Svelte 5 reactive state management

### 🔄 Ready for Implementation
- Service interface pattern (code ready)
- Error/loading states (patterns defined)
- Database persistence (store foundation ready)

### 🔄 In Progress
- TaskSuggestionService refactoring
- Comprehensive error handling
- Database schema integration

### ❌ Future
- User authentication integration
- Advanced AI context awareness
- Offline support
