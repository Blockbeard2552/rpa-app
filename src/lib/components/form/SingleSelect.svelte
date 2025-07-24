<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { ChevronDown } from '@lucide/svelte';

	export let options: Array<{ value: string; label: string; note?: string | null; disabled?: boolean }> = [];
	export let value: string = '';
	export let placeholder: string = 'Select an option';
	export let label: string = '';
	export let required: boolean = false;
	export let disabled: boolean = false;

	const dispatch = createEventDispatcher<{ change: string }>();

	let isOpen = false;
	let container: HTMLDivElement;
	let selectedLabel = '';

	$: selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder;

	function toggle() {
		if (!disabled) {
			isOpen = !isOpen;
		}
	}

	function selectOption(optionValue: string, optionDisabled: boolean = false) {
		if (optionDisabled) return;
		value = optionValue;
		isOpen = false;
		dispatch('change', value);
	}

	function handleClickOutside(event: MouseEvent) {
		if (container && !container.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="select-container" bind:this={container}>
	{#if label}
		<label class="select-label">
			{label}
			{#if required}<span class="required">*</span>{/if}
		</label>
	{/if}
	<div class="dropdown" class:disabled>
		<button type="button" class="dropdown-toggle" on:click={toggle} {disabled}>
			<span class="dropdown-value" class:placeholder={!value}>
				{selectedLabel}
			</span>
			<ChevronDown size={20} class="dropdown-chevron {isOpen ? 'rotated' : ''}" />
		</button>
		{#if isOpen && !disabled}
			<div class="dropdown-menu">
				{#each options as option}
					<button
						type="button"
						class="dropdown-item"
						class:selected={option.value === value}
						class:disabled={option.disabled}
						disabled={option.disabled}
						on:click={() => selectOption(option.value, option.disabled)}
					>
						<div class="option-content">
							<span class="option-label">{option.label}</span>
							{#if option.note}
								<span class="option-note">{option.note}</span>
							{/if}
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.select-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		position: relative;
	}

	.select-label {
		font-weight: 500;
		color: #374151;
		font-size: 0.875rem;
	}

	.required {
		color: #ef4444;
	}

	.dropdown {
		position: relative;
	}

	.dropdown-toggle {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		background-color: white;
		font-size: 1rem;
		line-height: 1.5;
		color: #111827;
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition:
			border-color 0.15s ease-in-out,
			box-shadow 0.15s ease-in-out;
	}

	.dropdown-toggle:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.dropdown-toggle:hover {
		border-color: #9ca3af;
	}

	.dropdown.disabled .dropdown-toggle {
		background-color: #f3f4f6;
		color: #9ca3af;
		cursor: not-allowed;
	}

	.dropdown-value {
		flex: 1;
		text-align: left;
	}

	.dropdown-value.placeholder {
		color: #9ca3af;
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 0.25rem);
		left: 0;
		right: 0;
		background-color: white;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
		z-index: 50;
		max-height: 400px;
		overflow-y: auto;
	}

	.dropdown-item {
		width: 100%;
		padding: 0.75rem 1rem;
		border: none;
		background: none;
		text-align: left;
		cursor: pointer;
		font-size: 0.875rem;
		color: #374151;
		transition: background-color 0.15s ease-in-out;
	}

	.option-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.option-label {
		font-size: 0.875rem;
		color: #374151;
		line-height: 1.4;
	}

	.option-note {
		font-size: 0.75rem;
		color: #6b7280;
		line-height: 1.3;
		font-style: italic;
	}

	.dropdown-item:hover {
		background-color: #f3f4f6;
	}

	.dropdown-item.selected {
		background-color: #3b82f6;
		color: white;
	}

	.dropdown-item.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background-color: #f9fafb;
	}

	.dropdown-item.disabled:hover {
		background-color: #f9fafb;
	}

	:global(.dropdown-chevron) {
		transition: transform 0.2s ease-in-out;
		color: #6b7280;
		flex-shrink: 0;
	}

	:global(.dropdown-chevron.rotated) {
		transform: rotate(180deg);
	}
</style>
