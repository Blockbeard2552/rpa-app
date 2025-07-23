<script lang="ts">
	import type { PageData } from './$types';
	import type { Tables } from '$components/types/database.types';
	import SingleSelect from '$components/form/SingleSelect.svelte';
	import MultiSelect from '$components/form/MultiSelect.svelte';
	import ModelSelect from '$components/form/ModelSelect.svelte';
	import Accordion from '$components/ui/Accordion.svelte';
	import { filterOptionsForModel } from '../../../utils/option-filters';
	import {
		calculateAllPricing,
		calculateOptionPrice,
		formatPriceDisplay,
		type PriceCalculationParams
	} from '../../../utils/price-calculator';

	export let data: PageData;

	let selectedModelId: string = '';
	let selectedModel: Tables<'models'> | undefined = undefined;
	let selectedOptions: Record<string, string | string[]> = {};
	let filteredOptions: Tables<'options'>[] = [];
	let optionDetails: Record<
		string,
		{
			color?: string;
			width?: string;
			height?: string;
			location?: string;
			quantity?: number;
		}
	> = {};

	// Customer and pricing information
	let customerName: string = '';
	let company: string = '';
	let customerEmail: string = '';
	let customerPhone: string = '';
	let customerAddress: string = '';
	let dealerMarkup: number = 0;
	let mileage: number = 0;
	let perMile: number = 2.0;
	let includeSalesTax: boolean = false;

	// Reactive statements
	$: selectedModel = data.models.find((m: Tables<'models'>) => m.id === selectedModelId);
	$: filteredOptions = filterOptionsForModel(data.options, selectedModel);
	$: groupedOptions = groupOptionsByCategory(filteredOptions);
	$: shippingCost = mileage * perMile;

	function handleModelChange(modelId: string) {
		selectedModelId = modelId;
		// Reset selected options when model changes
		selectedOptions = {};
		optionDetails = {};

		// Set dealer markup from selected model
		const model = data.models.find((m) => m.id === modelId);
		if (model && model.dealer_mark_up !== null) {
			dealerMarkup = model.dealer_mark_up;
		}
	}

	function handleOptionChange(subcategoryId: string, value: string | string[]) {
		selectedOptions[subcategoryId] = value;

		// Get the current option IDs for this subcategory
		const valueArray = Array.isArray(value) ? value : [value];
		const currentOptionIds = valueArray.filter((v) => v !== '');

		// Find options that were previously selected for this subcategory
		const subcategoryOptions = filteredOptions.filter((opt) => {
			// Find which subcategory this option belongs to
			const subcategory = data.categories
				.flatMap((cat: any) => cat.subcategories || [])
				.find((sub: any) => sub.id === opt.subcategory_id);
			return subcategory?.id === subcategoryId;
		});

		const previouslySelectedForSubcategory = subcategoryOptions
			.map((opt) => opt.id.toString())
			.filter((optionId) => optionDetails[optionId]);

		// Remove details only for options from this subcategory that are no longer selected
		previouslySelectedForSubcategory.forEach((optionId) => {
			if (!currentOptionIds.includes(optionId)) {
				delete optionDetails[optionId];
			}
		});

		// Initialize details for newly selected options
		currentOptionIds.forEach((optionId) => {
			if (!optionDetails[optionId]) {
				const option = filteredOptions.find((opt) => opt.id.toString() === optionId);
				optionDetails[optionId] = {};

				// Set default quantity based on cost_mod
				if (option?.cost_mod === 'Each' || option?.cost_mod === 'Per Foot') {
					optionDetails[optionId].quantity = 1;
				}
			}
		});
	}

	function handleOptionDetailChange(optionId: string, field: string, value: string | number) {
		if (!optionDetails[optionId]) {
			optionDetails[optionId] = {};
		}
		if (field === 'quantity') {
			optionDetails[optionId].quantity = value as number;
		} else {
			optionDetails[optionId][field as 'color' | 'width' | 'height' | 'location'] = value as string;
		}
	}

	function generateQuantityOptions(costMod: string | null): { value: string; label: string }[] {
		if (costMod === 'Each') {
			return Array.from({ length: 10 }, (_, i) => ({
				value: (i + 1).toString(),
				label: (i + 1).toString()
			}));
		} else if (costMod === 'Per Foot') {
			return Array.from({ length: 52 }, (_, i) => ({
				value: (i + 1).toString(),
				label: `${i + 1} ft`
			}));
		}
		return [];
	}

	function getSelectedOptionsForSubcategory(subcategoryId: string): Tables<'options'>[] {
		const values = selectedOptions[subcategoryId];
		if (!values) return [];

		const valueArray = Array.isArray(values) ? values : [values];
		return valueArray
			.filter((v) => v !== '')
			.map((v) => filteredOptions.find((opt) => opt.id.toString() === v))
			.filter(Boolean) as Tables<'options'>[];
	}

	function groupOptionsByCategory(options: Tables<'options'>[]) {
		const grouped: Record<
			string,
			{
				category: Tables<'categories'>;
				subcategories: Record<
					string,
					{ subcategory: Tables<'subcategories'>; options: Tables<'options'>[] }
				>;
			}
		> = {};

		for (const option of options) {
			// Find the subcategory for this option
			const subcategory = data.categories
				.flatMap((cat: any) => cat.subcategories || [])
				.find((sub: any) => sub.id === option.subcategory_id);

			if (!subcategory) continue;

			// Find the category for this subcategory
			const category = data.categories.find((cat: any) => cat.id === subcategory.category_id);

			if (!category) continue;

			if (!grouped[category.id]) {
				grouped[category.id] = {
					category,
					subcategories: {}
				};
			}

			if (!grouped[category.id].subcategories[subcategory.id]) {
				grouped[category.id].subcategories[subcategory.id] = {
					subcategory,
					options: []
				};
			}

			grouped[category.id].subcategories[subcategory.id].options.push(option);
		}

		return grouped;
	}

	function prepareSelectedOptions() {
		// Convert our selectedOptions format to the format expected by price calculator
		const singleSelections: Record<string, string> = {};
		const multipleSelections: Record<string, string[]> = {};

		Object.entries(selectedOptions).forEach(([subcategoryId, values]) => {
			if (Array.isArray(values)) {
				multipleSelections[subcategoryId] = values.filter((v) => v !== '');
			} else if (values !== '') {
				singleSelections[subcategoryId] = values;
			}
		});

		return { singleSelections, multipleSelections };
	}

	function prepareQuantities() {
		// Convert optionDetails quantities to the format expected by price calculator
		const quantities: Record<string, number> = {};

		Object.entries(optionDetails).forEach(([optionId, details]) => {
			if (details.quantity) {
				quantities[optionId] = details.quantity;
			}
		});

		return quantities;
	}

	function calculateOrderTotal(): number {
		if (!selectedModel) return 0;

		const { singleSelections, multipleSelections } = prepareSelectedOptions();
		const quantities = prepareQuantities();

		const params: PriceCalculationParams = {
			model: selectedModel,
			models: data.models,
			singleSelections,
			multipleSelections,
			quantities,
			categories: data.categories as any, // Type assertion for compatibility
			dealerMarkup,
			includeSalesTax,
			shippingCost,
			salesTaxRate: 0.085, // 8.5% sales tax rate
			depositRate: 0.1
		};

		const result = calculateAllPricing(params);
		return result.finalTotal;
	}

	// Calculate individual pricing components for display
	$: unitCost = selectedModel ? (selectedModel.mfg_total_cost || 0) + dealerMarkup : 0;
	$: optionsTotal = (() => {
		if (!selectedModel) return 0;

		let total = 0;
		const quantities = prepareQuantities();

		Object.entries(selectedOptions).forEach(([, values]) => {
			const valueArray = Array.isArray(values) ? values : [values];
			valueArray.forEach((value) => {
				const option = filteredOptions.find((opt) => opt.id.toString() === value);
				if (option) {
					const optionPrice = calculateOptionPrice(
						{
							cost: parseFloat(option.cost || '0'),
							cost_mod: option.cost_mod || '',
							id: option.id.toString()
						},
						selectedModel,
						quantities
					);
					total += optionPrice;
				}
			});
		});
		return total;
	})();
	$: selectedOptionsByCategory = Object.entries(selectedOptions).reduce(
		(
			acc: Record<
				string,
				{
					category: Tables<'categories'>;
					subcategories: Record<
						string,
						{
							subcategory: Tables<'subcategories'>;
							values: string[];
						}
					>;
				}
			>,
			[subcategoryId, values]
		) => {
			const subcategory = data.categories
				.flatMap((cat: any) => cat.subcategories || [])
				.find((sub: any) => sub.id === subcategoryId);

			if (!subcategory) return acc;

			const category = data.categories.find((cat: any) => cat.id === subcategory.category_id);
			if (!category) return acc;

			const valueArray = Array.isArray(values) ? values : [values];
			if (valueArray.length === 0 || valueArray[0] === '') return acc;

			if (!acc[category.id]) {
				acc[category.id] = {
					category,
					subcategories: {}
				};
			}

			acc[category.id].subcategories[subcategoryId] = {
				subcategory,
				values: valueArray
			};

			return acc;
		},
		{}
	);
	$: subtotal = unitCost + optionsTotal;
	$: salesTax = includeSalesTax ? (subtotal + shippingCost) * 0.08 : 0;
	$: orderTotal = subtotal + shippingCost + salesTax;
