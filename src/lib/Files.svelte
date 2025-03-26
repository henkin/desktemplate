<script>
  import { onMount, onDestroy } from 'svelte';
  import { io } from 'socket.io-client';
  
  let files = [];
  let socket;
  let isConnected = false;
  
  onMount(() => {
    // Connect to socket.io server with specific port
    socket = io('http://localhost:3000');
    
    // Handle connection
    socket.on('connect', () => {
      isConnected = true;
      console.log('Connected to server');
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      isConnected = false;
      console.log('Disconnected from server');
    });
    
    // Listen for file updates
    socket.on('files-updated', (data) => {
      files = data;
    });
    
    // Initial request for files
    socket.emit('get-files');
    
    return () => {
      // Clean up socket connection on component unmount
      if (socket) {
        socket.disconnect();
      }
    };
  });
  
  // Format file size for display
  function formatSize(size) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
  
  // Format timestamp for display
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
</script>

<div class="w-full max-w-md mx-auto bg-slate-800 rounded-lg shadow-md p-6">
  <h2 class="text-2xl font-bold mb-6 text-center text-white">Files</h2>
  
  <div class="bg-slate-700 rounded p-4 mb-4">
    <p class="text-sm text-slate-300">
      {#if isConnected}
        <span class="text-green-400">● Connected</span> - Real-time updates enabled
      {:else}
        <span class="text-red-400">● Disconnected</span> - Waiting for connection...
      {/if}
    </p>
  </div>
  
  <!-- Files list -->
  <div class="bg-slate-900 rounded overflow-hidden mb-4">
    {#if files.length === 0}
      <div class="p-4 text-center text-slate-400">
        No files found in the current directory.
      </div>
    {:else}
      <table class="w-full text-sm text-left">
        <thead class="text-xs text-slate-400 bg-slate-800">
          <tr>
            <th class="px-4 py-2">Name</th>
            <th class="px-4 py-2">Size</th>
            <th class="px-4 py-2">Modified</th>
          </tr>
        </thead>
        <tbody>
          {#each files as file}
            <tr class="border-b border-slate-700 hover:bg-slate-800">
              <td class="px-4 py-2 flex items-center">
                {#if file.isDirectory}
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                {:else}
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                  </svg>
                {/if}
                <span class="truncate max-w-[150px]">{file.name}</span>
              </td>
              <td class="px-4 py-2 text-slate-400">
                {file.isDirectory ? "--" : formatSize(file.size)}
              </td>
              <td class="px-4 py-2 text-slate-400">
                {formatDate(file.mtime)}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div> 