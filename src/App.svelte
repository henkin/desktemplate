<script>
	import Todo from "./lib/Todo.svelte";
	
	// Get versions from the Electron API
	const nodeVersion = window.api ? window.api.node() : 'N/A';
	const chromeVersion = window.api ? window.api.chrome() : 'N/A';
	const electronVersion = window.api ? window.api.electron() : 'N/A';
</script>

<main class="min-h-screen bg-slate-900 text-white flex flex-col">
	<!-- Header -->
	<header class="p-6 bg-slate-800 shadow-md">
		<h1 class="text-3xl font-bold text-center">Todo List Application</h1>
		<p class="text-center text-slate-400 mt-2">A simple task management template</p>
	</header>
	
	<!-- Main Content -->
	<section class="flex-grow flex items-start justify-center p-6">
		<Todo />
	</section>

	<!-- Footer -->
	<footer class="bg-gray-950 py-3 px-6">
		<p class="text-center text-sm text-slate-400">
			Todo List Template App - Built with Svelte, Electron, and TailwindCSS
		</p>
		<p class="text-center text-xs text-slate-500 mt-1">
			Running on Node {nodeVersion} | Chrome {chromeVersion} | Electron {electronVersion}
		</p>
	</footer>
</main>
