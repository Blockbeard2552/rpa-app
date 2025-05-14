<script lang="ts">
	import { getUserState } from '$lib/state/user-state.svelte';

	let userContext = getUserState();
	let { allOrders } = $derived(userContext);

	$inspect(allOrders);
</script>

<ul>
	{#each allOrders as order}
		<li>{order.id}</li>
		<li>{order.model}</li>
		<li>{order.options}</li>
	{/each}
</ul>
