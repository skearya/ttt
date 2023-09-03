<script>
	import '../app.postcss';
	import '@fontsource-variable/inter';
</script>

<slot />

<style>
	:global(body) {
		font-family: 'Inter Variable', sans-serif;
	}
</style>
