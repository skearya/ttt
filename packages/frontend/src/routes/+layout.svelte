<script>
	import '../app.postcss';
	import '@fontsource-variable/inter';
	import { Toaster } from 'svelte-sonner';
</script>

<svelte:head>
	<title>ttt</title>
</svelte:head>

<slot />

<Toaster theme="dark" />

<style>
	:global(body) {
		font-family: 'Inter Variable', sans-serif;
	}
</style>
