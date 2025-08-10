# TypeScript Development Principles - Commercial Grade

## 🎯 Type System Mastery

### ✅ STRICT TYPE SAFETY

#### 1. Enable Strict Mode Always
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### 2. Use Discriminated Unions for State
```typescript
// ✅ Type-safe state management
type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Task[] }
  | { status: 'error'; error: string };

function handleState(state: LoadingState) {
  switch (state.status) {
    case 'success':
      return state.data; // TypeScript knows data exists
    case 'error':
      return state.error; // TypeScript knows error exists
  }
}

// ❌ Loose typing
interface State {
  status: string;
  data?: any;
  error?: any;
}
```

#### 3. Branded Types for Domain Safety
```typescript
// ✅ Prevent ID confusion
type ProjectId = string & { readonly brand: unique symbol };
type TaskId = string & { readonly brand: unique symbol };

function createProjectId(id: string): ProjectId {
  return id as ProjectId;
}

function addTask(task: Task, projectId: ProjectId) {
  // Can't accidentally pass TaskId here
}

// ❌ Primitive obsession
function addTask(task: Task, projectId: string) {
  // Could pass any string - unsafe
}
```

### ✅ ADVANCED TYPE PATTERNS

#### 4. Utility Types for API Contracts
```typescript
// ✅ Derive types from base interfaces
interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

// API types derived from domain types
type CreateTaskRequest = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateTaskRequest = Partial<Pick<Task, 'title' | 'priority'>>;
type TaskResponse = Omit<Task, 'createdAt' | 'updatedAt'> & {
  createdAt: string; // ISO string for JSON
  updatedAt: string;
};

// ❌ Duplicate type definitions
interface CreateTaskRequest {
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}
```

#### 5. Generic Constraints for Reusability
```typescript
// ✅ Type-safe generic functions
interface Identifiable {
  id: string;
}

function findById<T extends Identifiable>(
  items: T[], 
  id: string
): T | undefined {
  return items.find(item => item.id === id);
}

// Usage is type-safe
const task = findById(tasks, 'task-1'); // Returns Task | undefined
const project = findById(projects, 'proj-1'); // Returns Project | undefined

// ❌ Untyped generic
function findById<T>(items: T[], id: string): T | undefined {
  return items.find((item: any) => item.id === id); // No type safety
}
```

## 🏗️ Architecture Patterns

### ✅ DEPENDENCY INVERSION

#### 6. Interface Segregation
```typescript
// ✅ Small, focused interfaces
interface TaskReader {
  getTasks(projectId: string): Promise<Task[]>;
  getTask(taskId: string): Promise<Task | null>;
}

interface TaskWriter {
  createTask(task: CreateTaskRequest): Promise<Task>;
  updateTask(taskId: string, updates: UpdateTaskRequest): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;
}

interface TaskService extends TaskReader, TaskWriter {}

// ❌ Fat interface
interface TaskService {
  getTasks(): Promise<Task[]>;
  createTask(): Promise<Task>;
  updateTask(): Promise<Task>;
  deleteTask(): Promise<void>;
  exportTasks(): Promise<string>;
  importTasks(): Promise<void>;
  validateTask(): boolean;
  formatTask(): string;
}
```

#### 7. Factory Pattern with Type Safety
```typescript
// ✅ Type-safe factory with environment switching
interface ServiceConfig {
  apiUrl: string;
  timeout: number;
  retries: number;
}

type Environment = 'development' | 'staging' | 'production';

class ServiceFactory {
  static createTaskService(env: Environment, config: ServiceConfig): TaskService {
    switch (env) {
      case 'development':
        return new MockTaskService();
      case 'staging':
        return new StagingTaskService(config);
      case 'production':
        return new ProductionTaskService(config);
      default:
        const _exhaustive: never = env;
        throw new Error(`Unknown environment: ${_exhaustive}`);
    }
  }
}

// ❌ Untyped factory
function createService(env: string): any {
  if (env === 'dev') return new MockService();
  return new RealService();
}
```

### ✅ ERROR HANDLING

#### 8. Result Pattern for Error Safety
```typescript
// ✅ Type-safe error handling
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function fetchTasks(projectId: string): Promise<Result<Task[]>> {
  try {
    const response = await api.get(`/projects/${projectId}/tasks`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

// Usage forces error handling
const result = await fetchTasks('proj-1');
if (result.success) {
  console.log(result.data); // TypeScript knows this is Task[]
} else {
  console.error(result.error); // TypeScript knows this is Error
}

// ❌ Throwing exceptions
async function fetchTasks(projectId: string): Promise<Task[]> {
  const response = await api.get(`/projects/${projectId}/tasks`);
  return response.data; // Can throw, caller might not handle
}
```

