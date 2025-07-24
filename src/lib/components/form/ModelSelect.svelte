<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Tables } from '$components/types/database.types';

	export let models: Tables<'models'>[] = [];
	export let value: string = '';
	export let placeholder: string = 'Select a model';
	export let label: string = '';
	export let required: boolean = false;
	export let disabled: boolean = false;

	const dispatch = createEventDispatcher<{ change: string }>();

	function handleChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		value = target.value;
		dispatch('change', value);
	}

	function formatPrice(price: number | null | undefined): string {
		if (!price) return '$0';
		return `$${price.toLocaleString()}`;
	}
</script>

<div class="model-select-container">
	{#if label}
		<label for={label} class="select-label">
			{label}
			{#if required}<span class="required">*</span>{/if}
		</label>
	{/if}
	<select
		id={label}
		{value}
		on:change={handleChange}
		class="model-select-input"
		{required}
		{disabled}
	>
		<option value="" disabled selected>{placeholder}</option>
		{#each models as model}
			<option value={model.id}>
				{model.width}' x {model.length}' {model.axle} - {formatPrice(model.starting_price)}
			</option>
		{/each}
	</select>
</div>

<style>
	.model-select-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.select-label {
		font-weight: 500;
		color: #374151;
		font-size: 0.875rem;
	}

	.required {
		color: #ef4444;
	}

	.model-select-input {
		padding: 0.75rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		background-color: white;
		font-size: 1rem;
		line-height: 1.5;
		color: #111827;
		transition:
			border-color 0.15s ease-in-out,
			box-shadow 0.15s ease-in-out;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	}

	.model-select-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.model-select-input:disabled {
		background-color: #f3f4f6;
		color: #9ca3af;
		cursor: not-allowed;
	}

	.model-select-input option {
		padding: 0.5rem;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	}
</style>
