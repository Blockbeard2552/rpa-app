<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { models } = $derived(data);

	// Track editing states and values for each model
	let editingStates = $state<Record<string, boolean>>({});
	let editingValues = $state<Record<string, any>>({});

	function startEditing(model: any) {
		editingStates[model.id] = true;
		editingValues[model.id] = {
			mfgBaseCost: model.mfg_base_cost || 0,
			mfgSurcharge: model.mfg_surcharge || 0,
			dealerMarkup: model.dealer_mark_up || 0
		};
	}

	function cancelEditing(modelId: string) {
		editingStates[modelId] = false;
		delete editingValues[modelId];
	}

	function updateCalculations(modelId: string) {
		const values = editingValues[modelId];
		if (!values) return;

		const mfgBaseCost = parseFloat(values.mfgBaseCost) || 0;
		const mfgSurcharge = parseFloat(values.mfgSurcharge) || 0;
		const dealerMarkup = parseFloat(values.dealerMarkup) || 0;

		values.mfgTotalCost = mfgBaseCost + mfgSurcharge;
		values.startingPrice = values.mfgTotalCost + dealerMarkup;
	}

	function handleInputChange(modelId: string, field: string, event: Event) {
		const target = event.target as HTMLInputElement;
		if (!editingValues[modelId] || !target) return;
		editingValues[modelId][field] = target.value;
		updateCalculations(modelId);
	}

	function formatCurrency(value: number | null): string {
		if (value === null || value === undefined) return '$0';
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(value);
	}

	function formatDimensions(width: number, length: number): string {
		return `${width}' x ${length}'`;
	}
</script>

<div class="models-page">
	<div class="page-header">
		<h1>Model Management</h1>
		<p>Manage model pricing and specifications</p>
	</div>

	<div class="models-grid">
		{#each models as model (model.id)}
			<div class="model-card">
				<div class="model-header">
					<h3 class="model-title">
						{formatDimensions(model.width, model.length)}
						{model.axle}
						{model.hitch || ''}
					</h3>
					{#if !editingStates[model.id]}
						<button class="edit-btn" onclick={() => startEditing(model)}>Edit Pricing</button>
					{/if}
				</div>

				<div class="model-specs">
					<div class="spec-item">
						<span class="spec-label">Axle:</span>
						<span class="spec-value">{model.axle}</span>
					</div>
					<div class="spec-item">
						<span class="spec-label">Hitch:</span>
						<span class="spec-value">{model.hitch || 'N/A'}</span>
					</div>
				</div>

				{#if editingStates[model.id]}
					<form
						method="POST"
						action="?/updateModel"
						use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'success') {
									cancelEditing(model.id);
									// Invalidate and reload the data
									await invalidateAll();
								} else if (result.type === 'failure') {
									console.error('Form submission failed:', result.data);
									alert('Failed to update model: ' + (result.data?.error || 'Unknown error'));
								}
							};
						}}
					>
						<input type="hidden" name="modelId" value={model.id} />

						<div class="pricing-grid">
							<div class="pricing-section">
								<h4>Manufacturing Costs</h4>
								<div class="input-group">
									<label for="mfgBaseCost-{model.id}">Base Cost:</label>
									<input
										id="mfgBaseCost-{model.id}"
										name="mfgBaseCost"
										type="number"
										step="0.01"
										min="0"
										bind:value={editingValues[model.id].mfgBaseCost}
										oninput={(e) => handleInputChange(model.id, 'mfgBaseCost', e)}
									/>
								</div>
								<div class="input-group">
									<label for="mfgSurcharge-{model.id}">Surcharge:</label>
									<input
										id="mfgSurcharge-{model.id}"
										name="mfgSurcharge"
										type="number"
										step="0.01"
										min="0"
										bind:value={editingValues[model.id].mfgSurcharge}
										oninput={(e) => handleInputChange(model.id, 'mfgSurcharge', e)}
									/>
								</div>
								<div class="calculated-field">
									<span class="field-label">Total Mfg Cost:</span>
									<span class="field-value">
										{formatCurrency(editingValues[model.id].mfgTotalCost || 0)}
									</span>
								</div>
							</div>

							<div class="pricing-section">
								<h4>Dealer Pricing</h4>
								<div class="input-group">
									<label for="dealerMarkup-{model.id}">Dealer Markup:</label>
									<input
										id="dealerMarkup-{model.id}"
										name="dealerMarkup"
										type="number"
										step="0.01"
										min="0"
										bind:value={editingValues[model.id].dealerMarkup}
										oninput={(e) => handleInputChange(model.id, 'dealerMarkup', e)}
									/>
								</div>
								<div class="calculated-field">
									<span class="field-label">Starting Price:</span>
									<span class="field-value starting-price">
										{formatCurrency(editingValues[model.id].startingPrice || 0)}
									</span>
								</div>
							</div>
						</div>

						<div class="form-actions">
							<button type="submit" class="save-btn"> Save Changes </button>
							<button type="button" class="cancel-btn" onclick={() => cancelEditing(model.id)}>
								Cancel
							</button>
						</div>
					</form>
				{:else}
					<div class="pricing-display">
						<div class="pricing-row">
							<span class="label">Base Cost:</span>
							<span class="value">{formatCurrency(model.mfg_base_cost)}</span>
						</div>
						<div class="pricing-row">
							<span class="label">Surcharge:</span>
							<span class="value">{formatCurrency(model.mfg_surcharge)}</span>
						</div>
						<div class="pricing-row">
							<span class="label">Total Mfg Cost:</span>
							<span class="value">{formatCurrency(model.mfg_total_cost)}</span>
						</div>
						<div class="pricing-row">
							<span class="label">Dealer Markup:</span>
							<span class="value">{formatCurrency(model.dealer_mark_up)}</span>
						</div>
						<div class="pricing-row highlight">
							<span class="label">Starting Price:</span>
							<span class="value">{formatCurrency(model.starting_price)}</span>
						</div>
					</div>
				{/if}
			</div>
		{:else}
			<div class="no-models">
				<p>No models found.</p>
			</div>
		{/each}
	</div>
