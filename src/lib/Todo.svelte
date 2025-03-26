<script>
  import { onMount } from 'svelte';
  
  // Todo structure with id, text, and completed status
  let todos = [];
  let newTodoText = '';
  let filter = 'all'; // Filter options: 'all', 'active', 'completed'
  let editingId = null;
  let editText = '';
  
  // Computed filtered todos
  $: filteredTodos = filter === 'all' 
    ? todos 
    : filter === 'active' 
      ? todos.filter(todo => !todo.completed) 
      : todos.filter(todo => todo.completed);
      
  // Computed stats  
  $: totalTodos = todos.length;
  $: completedTodos = todos.filter(todo => todo.completed).length;
  $: activeTodos = totalTodos - completedTodos;
  
  // Safe access to localStorage
  function saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }
  
  function loadFromStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      return null;
    }
  }
  
  // Load saved todos from localStorage when component mounts
  onMount(() => {
    const savedTodos = loadFromStorage('todos');
    if (savedTodos) {
      todos = savedTodos;
    }
  });
  
  // Save todos to localStorage whenever they change
  $: {
    if (todos) {
      saveToStorage('todos', todos);
    }
  }
  
  // Add a new todo
  function addTodo() {
    if (newTodoText.trim()) {
      todos = [
        ...todos, 
        { 
          id: Date.now(), 
          text: newTodoText.trim(), 
          completed: false 
        }
      ];
      newTodoText = '';
    }
  }
  
  // Toggle todo completed status
  function toggleTodo(id) {
    todos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  }
  
  // Delete a todo
  function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
  }
  
  // Clear completed todos
  function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
  }
  
  // Mark all as completed or active
  function toggleAll() {
    const allCompleted = todos.every(todo => todo.completed);
    todos = todos.map(todo => ({
      ...todo,
      completed: !allCompleted
    }));
  }
  
  // Start editing a todo
  function startEdit(todo) {
    editingId = todo.id;
    editText = todo.text;
  }
  
  // Save edited todo
  function saveEdit() {
    if (editingId !== null) {
      if (editText.trim()) {
        todos = todos.map(todo => 
          todo.id === editingId ? { ...todo, text: editText.trim() } : todo
        );
      } else {
        // If edit text is empty, remove the todo
        todos = todos.filter(todo => todo.id !== editingId);
      }
      cancelEdit();
    }
  }
  
  // Cancel editing
  function cancelEdit() {
    editingId = null;
    editText = '';
  }
  
  // Handle key presses in edit mode
  function handleEditKeydown(event) {
    if (event.key === 'Enter') {
      saveEdit();
    } else if (event.key === 'Escape') {
      cancelEdit();
    }
  }
</script>

<div class="w-full max-w-md mx-auto bg-slate-800 rounded-lg shadow-md p-6">
  <h2 class="text-2xl font-bold mb-6 text-center text-white">Todo List</h2>
  
  <!-- Add new todo form -->
  <form on:submit|preventDefault={addTodo} class="mb-6">
    <div class="flex">
      <input
        type="text"
        bind:value={newTodoText}
        placeholder="Add a new task..."
        class="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-700 text-white"
      />
      <button 
        type="submit" 
        class="bg-indigo-600 text-white px-4 py-2 rounded-r hover:bg-indigo-700 transition-colors"
      >
        Add
      </button>
    </div>
  </form>
  
  <!-- Todo list stats and filters -->
  <div class="flex justify-between items-center mb-4 text-slate-400 text-sm">
    <div>
      <span>{activeTodos} items left</span>
    </div>
    
    <div class="flex space-x-2">
      <button 
        class="{filter === 'all' ? 'text-white font-medium' : ''}"
        on:click={() => filter = 'all'}
      >
        All
      </button>
      <button 
        class="{filter === 'active' ? 'text-white font-medium' : ''}"
        on:click={() => filter = 'active'}
      >
        Active
      </button>
      <button 
        class="{filter === 'completed' ? 'text-white font-medium' : ''}"
        on:click={() => filter = 'completed'}
      >
        Completed
      </button>
    </div>
    
    <button 
      on:click={clearCompleted}
      class={completedTodos ? 'text-red-500 hover:text-red-600' : 'opacity-50 cursor-not-allowed'}
      disabled={!completedTodos}
    >
      Clear completed
    </button>
  </div>
  
  <!-- Toggle all button -->
  {#if totalTodos > 0}
    <div class="mb-4">
      <button 
        on:click={toggleAll}
        class="text-sm text-slate-400 hover:text-white flex items-center"
      >
        <span class="mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
        {todos.every(todo => todo.completed) ? 'Mark all as incomplete' : 'Mark all as complete'}
      </button>
    </div>
  {/if}
  
  <!-- Todo list -->
  <ul class="space-y-2">
    {#if filteredTodos.length === 0}
      <li class="text-slate-400 text-center py-4">
        {totalTodos === 0 
          ? 'No todos yet. Add one above!' 
          : filter === 'active' 
            ? 'No active todos.' 
            : 'No completed todos.'}
      </li>
    {:else}
      {#each filteredTodos as todo (todo.id)}
        <li class="flex items-center bg-slate-700 p-3 rounded">
          {#if editingId === todo.id}
            <!-- Edit mode -->
            <div class="flex w-full items-center">
              <input
                type="text"
                bind:value={editText}
                on:keydown={handleEditKeydown}
                class="flex-grow p-1 bg-slate-600 text-white border border-indigo-500 rounded mr-2"
                autofocus
              />
              <div class="flex space-x-2">
                <button 
                  on:click={saveEdit}
                  class="text-green-500 hover:text-green-400"
                  aria-label="Save edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button 
                  on:click={cancelEdit}
                  class="text-red-500 hover:text-red-400"
                  aria-label="Cancel edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          {:else}
            <!-- View mode -->
            <input
              type="checkbox"
              checked={todo.completed}
              on:change={() => toggleTodo(todo.id)}
              class="mr-3 h-5 w-5 text-indigo-600 rounded"
            />
            <span 
              class={todo.completed ? "line-through text-slate-400 flex-grow" : "flex-grow text-white"}
              on:dblclick={() => startEdit(todo)}
            >
              {todo.text}
            </span>
            <div class="flex space-x-2">
              <button
                on:click={() => startEdit(todo)}
                class="text-blue-500 hover:text-blue-400 transition-colors"
                aria-label="Edit todo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                on:click={() => deleteTodo(todo.id)}
                class="text-red-500 hover:text-red-400 transition-colors"
                aria-label="Delete todo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          {/if}
        </li>
      {/each}
    {/if}
  </ul>
</div> 