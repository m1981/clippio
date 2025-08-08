
<script lang="ts">
  import { createCollapsible } from "@melt-ui/svelte";
  import { ChevronRight, MoreVertical, Edit, Trash2, Check, Clock } from "lucide-svelte";

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
    open: boolean;
    collapsible?: {
      trigger: any;
      content: any;
      open: any;
    };
  }
  
  // Generated demo data
  let projects = $state<Project[]>([
    {
      id: '1',
      name: 'Work Projects',
      open: true,
      tasks: [
        { id: '1', title: 'Review pull requests', completed: false, priority: 'high' },
        { id: '2', title: 'Update documentation', completed: true, priority: 'medium' },
        { id: '3', title: 'Fix authentication bug', completed: false, priority: 'high' },
        { id: '4', title: 'Prepare presentation', completed: false, priority: 'low' }
      ]
    },
    {
      id: '2', 
      name: 'Personal',
      open: false,
      tasks: [
        { id: '5', title: 'Buy groceries', completed: false, priority: 'medium' },
        { id: '6', title: 'Call dentist', completed: true, priority: 'low' },
        { id: '7', title: 'Plan weekend trip', completed: false, priority: 'low' }
      ]
    }
  ]);
  
  // Initialize collapsibles for each project
  $effect(() => {
    projects.forEach(project => {
      if (!project.collapsible) {
        console.log('🔧 Creating collapsible for project:', project.id);
        
        const {
          elements: { trigger, content },
          states: { open }
        } = createCollapsible({
          defaultOpen: project.open,
          onOpenChange: ({ next }) => {
            console.log('🔄 Collapsible onOpenChange:', { projectId: project.id, currentOpen: project.open, nextOpen: next });
            project.open = next;
            console.log('🔄 Project open state updated:', { projectId: project.id, newOpen: project.open });
            return next;
          }
        });
        
        project.collapsible = { trigger, content, open };
        
        console.log('✅ Collapsible created:', { 
          projectId: project.id, 
          hasTrigger: !!project.collapsible.trigger,
          hasContent: !!project.collapsible.content
        });
      }
    });
  });
  
  console.log('🚀 TodoApp initialized with projects:', projects.map(p => ({ id: p.id, name: p.name, open: p.open })));
  
  // Track which dropdown is open and mouse position
  let openDropdown = $state<string | null>(null);
  let mouseX = $state(0);
  let mouseY = $state(0);
  
  function toggleTask(projectId: string, taskId: string) {
    console.log('✅ toggleTask called:', { projectId, taskId });
    const project = projects.find(p => p.id === projectId);
    const task = project?.tasks.find(t => t.id === taskId);
    if (task) {
      const oldCompleted = task.completed;
      task.completed = !task.completed;
      console.log('✅ Task toggled:', { taskId, from: oldCompleted, to: task.completed });
    } else {
      console.error('❌ Task not found:', { projectId, taskId });
    }
  }
  
  function deleteTask(projectId: string, taskId: string) {
    console.log('🗑️ deleteTask called:', { projectId, taskId });
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const taskCount = project.tasks.length;
      project.tasks = project.tasks.filter(t => t.id !== taskId);
      console.log('🗑️ Task deleted:', { taskId, tasksRemaining: project.tasks.length, wasCount: taskCount });
    }
    openDropdown = null;
  }
  
  function editTask(projectId: string, taskId: string) {
    console.log('✏️ editTask called:', { projectId, taskId });
    openDropdown = null;
  }
  
  function setPriority(projectId: string, taskId: string, priority: Task['priority']) {
    console.log('🎯 setPriority called:', { projectId, taskId, priority });
    const project = projects.find(p => p.id === projectId);
    const task = project?.tasks.find(t => t.id === taskId);
    if (task) {
      const oldPriority = task.priority;
      task.priority = priority;
      console.log('🎯 Priority changed:', { taskId, from: oldPriority, to: priority });
    }
    openDropdown = null;
  }
  
  function toggleDropdown(taskId: string, event: MouseEvent) {
    console.log('📋 toggleDropdown called:', { taskId, currentOpen: openDropdown });
    event.preventDefault();
    event.stopPropagation();
    
    // Store mouse coordinates
    mouseX = event.clientX;
    mouseY = event.clientY;
    console.log('🖱️ Mouse position stored:', { mouseX, mouseY });
    
    const wasOpen = openDropdown === taskId;
    openDropdown = wasOpen ? null : taskId;
    console.log('📋 Dropdown toggled:', { taskId, wasOpen, nowOpen: openDropdown });
  }
  
  function handleTaskRightClick(taskId: string, event: MouseEvent) {
    console.log('🖱️ Right-click on task:', { taskId });
    event.preventDefault();
    event.stopPropagation();
    
    // Store mouse coordinates
    mouseX = event.clientX;
    mouseY = event.clientY;
    console.log('🖱️ Right-click position stored:', { mouseX, mouseY });
    
    // Open context menu for this task
    openDropdown = taskId;
    console.log('📋 Context menu opened via right-click:', { taskId });
  }
  
  function handleClickOutside(event: MouseEvent) {
    if (openDropdown) {
      console.log('🖱️ Click outside detected, dropdown was open:', openDropdown);
      const isDropdownClick = (event.target as Element)?.closest('.dropdown-menu');
      if (!isDropdownClick) {
        console.log('🖱️ Closing dropdown due to outside click');
        openDropdown = null;
      } else {
        console.log('🖱️ Click was inside dropdown, keeping open');
      }
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="max-w-2xl mx-auto p-6 space-y-4">
  <h1 class="text-2xl font-bold text-gray-900">Todo Projects</h1>
  
  <hr class="my-8" />
  
  <!-- Your existing projects code -->
  {#each projects as project}
    {#if project.collapsible}
      <div class="border border-gray-200 rounded-lg">
        <!-- Project Header -->
        <button 
          use:project.collapsible.trigger
          onclick={() => console.log('🖱️ Project header clicked:', { projectId: project.id, currentOpen: project.open })}
          class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-center gap-3">
            <ChevronRight 
              class="w-4 h-4 transition-transform {project.open ? 'rotate-90' : ''}" 
            />
            <span class="font-medium text-gray-900">{project.name}</span>
            <span class="text-sm text-gray-500">
              ({project.tasks.filter(t => !t.completed).length} remaining)
            </span>
          </div>
        </button>
        
        <!-- Tasks List -->
        <div use:project.collapsible.content>
          {#if project.open}
            {console.log('🔍 Rendering content for project:', { id: project.id, open: project.open, taskCount: project.tasks.length })}
            {#if project.tasks.length === 0}
              <div class="p-4 text-gray-500 text-center">No tasks yet</div>
            {:else}
              <div class="divide-y divide-gray-100">
                {#each project.tasks as task}
                  <div 
                    class="flex items-center gap-3 p-4 hover:bg-gray-50 group relative"
                    oncontextmenu={(e) => handleTaskRightClick(task.id, e)}
                  >
                    <!-- Checkbox -->
                    <button
                      onclick={() => toggleTask(project.id, task.id)}
                      class="flex-shrink-0 w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center
                             {task.completed ? 'bg-green-500 border-green-500' : 'hover:border-green-400'}"
                    >
                      {#if task.completed}
                        <Check class="w-3 h-3 text-white" />
                      {/if}
                    </button>
                    
                    <!-- Task Content -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-medium {task.completed ? 'line-through text-gray-500' : 'text-gray-900'}">
                          {task.title}
                        </span>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                   {task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                                     task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                     'bg-gray-100 text-gray-800'}">
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Context Menu Trigger -->
                    <button 
                      onclick={(e) => toggleDropdown(task.id, e)}
                      oncontextmenu={(e) => toggleDropdown(task.id, e)}
                      class="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-opacity"
                    >
                      <MoreVertical class="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          {/if}
        </div>
      </div>
    {/if}
    
    <!-- Context Menu (outside project container to avoid clipping) -->
    {#each project.tasks as task}
      {#if openDropdown === task.id}
        {console.log('🎯 Rendering context menu for task:', { taskId: task.id, mouseX, mouseY })}
        <div 
          class="dropdown-menu fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] z-50"
          style="top: {Math.min(window.innerHeight - 300, mouseY)}px; left: {Math.min(window.innerWidth - 180, mouseX)}px;"
          onclick={(e) => e.stopPropagation()}
        >
          <button
            onclick={() => editTask(project.id, task.id)}
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Edit class="w-4 h-4" />
            Edit task
          </button>
          
          <button
            onclick={() => toggleTask(project.id, task.id)}
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            {#if task.completed}
              <Clock class="w-4 h-4" />
              Mark incomplete
            {:else}
              <Check class="w-4 h-4" />
              Mark complete
            {/if}
          </button>
          
          <div class="border-t border-gray-100 my-1"></div>
          
          <div class="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
            Priority
          </div>
          
          {#each ['high', 'medium', 'low'] as priority}
            <button
              onclick={() => setPriority(project.id, task.id, priority)}
              class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100
                     {task.priority === priority ? 'bg-blue-50 text-blue-700' : ''}"
            >
              <div class="w-2 h-2 rounded-full
                        {priority === 'high' ? 'bg-red-500' : 
                          priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'}">
              </div>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </button>
          {/each}
          
          <div class="border-t border-gray-100 my-1"></div>
          
          <button
            onclick={() => deleteTask(project.id, task.id)}
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 class="w-4 h-4" />
            Delete task
          </button>
        </div>
      {/if}
    {/each}
  {/each}
</div>