</div>

<style>
	.models-page {
		max-width: 1400px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.page-header h1 {
		font-size: 2rem;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 0.5rem 0;
	}

	.page-header p {
		color: #64748b;
		margin: 0;
	}

	.models-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
		gap: 1.5rem;
	}

	.model-card {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
	}

	.model-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.model-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0;
	}

	.edit-btn {
		background: #3b82f6;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.edit-btn:hover {
		background: #2563eb;
	}

	.model-specs {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
		padding: 1rem;
		background: #f8fafc;
		border-radius: 0.5rem;
	}

	.spec-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.spec-label {
		font-size: 0.75rem;
		color: #64748b;
		font-weight: 500;
	}

	.spec-value {
		font-weight: 600;
		color: #1e293b;
	}

	.pricing-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.pricing-section h4 {
		font-size: 1rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 1rem 0;
		border-bottom: 1px solid #e2e8f0;
		padding-bottom: 0.5rem;
	}

	.input-group {
		margin-bottom: 1rem;
	}

	.input-group label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.25rem;
	}

	.input-group input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}

	.input-group input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
	}

	.calculated-field {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background: #f1f5f9;
		border-radius: 0.375rem;
		margin-bottom: 0.5rem;
	}

	.field-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #475569;
	}

	.field-value {
		font-weight: 600;
		color: #1e293b;
	}

	.starting-price {
		color: #059669 !important;
		font-size: 1.125rem;
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
	}

	.save-btn {
		background: #059669;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 0.375rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.save-btn:hover {
		background: #047857;
	}

	.cancel-btn {
		background: #6b7280;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 0.375rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.cancel-btn:hover {
		background: #4b5563;
	}

	.pricing-display {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.pricing-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid #f1f5f9;
	}

	.pricing-row.highlight {
		background: #f0fdf4;
		padding: 0.75rem;
		border-radius: 0.375rem;
		border: 1px solid #bbf7d0;
		font-weight: 600;
	}

	.pricing-row .label {
		color: #64748b;
		font-size: 0.875rem;
	}

	.pricing-row .value {
		font-weight: 600;
		color: #1e293b;
	}

	.pricing-row.highlight .value {
		color: #059669;
		font-size: 1.125rem;
	}

	.no-models {
		grid-column: 1 / -1;
		text-align: center;
		padding: 3rem;
		color: #64748b;
	}

	@media (max-width: 768px) {
		.models-grid {
			grid-template-columns: 1fr;
		}

		.pricing-grid {
			grid-template-columns: 1fr;
		}

		.model-header {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.form-actions {
			flex-direction: column;
		}
	}
</style>
