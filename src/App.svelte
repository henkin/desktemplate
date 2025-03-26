<script>
	import Todo from "./lib/Todo.svelte";
	import Files from "./lib/Files.svelte";
	
	// Get versions from the Electron API
	const nodeVersion = window.api ? window.api.node() : 'N/A';
	const chromeVersion = window.api ? window.api.chrome() : 'N/A';
	const electronVersion = window.api ? window.api.electron() : 'N/A';
	
	// Tab management
	let activeTab = 'todos'; // 'todos' or 'files'
</script>

<style>
	.draggable {
		-webkit-app-region: drag;
	}
	.no-drag {
		-webkit-app-region: no-drag;
	}
	:global(body) {
		background: transparent !important;
	}
</style>

<main class="min-h-screen bg-transparent text-white flex flex-col rounded-l-lg overflow-hidden shadow-lg relative">
	<!-- Header - Can drag window from here -->
	<header class="p-6 bg-slate-800/80 shadow-md draggable">
		<h1 class="text-3xl font-bold text-center">Todo List Application</h1>
		<p class="text-center text-slate-400 mt-2">A simple task management template</p>
	</header>
	
	<!-- Tab Navigation -->
	<div class="bg-slate-800/80 px-6 pb-0 pt-2 border-b border-slate-700 draggable">
		<div class="flex space-x-4 max-w-md mx-auto">
			<button 
				class="px-4 py-2 font-medium no-drag {activeTab === 'todos' ? 'text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}"
				on:click={() => activeTab = 'todos'}
			>
				Todos
			</button>
			<button 
				class="px-4 py-2 font-medium no-drag {activeTab === 'files' ? 'text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'}"
				on:click={() => activeTab = 'files'}
			>
				Files
			</button>
		</div>
	</div>
	
	<!-- Main Content -->
	<section class="flex-grow flex items-start justify-center p-6 bg-slate-900/70">
		{#if activeTab === 'todos'}
			<Todo />
		{:else if activeTab === 'files'}
			<Files />
		{/if}
	</section>

	<!-- Footer -->
	<footer class="bg-gray-950/80 py-3 px-6 draggable">
		<p class="text-center text-sm text-slate-400">
			Todo List Template App - Built with Svelte, Electron, and TailwindCSS
		</p>
		<p class="text-center text-xs text-slate-500 mt-1">
			Running on Node {nodeVersion} | Chrome {chromeVersion} | Electron {electronVersion}
		</p>
	</footer>
</main>
