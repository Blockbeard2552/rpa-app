<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';
	import { slide } from 'svelte/transition';

	export let title: string;
	export let isOpen: boolean = false;

	function toggle() {
		isOpen = !isOpen;
	}
</script>

<div class="accordion">
	<button class="accordion-header" on:click={toggle} type="button">
		<span class="accordion-title">{title}</span>
		<ChevronDown size={20} class="accordion-chevron {isOpen ? 'rotated' : ''}" />
	</button>
	{#if isOpen}
		<div class="accordion-content" transition:slide={{ duration: 200 }}>
			<slot />
		</div>
	{/if}
</div>

<style>
	.accordion {
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		overflow: visible;
		margin-bottom: 1rem;
	}

	.accordion-header {
		width: 100%;
		padding: 0.75rem 1.25rem;
		background-color: #f9fafb;
		border: none;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		transition: background-color 0.15s ease-in-out;
	}

	.accordion-header:hover {
		background-color: #f3f4f6;
	}

	.accordion-title {
		font-weight: 600;
		color: #374151;
		font-size: 0.75rem;
		text-align: left;
	}

	.accordion-content {
		padding: 1.25rem;
		background-color: white;
		border-top: 1px solid #e5e7eb;
		position: relative;
		z-index: 1;
	}

	:global(.accordion-chevron) {
		transition: transform 0.2s ease-in-out;
		color: #6b7280;
	}

	:global(.accordion-chevron.rotated) {
		transform: rotate(180deg);
	}
</style>
