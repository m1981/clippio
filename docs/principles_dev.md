# Development Principles - Critical Do's and Don'ts

## 🎯 Universal Principles (Any Framework)

### ✅ ALWAYS DO

#### 1. Single Source of Truth
```typescript
// ✅ One store manages all related state
const todoStore = createTodoStore();

// ❌ Multiple sources for same data
let localTasks = [];
let storeTasks = todoStore.getTasks();
```

#### 2. Consistent Identifiers
```typescript
// ✅ Always use actual IDs
function addTask(task: Task, projectId: string) {
  store.addTask(task, projectId); // projectId = "uuid-123"
}

// ❌ Mix IDs and names
function addTask(task: Task, projectId: string) {
  // projectId could be "Work" or "uuid-123" - unpredictable
}
```

#### 3. Type Safety First
```typescript
// ✅ Explicit interfaces
interface TaskEvents {
  onTaskAdded: (task: Task, projectId: string) => void;
  onTaskToggle: (projectId: string, taskId: string) => void;
}

// ❌ Any types or missing interfaces
function handleEvent(data: any) { /* unsafe */ }
```

#### 4. Dependency Injection
```typescript
// ✅ Environment-based service selection
export function createTaskService(): TaskService {
  return import.meta.env.DEV 
    ? new MockTaskService()
    : new AnthropicTaskService();
}

// ❌ Hardcoded dependencies
const service = new MockTaskService(); // Always mock
```

#### 5. Single Responsibility
```typescript
// ✅ Each component/class has one job
class TaskInput { /* only handles input */ }
class TaskList { /* only renders tasks */ }
class TaskStore { /* only manages state */ }

// ❌ God components
class TaskEverything { /* input + display + store + API */ }
```

### ❌ NEVER DO

#### 1. State Mutation Outside Store
```typescript
// ❌ Components mutating data directly
function TaskItem({ task }) {
  task.completed = !task.completed; // Breaks data flow
}

// ✅ Use callbacks to request changes
function TaskItem({ task, onToggle }) {
  onToggle(task.id); // Request change via callback
}
```

#### 2. Mixed Data Types for Same Concept
```typescript
// ❌ Sometimes ID, sometimes name
onTaskAdded(task, "Work Projects");    // String name
onTaskToggle("uuid-123", taskId);      // UUID string

// ✅ Always same type
onTaskAdded(task, "uuid-work-123");    // Always UUID
onTaskToggle("uuid-work-123", taskId); // Always UUID
```

#### 3. Prop Drilling Beyond 3 Levels
```typescript
// ❌ Too many callback props
<Component 
  onTaskToggle={toggle}
  onTaskDelete={delete}
  onTaskEdit={edit}
  onTaskMove={move}
  onTaskDuplicate={duplicate}
  onTaskSetPriority={setPriority}
/>

// ✅ Group related operations
interface TaskOps {
  toggle: (id: string) => void;
  delete: (id: string) => void;
  edit: (id: string, title: string) => void;
}
<Component taskOps={taskOperations} />
```

## 🎭 Framework-Specific (Svelte/SvelteKit)

### ✅ SVELTE DO's

#### 1. Data Down, Events Up
```svelte
<!-- ✅ Parent passes data, child sends events -->
<TaskInput {projects} {onTaskAdded} />

<!-- ❌ Child accessing parent store directly -->
<script>
  import { todoStore } from '$lib/stores'; // Wrong
</script>
```

#### 2. Use Runes Properly
```typescript
// ✅ Svelte 5 runes
let count = $state(0);
let doubled = $derived(count * 2);

// ❌ Mixing old and new syntax
let count = 0; // Old style
$: doubled = count * 2; // Old reactive
```

#### 3. Reactive Declarations at Top Level
```svelte
<script>
  // ✅ Top-level reactivity
  $: projects = todoStore.getProjects();
  
  // ❌ Reactive in loops/conditions
  {#each items as item}
    $: computed = item.value * 2; // Wrong
  {/each}
</script>
```

### ❌ SVELTE DON'Ts

#### 1. Store Subscriptions in Loops
```svelte
<!-- ❌ Store access in loops -->
{#each projects as project}
  <div>{$todoStore.getProject(project.id)}</div>
{/each}

<!-- ✅ Pre-compute at top level -->
<script>
  $: projects = todoStore.getProjects();
</script>
{#each projects as project}
  <div>{project.name}</div>
{/each}
```

#### 2. Direct DOM Manipulation
```svelte
<!-- ❌ Manual DOM updates -->
<script>
  function updateTitle() {
    document.getElementById('title').textContent = newTitle;
  }
</script>

<!-- ✅ Reactive updates -->
<script>
  let title = $state('');
</script>
<h1>{title}</h1>
```

## 🚨 Code Review Red Flags

### Immediate Rejection Criteria:
- [ ] `project.name` used as identifier instead of `project.id`
- [ ] Direct store imports in child components
- [ ] More than 3 callback props on single component
- [ ] Hardcoded service instantiation (no factory pattern)
- [ ] Props being mutated directly in components
- [ ] Multiple state sources for same data
- [ ] Missing TypeScript interfaces for props/events

### Warning Signs:
- [ ] Components over 200 lines
- [ ] Functions with more than 5 parameters
- [ ] Nested ternary operators in templates
- [ ] Magic numbers/strings without constants
- [ ] Missing error handling for async operations

## 📏 Metrics for Success

### Component Health:
- **Props**: Max 5 props per component
- **Callbacks**: Max 3 callback props per component
- **Lines**: Max 200 lines per component
- **Responsibilities**: 1 clear purpose per component

### Type Safety:
- **Interfaces**: 100% of props/events typed
- **Any Types**: 0 usage of `any` type
- **Strict Mode**: TypeScript strict mode enabled

### Architecture:
- **Store Access**: Only top-level components access stores
- **Data Flow**: Unidirectional (down via props, up via events)
- **Service Layer**: All external APIs behind service interfaces

## 🎯 Quick Decision Framework (QDF)

**When adding new feature, ask:**
1. Does this follow single responsibility?
2. Are identifiers consistent (always IDs, never names)?
3. Is data flowing down, events flowing up?
4. Are services injected, not hardcoded?
5. Is everything typed with interfaces?

**If any answer is NO → Refactor before proceeding**