## 🔒 Type Guards & Validation

### ✅ RUNTIME TYPE SAFETY

#### 9. Type Guards for External Data
```typescript
// ✅ Runtime validation with type guards
function isTask(obj: unknown): obj is Task {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Task).id === 'string' &&
    typeof (obj as Task).title === 'string' &&
    typeof (obj as Task).completed === 'boolean' &&
    ['low', 'medium', 'high'].includes((obj as Task).priority)
  );
}

function parseApiResponse(data: unknown): Task[] {
  if (!Array.isArray(data)) {
    throw new Error('Expected array');
  }
  
  return data.filter(isTask); // Type-safe filtering
}

// ❌ Unsafe casting
function parseApiResponse(data: any): Task[] {
  return data as Task[]; // No runtime validation
}
```

#### 10. Schema Validation with Zod
```typescript
// ✅ Schema-first development
import { z } from 'zod';

const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  completed: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']),
  createdAt: z.date(),
  updatedAt: z.date()
});

type Task = z.infer<typeof TaskSchema>;

const CreateTaskSchema = TaskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

type CreateTaskRequest = z.infer<typeof CreateTaskSchema>;

// Runtime validation
function validateTask(data: unknown): Task {
  return TaskSchema.parse(data); // Throws if invalid
}
```

## 🚀 Performance & Optimization

### ✅ EFFICIENT TYPES

#### 11. Const Assertions for Performance
```typescript
// ✅ Const assertions for literal types
const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
type TaskPriority = typeof TASK_PRIORITIES[number]; // 'low' | 'medium' | 'high'

const API_ENDPOINTS = {
  tasks: '/api/tasks',
  projects: '/api/projects',
  users: '/api/users'
} as const;

type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];

// ❌ Loose typing
const TASK_PRIORITIES = ['low', 'medium', 'high']; // string[]
type TaskPriority = string; // Too broad
```

#### 12. Mapped Types for Transformations
```typescript
// ✅ Efficient type transformations
type Optional<T> = {
  [K in keyof T]?: T[K];
};

type Timestamps = {
  createdAt: Date;
  updatedAt: Date;
};

type WithTimestamps<T> = T & Timestamps;

// Compose types efficiently
type TaskEntity = WithTimestamps<Task>;
type PartialTask = Optional<Task>;

// ❌ Manual type definitions
interface PartialTask {
  id?: string;
  title?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
}
```

## 🚨 Anti-Patterns to Avoid

### ❌ TYPE SYSTEM VIOLATIONS

#### 1. Any Type Usage
```typescript
// ❌ Disables type checking
function processData(data: any): any {
  return data.whatever.nested.property;
}

// ✅ Use unknown and type guards
function processData(data: unknown): ProcessedData {
  if (isValidData(data)) {
    return transformData(data);
  }
  throw new Error('Invalid data structure');
}
```

#### 2. Type Assertions Without Guards
```typescript
// ❌ Unsafe casting
const task = apiResponse as Task;

// ✅ Safe parsing with validation
const task = TaskSchema.parse(apiResponse);
```

#### 3. Mutable Global State
```typescript
// ❌ Mutable global state
export let globalTasks: Task[] = [];

// ✅ Immutable state management
export class TaskStore {
  private tasks: readonly Task[] = [];
  
  getTasks(): readonly Task[] {
    return this.tasks;
  }
  
  addTask(task: Task): TaskStore {
    return new TaskStore([...this.tasks, task]);
  }
}
```

## 📏 Code Quality Metrics

### TypeScript Health Indicators:
- **Type Coverage**: >95% (use `type-coverage` tool)
- **Any Usage**: 0 instances of `any` type
- **Strict Mode**: All strict flags enabled
- **Type Errors**: 0 TypeScript errors in CI/CD
- **Runtime Errors**: <1% from type-related issues

### Performance Metrics:
- **Compilation Time**: <30s for full build
- **Bundle Size**: Types stripped in production
- **Memory Usage**: <100MB for TypeScript service
- **IDE Response**: <200ms for autocomplete

## 🎯 Decision Framework (QDF)

**Before writing any TypeScript code, ask:**
1. Are all types explicit and strict?
2. Is runtime validation in place for external data?
3. Are errors handled with Result types or proper try/catch?
4. Are interfaces small and focused?
5. Is the type system helping or hindering development?

**If any answer is NO → Refactor the type design**

