<script lang="ts">
	import Header from '$components/layout/Header.svelte';
	import './../app.css';

	let { children } = $props();
</script>

<Header />
{@render children()}