</script>

<svelte:head>
	<title>New Order - Admin</title>
</svelte:head>

<div class="new-order-container">
	<h1>Create New Order</h1>

	<div class="order-layout">
		<!-- Order Form - Left Side -->
		<div class="order-form">
			<div class="form-section">
				<h2>Model Selection</h2>
				<ModelSelect
					label="Select Model"
					models={data.models}
					value={selectedModelId}
					placeholder="Choose a model..."
					required
					on:change={(e) => handleModelChange(e.detail)}
				/>
			</div>

			{#if selectedModel}
				{#if Object.keys(groupedOptions).length > 0}
					<div class="form-section">
						<h2>Options & Accessories</h2>
						{#each Object.entries(groupedOptions) as [, categoryData]}
							<Accordion title={categoryData.category.name} isOpen={false}>
								{#each Object.entries(categoryData.subcategories) as [subcategoryId, subcategoryData]}
									<div class="subcategory-group">
										{#if subcategoryData.options.length > 0}
											{@const optionsList = subcategoryData.options.map((opt) => ({
												value: opt.id.toString(),
												label: `${opt.name} (+$${parseFloat(opt.cost || '0').toLocaleString()})`,
												note: opt.note
											}))}

											{#if subcategoryData.subcategory.multiple}
												<MultiSelect
													label={subcategoryData.subcategory.name}
													options={optionsList}
													values={Array.isArray(selectedOptions[subcategoryId])
														? selectedOptions[subcategoryId]
														: []}
													placeholder="Select options..."
													on:change={(e) => handleOptionChange(subcategoryId, e.detail)}
												/>
											{:else}
												<SingleSelect
													label={subcategoryData.subcategory.name}
													options={optionsList}
													value={typeof selectedOptions[subcategoryId] === 'string'
														? selectedOptions[subcategoryId]
														: ''}
													placeholder="Select an option..."
													on:change={(e) => handleOptionChange(subcategoryId, e.detail)}
												/>
											{/if}

											<!-- Additional inputs for selected options -->
											{@const selectedOptionsForSubcategory =
												getSelectedOptionsForSubcategory(subcategoryId)}
											{#each selectedOptionsForSubcategory as selectedOption}
												<div class="option-details">
													<h5 class="option-details-title">
														{selectedOption.name} - Additional Details
													</h5>

													<!-- Quantity/Measurement Selector -->
													{#if selectedOption.cost_mod === 'Each' || selectedOption.cost_mod === 'Per Foot'}
														<div class="detail-input">
															<SingleSelect
																label={selectedOption.cost_mod === 'Each' ? 'Quantity' : 'Length'}
																options={generateQuantityOptions(selectedOption.cost_mod)}
																value={optionDetails[
																	selectedOption.id.toString()
																]?.quantity?.toString() || '1'}
																placeholder="Select {selectedOption.cost_mod === 'Each'
																	? 'quantity'
																	: 'length'}..."
																on:change={(e) =>
																	handleOptionDetailChange(
																		selectedOption.id.toString(),
																		'quantity',
																		parseInt(e.detail)
																	)}
															/>
														</div>
													{/if}

													<!-- Color Options -->
													{#if selectedOption.color_options && selectedOption.color_options.length > 0}
														<div class="detail-input">
															<SingleSelect
																label="Color"
																options={selectedOption.color_options.map((color) => ({
																	value: color,
																	label: color
																}))}
																value={optionDetails[selectedOption.id.toString()]?.color || ''}
																placeholder="Select a color..."
																on:change={(e) =>
																	handleOptionDetailChange(
																		selectedOption.id.toString(),
																		'color',
																		e.detail
																	)}
															/>
														</div>
													{/if}

													<!-- Width Input -->
													{#if selectedOption.include_width}
														<div class="detail-input">
															<label class="input-label">
																Width
																<input
																	type="text"
																	class="text-input"
																	value={optionDetails[selectedOption.id.toString()]?.width || ''}
																	placeholder="Enter width..."
																	on:input={(e) =>
																		handleOptionDetailChange(
																			selectedOption.id.toString(),
																			'width',
																			e.currentTarget.value
																		)}
																/>
															</label>
														</div>
													{/if}

													<!-- Height Input -->
													{#if selectedOption.include_height}
														<div class="detail-input">
															<label class="input-label">
																Height
																<input
																	type="text"
																	class="text-input"
																	value={optionDetails[selectedOption.id.toString()]?.height || ''}
																	placeholder="Enter height..."
																	on:input={(e) =>
																		handleOptionDetailChange(
																			selectedOption.id.toString(),
																			'height',
																			e.currentTarget.value
																		)}
																/>
															</label>
														</div>
													{/if}

													<!-- Location Input -->
													{#if selectedOption.include_location}
														<div class="detail-input">
															<label class="input-label">
																Location
																<input
																	type="text"
																	class="text-input"
																	value={optionDetails[selectedOption.id.toString()]?.location ||
																		''}
																	placeholder="Enter location..."
																	on:input={(e) =>
																		handleOptionDetailChange(
																			selectedOption.id.toString(),
																			'location',
																			e.currentTarget.value
																		)}
																/>
															</label>
														</div>
													{/if}
												</div>
											{/each}
										{/if}
									</div>
								{/each}
							</Accordion>
						{/each}
					</div>
				{/if}
			{/if}
		</div>

		<!-- Customer Information & Pricing - Right Side -->
		<div class="right-column">
			<div class="customer-info-card">
				<h2>Customer Information</h2>
				<div class="form-grid">
					<div class="form-group">
						<label class="input-label">
							Customer Name
							<input
								type="text"
								class="text-input"
								bind:value={customerName}
								placeholder="Enter customer name..."
							/>
						</label>
					</div>

					<div class="form-group">
						<label class="input-label">
							Company
							<input
								type="text"
								class="text-input"
								bind:value={company}
								placeholder="Enter company name..."
							/>
						</label>
					</div>

					<div class="form-group">
						<label class="input-label">
							Customer Email
							<input
								type="email"
								class="text-input"
								bind:value={customerEmail}
								placeholder="Enter email address..."
							/>
						</label>
					</div>

					<div class="form-group">
						<label class="input-label">
							Customer Phone
							<input
								type="tel"
								class="text-input"
								bind:value={customerPhone}
								placeholder="Enter phone number..."
							/>
						</label>
					</div>

					<div class="form-group full-width">
						<label class="input-label">
							Customer Address
							<textarea
								class="text-input textarea"
								bind:value={customerAddress}
								placeholder="Enter customer address..."
								rows="3"
							></textarea>
						</label>
					</div>
				</div>

				<h3>Pricing Details</h3>
				<div class="form-grid">
					<div class="form-group">
						<label class="input-label">
							Dealer Markup ($)
							<input
								type="number"
								class="text-input"
								bind:value={dealerMarkup}
								placeholder="0.00"
								step="0.01"
								min="0"
							/>
						</label>
					</div>

					<div class="form-group">
						<label class="input-label">
							Mileage
							<input
								type="number"
								class="text-input"
								bind:value={mileage}
								placeholder="0"
								min="0"
							/>
						</label>
					</div>

					<div class="form-group">
						<label class="input-label">
							Per Mile ($)
							<input
								type="number"
								class="text-input"
								bind:value={perMile}
								placeholder="2.00"
								step="0.01"
								min="0"
							/>
						</label>
					</div>

					<div class="form-group">
						<label class="checkbox-label">
							<input type="checkbox" bind:checked={includeSalesTax} />
							Include Sales Tax
						</label>
					</div>
				</div>

				{#if mileage > 0}
					<div class="shipping-summary">
						<strong>Shipping Cost: ${shippingCost.toLocaleString()}</strong>
					</div>
				{/if}

				{#if selectedModel}
					<div class="unit-cost-summary">
						<div class="unit-cost-breakdown">
							<div class="cost-line">
								<span>Manufacturing Cost:</span>
								<span>${(selectedModel.mfg_total_cost || 0).toLocaleString()}</span>
							</div>
							<div class="cost-line">
								<span>Dealer Markup:</span>
								<span>+${dealerMarkup.toLocaleString()}</span>
							</div>
							<div class="cost-line total-line">
								<span><strong>Unit Cost:</strong></span>
								<span
									><strong
										>${(
											(selectedModel.mfg_total_cost || 0) + dealerMarkup
										).toLocaleString()}</strong
									></span
								>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Order Summary -->
			<div class="order-summary">
				<div class="summary-header">
					<img
						src="https://res.cloudinary.com/dz6c3v3tr/image/upload/v1735773584/navLogo_119x48_mbb5db.png"
						alt="Company Logo"
						class="h-12 w-auto"
					/>

					<h2>Order Summary</h2>
				</div>

				<!-- Customer Information in Summary -->
				{#if customerName || company || customerEmail || customerPhone || customerAddress}
					<div class="summary-section">
						<h3>Customer Information</h3>
						{#if customerName}
							<div class="customer-detail">
								<span class="detail-label">Name:</span>
								<span class="detail-value">{customerName}</span>
							</div>
						{/if}
						{#if company}
							<div class="customer-detail">
								<span class="detail-label">Company:</span>
								<span class="detail-value">{company}</span>
							</div>
						{/if}
						{#if customerEmail}
							<div class="customer-detail">
								<span class="detail-label">Email:</span>
								<span class="detail-value">{customerEmail}</span>
							</div>
						{/if}
						{#if customerPhone}
							<div class="customer-detail">
								<span class="detail-label">Phone:</span>
								<span class="detail-value">{customerPhone}</span>
							</div>
						{/if}
						{#if customerAddress}
							<div class="customer-detail">
								<span class="detail-label">Address:</span>
								<span class="detail-value address-text">{customerAddress}</span>
							</div>
						{/if}
					</div>
				{/if}

				{#if selectedModel}
					<div class="summary-section">
						<h3>Model</h3>
						<div class="summary-item">
							<span
								>Model {selectedModel.width}' x {selectedModel.length}' {selectedModel.axle}</span
							>
							<span
								>${parseFloat(
									selectedModel.starting_price?.toString() || '0'
								).toLocaleString()}</span
							>
						</div>
					</div>

					<div class="summary-section">
						<h3>Standard Features</h3>
						<div class="specs-grid">
							{#if selectedModel.height}
								<div class="spec-item">• Height: {selectedModel.height}</div>
							{/if}
							{#if selectedModel.standard_axle}
								<div class="spec-item">• Standard Axle: {selectedModel.standard_axle}</div>
							{/if}
							{#if selectedModel.standard_tires}
								<div class="spec-item">• Standard Tires: {selectedModel.standard_tires}</div>
							{/if}
							{#if selectedModel.hitch}
								<div class="spec-item">• Hitch: {selectedModel.hitch}</div>
							{/if}
							{#if selectedModel.standard_exterior_walls}
								<div class="spec-item">
									• Exterior Walls: {selectedModel.standard_exterior_walls}
								</div>
							{/if}
							{#if selectedModel.standard_mainframe}
								<div class="spec-item">• Mainframe: {selectedModel.standard_mainframe}</div>
							{/if}
							{#if selectedModel.standard_jack}
								<div class="spec-item">• Jack: {selectedModel.standard_jack}</div>
							{/if}
							{#if selectedModel.standard_features && selectedModel.standard_features.length > 0}
								{#each selectedModel.standard_features as feature}
									<div class="spec-item">• {feature}</div>
								{/each}
							{/if}
						</div>
					</div>

					{#if Object.keys(selectedOptions).length > 0}
						<div class="summary-section">
							<h3>Selected Options</h3>
							{#each Object.entries(selectedOptionsByCategory) as [, categoryData]}
								<div class="category-group">
									<h4 class="category-title">{categoryData.category.name}</h4>
									{#each Object.entries(categoryData.subcategories) as [, subcategoryData]}
										<div class="option-group">
											<h5 class="subcategory-title">{subcategoryData.subcategory.name}</h5>
											{#each subcategoryData.values as value}
												{@const option = filteredOptions.find((opt) => opt.id.toString() === value)}
												{#if option && selectedModel}
													{@const details = optionDetails[value]}
													{@const totalCost = calculateOptionPrice(
														{
															cost: parseFloat(option.cost || '0'),
															cost_mod: option.cost_mod || '',
															id: option.id.toString()
														},
														selectedModel,
														prepareQuantities()
													)}
													{@const priceDisplay = formatPriceDisplay(
														{
															cost: parseFloat(option.cost || '0'),
															cost_mod: option.cost_mod || '',
															id: option.id.toString()
														},
														selectedModel,
														prepareQuantities(),
														(amount) => amount.toLocaleString(),
														{
															each: 'each',
															perFoot: 'per foot',
															perAxle: 'per axle'
														}
													)}
													<div class="summary-item">
														<div class="summary-item-content">
															<div class="option-name-line">
																<span class="option-name">{option.name}</span>
																<!-- Show detailed pricing calculation for PLF and quantity-based items -->
																{#if option.cost_mod === 'PLF' || option.cost_mod === 'Per Axle' || (option.cost_mod === 'Each' && (details?.quantity || 1) > 1) || (option.cost_mod === 'Per Foot' && (details?.quantity || 1) > 1)}
																	<span class="pricing-calculation-inline"
																		>({priceDisplay.replace('$', '')})</span
																	>
																{/if}
																<span class="option-price">+${totalCost.toLocaleString()}</span>
															</div>

															<!-- Show option note if it exists -->
															{#if option.note && option.note.trim() !== ''}
																<div class="option-note">
																	<span class="note-text">{option.note}</span>
																</div>
															{/if}

															<!-- Additional Details -->
															{#if details && (details.color || details.width || details.height || details.location || (details.quantity && details.quantity > 1))}
																<div class="option-details-summary">
																	{#if option.cost_mod === 'Each' && details.quantity && details.quantity > 1}
																		<span class="detail-item">Qty: {details.quantity}</span>
																	{:else if option.cost_mod === 'Per Foot' && details.quantity && details.quantity > 1}
																		<span class="detail-item">Length: {details.quantity} ft</span>
																	{/if}

																	{#if details.color}
																		<span class="detail-item">Color: {details.color}</span>
																	{/if}

																	{#if details.width}
																		<span class="detail-item">Width: {details.width}</span>
																	{/if}

																	{#if details.height}
																		<span class="detail-item">Height: {details.height}</span>
																	{/if}

																	{#if details.location}
																		<span class="detail-item">Location: {details.location}</span>
																	{/if}
																</div>
															{/if}
														</div>
													</div>
												{/if}
											{/each}
										</div>
									{/each}
								</div>
							{/each}
						</div>
					{/if}

					<div class="pricing-breakdown">
						<h3>Pricing Summary</h3>

						<div class="pricing-line">
							<span>Subtotal (Unit Cost + Options):</span>
							<span>${subtotal.toLocaleString()}</span>
						</div>

						{#if shippingCost > 0}
							<div class="pricing-line">
								<span>Shipping ({mileage} miles @ ${perMile}/mile):</span>
								<span>${shippingCost.toLocaleString()}</span>
							</div>
						{/if}

						{#if includeSalesTax && salesTax > 0}
							<div class="pricing-line">
								<span>Sales Tax (8%):</span>
								<span>${salesTax.toLocaleString()}</span>
							</div>
						{/if}

						<div class="pricing-line total-line">
							<span><strong>Total:</strong></span>
							<span><strong>${orderTotal.toLocaleString()}</strong></span>
						</div>
					</div>

					<div class="summary-actions">
						<button type="button" class="btn-primary">Create Order</button>
					</div>
				{:else}
					<p class="no-selection">Select a model to see order summary</p>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.new-order-container {
		padding: 2rem;
		max-width: 2000px;
		margin: 0 auto;
	}

	.new-order-container h1 {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 2rem;
		color: #111827;
	}

	.order-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		align-items: start;
	}

	.right-column {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.order-form {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.form-section {
		background: white;
		padding: 1.5rem;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
	}

	.form-section h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #111827;
	}

	.subcategory-group {
		margin-bottom: 1.5rem;
	}

	.subcategory-group:last-child {
		margin-bottom: 0;
	}

	.option-details {
		margin-top: 1rem;
		padding: 1rem;
		background-color: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
	}

	.option-details-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		margin: 0 0 1rem 0;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.detail-input {
		margin-bottom: 1rem;
	}

	.detail-input:last-child {
		margin-bottom: 0;
	}

	.input-label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-weight: 500;
		color: #374151;
		font-size: 0.875rem;
	}

	.text-input {
		width: 100%;
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
		box-sizing: border-box;
	}

	.text-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.text-input::placeholder {
		color: #9ca3af;
		font-size: 0.875rem;
	}

	.customer-info-card {
		background: white;
		padding: 1.5rem;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
		width: 100%;
		box-sizing: border-box;
		overflow: hidden;
	}

	.customer-info-card h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #111827;
	}

	.customer-info-card h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 1.5rem 0 1rem 0;
		color: #111827;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		width: 100%;
		box-sizing: border-box;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		min-width: 0;
		width: 100%;
		box-sizing: border-box;
	}

	.form-group.full-width {
		grid-column: 1 / -1;
	}

	.textarea {
		resize: vertical;
		font-family: inherit;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 500;
		color: #374151;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.checkbox-label input[type='checkbox'] {
		width: 1rem;
		height: 1rem;
		cursor: pointer;
	}

	.shipping-summary {
		margin-top: 1rem;
		padding: 1rem;
		background-color: #f0f9ff;
		border: 1px solid #0ea5e9;
		border-radius: 0.375rem;
		text-align: center;
		color: #0c4a6e;
	}

	.unit-cost-summary {
		margin-top: 1rem;
		padding: 1rem;
		background-color: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
	}

	.unit-cost-breakdown {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.cost-line {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.875rem;
		color: #374151;
	}

	.cost-line.total-line {
		margin-top: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid #d1d5db;
		font-size: 1rem;
		color: #111827;
	}

	.order-summary {
		background: white;
		padding: 1.5rem;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
	}

	.summary-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.order-summary h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #111827;
	}

	.summary-section {
		margin-bottom: 0.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #f3f4f6;
	}

	.summary-section:last-of-type {
		border-bottom: none;
	}

	.summary-section h3 {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
		color: #374151;
	}

	.category-group {
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #f3f4f6;
	}

	.category-group:last-child {
		border-bottom: none;
		margin-bottom: 0;
	}

	.category-title {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #374151;
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 0.5rem;
	}

	.subcategory-title {
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: 0.5rem;
		color: #6b7280;
	}

	.specs-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.spec-item {
		color: #374151;
		line-height: 1.5;
	}

	.summary-item {
		margin-bottom: 0.75rem;
		font-size: 0.875rem;
	}

	.summary-item:last-child {
		margin-bottom: 0;
	}

	.summary-item-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.option-name-line {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.option-name {
		font-weight: 500;
		color: #374151;
		flex: 1;
	}

	.pricing-calculation-inline {
		font-size: 0.75rem;
		color: #059669;
		font-weight: 500;
		font-family: 'Monaco', 'Courier New', monospace;
		margin-left: auto;
		margin-right: 0.5rem;
	}

	.option-price {
		color: #374151;
		font-weight: 500;
		flex-shrink: 0;
	}

	.option-details-summary {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-left: 0.5rem;
	}

	.detail-item {
		font-size: 0.75rem;
		color: #6b7280;
		background-color: #f3f4f6;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-weight: 500;
	}

	.option-note {
		margin-top: 0.25rem;
		padding-left: 0.5rem;
	}

	.note-text {
		font-size: 0.75rem;
		color: #6b7280;
		font-style: italic;
		line-height: 1.4;
	}

	.customer-detail {
		display: flex;
		margin-bottom: 0.5rem;
		align-items: flex-start;
		font-size: 0.875rem;
	}

	.customer-detail:last-child {
		margin-bottom: 0;
	}

	.detail-label {
		font-weight: 500;
		color: #6b7280;
		min-width: 4rem;
		margin-right: 0.5rem;
		flex-shrink: 0;
	}

	.detail-value {
		color: #374151;
		flex: 1;
		word-break: break-word;
	}

	.address-text {
		white-space: pre-wrap;
		line-height: 1.4;
	}

	.pricing-breakdown {
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 2px solid #e5e7eb;
	}

	.pricing-breakdown h3 {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #374151;
	}

	.pricing-line {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
		font-size: 0.875rem;
		color: #374151;
	}

	.pricing-line:last-child {
		margin-bottom: 0;
	}

	.pricing-line.total-line {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #d1d5db;
		font-size: 1.125rem;
		color: #111827;
	}

	.summary-actions {
		margin-top: 1.5rem;
	}

	.btn-primary {
		width: 100%;
		background-color: #3b82f6;
		color: white;
		border: none;
		padding: 0.75rem 1rem;
		border-radius: 0.375rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.15s ease-in-out;
	}

	.btn-primary:hover {
		background-color: #2563eb;
	}

	.no-selection {
		color: #6b7280;
		font-style: italic;
		text-align: center;
		padding: 2rem 0;
	}

	@media (max-width: 1024px) {
		.order-layout {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.form-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 768px) {
		.new-order-container {
			padding: 1rem;
		}

		.form-section,
		.order-summary {
			padding: 1rem;
		}
	}
</style>
