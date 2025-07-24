/* src/utils/price-calculator.ts */

import type { Tables } from '../lib/types/database.types';

export type Option = Tables<'options'>;
export type Subcategory = Tables<'subcategories'> & { options: Option[] };
export type Category = Tables<'categories'> & { subcategories: Subcategory[] };

export interface PriceCalculationResult {
	unitCost: number;
	subtotal: number;
	salesTax: number;
	finalTotal: number;
	depositAmount: number;
	selectedOptions: Array<{
		id: string;
		name: string;
		cost: number;
		cost_mod: string;
		note: string;
		category: string;
		subcategory: string;
	}>;
	porchInfo: {
		hasPorch: boolean;
		porchLength: number;
	};
	boxLength: number;
}

export interface PriceCalculationParams {
	model: Tables<'models'> | undefined;
	models: Tables<'models'>[];
	singleSelections: Record<string, string>;
	multipleSelections: Record<string, string[]>;
	quantities: Record<string, number>;
	categories: Category[];
	dealerMarkup: number;
	includeSalesTax: boolean;
	shippingCost: number;
	salesTaxRate?: number;
	depositRate?: number;
}

export function calculateAllPricing(params: PriceCalculationParams): PriceCalculationResult {
	const {
		model,
		models,
		singleSelections,
		multipleSelections,
		quantities,
		categories,
		dealerMarkup,
		includeSalesTax,
		shippingCost,
		salesTaxRate = 0.08,
		depositRate = 0.1
	} = params;

	if (!model) {
		return {
			unitCost: 0,
			subtotal: 0,
			salesTax: 0,
			finalTotal: 0,
			depositAmount: 0,
			selectedOptions: [],
			porchInfo: { hasPorch: false, porchLength: 0 },
			boxLength: 0
		};
	}

	// Calculate porch info
	const porchInfo = calculatePorchInfo(singleSelections, multipleSelections, quantities);

	// Calculate box length
	const boxLength = calculateBoxLength(model, porchInfo);

	// Calculate unit cost
	const unitCost = calculateUnitCost(model, models, porchInfo, dealerMarkup);

	// Get selected options
	const selectedOptions = getSelectedOptions(singleSelections, multipleSelections, categories);

	// Calculate subtotal
	const subtotal = calculateSubtotal(model, selectedOptions, quantities, unitCost);

	// Calculate sales tax
	const salesTax = includeSalesTax ? Math.round(subtotal * salesTaxRate) : 0;

	// Calculate final total
	const finalTotal = subtotal + salesTax + shippingCost;

	// Calculate deposit amount
	const depositAmount = Math.round(finalTotal * depositRate);

	return {
		unitCost,
		subtotal,
		salesTax,
		finalTotal,
		depositAmount,
		selectedOptions,
		porchInfo,
		boxLength
	};
}

export function calculatePorchInfo(
	singleSelections: Record<string, string>,
	multipleSelections: Record<string, string[]>,
	quantities: Record<string, number>
): { hasPorch: boolean; porchLength: number } {
	let porchLength = 0;
	let hasPorch = false;

	// Check single selections for porch (ID 230)
	Object.values(singleSelections).forEach((selectedId) => {
		if (selectedId === '230') {
			hasPorch = true;
			porchLength = quantities[selectedId] || 0;
		}
	});

	// Check multiple selections for porch (ID 230)
	Object.values(multipleSelections).forEach((selectedIds) => {
		if (selectedIds?.length > 0) {
			selectedIds.forEach((selectedId) => {
				if (selectedId === '230') {
					hasPorch = true;
					porchLength += quantities[selectedId] || 0;
				}
			});
		}
	});

	return { hasPorch, porchLength };
}

export function calculateBoxLength(
	model: Tables<'models'>,
	porchInfo: { hasPorch: boolean; porchLength: number }
): number {
	const { hasPorch, porchLength } = porchInfo;

	if (hasPorch && porchLength > 0) {
		return model.length - porchLength;
	}

	return model.length;
}

export function calculateUnitCost(
	model: Tables<'models'>,
	models: Tables<'models'>[],
	porchInfo: { hasPorch: boolean; porchLength: number },
	dealerMarkup: number
): number {
	const { hasPorch, porchLength } = porchInfo;

	let mfgBaseCost = Number(model.mfg_base_cost) || 0;
	const mfgSurcharge = Number(model.mfg_surcharge) || 0;

	// If porch is selected, find the model with the box length
	if (hasPorch && porchLength > 0) {
		const boxLength = model.length - porchLength;

		// Find a model with same width/axle but box length
		const boxModel = models.find(
			(m: Tables<'models'>) =>
				m.width === model.width && m.axle === model.axle && m.length === boxLength
		);

		if (boxModel) {
			mfgBaseCost = Number(boxModel.mfg_base_cost) || 0;
		}
		// If no matching box model found, use original (fallback)
	}

	return mfgBaseCost + mfgSurcharge + dealerMarkup;
}

export function getSelectedOptions(
	singleSelections: Record<string, string>,
	multipleSelections: Record<string, string[]>,
	categories: Category[]
): Array<{
	id: string;
	name: string;
	cost: number;
	cost_mod: string;
	note: string;
	category: string;
	subcategory: string;
}> {
	const options: Array<{
		id: string;
		name: string;
		cost: number;
		cost_mod: string;
		note: string;
		category: string;
		subcategory: string;
	}> = [];

	// Add single selections
	Object.entries(singleSelections).forEach(([, selectedId]) => {
		if (selectedId) {
			const option = findOptionById(selectedId, categories);
			const categoryInfo = findCategoryInfoForOption(selectedId, categories);
			if (option && categoryInfo) {
				options.push({
					id: selectedId,
					name: option.name,
					cost: Number(option.cost),
					cost_mod: option.cost_mod || '',
					note: option.note || '',
					category: categoryInfo.categoryName,
					subcategory: categoryInfo.subcategoryName
				});
			}
		}
	});

	// Add multiple selections
	Object.entries(multipleSelections).forEach(([, selectedIds]) => {
		if (selectedIds?.length > 0) {
			selectedIds.forEach((selectedId) => {
				const option = findOptionById(selectedId, categories);
				const categoryInfo = findCategoryInfoForOption(selectedId, categories);
				if (option && categoryInfo) {
					options.push({
						id: selectedId,
						name: option.name,
						cost: Number(option.cost),
						cost_mod: option.cost_mod || '',
						note: option.note || '',
						category: categoryInfo.categoryName,
						subcategory: categoryInfo.subcategoryName
					});
				}
			});
		}
	});

	return options;
}

export function calculateSubtotal(
	model: Tables<'models'>,
	selectedOptions: Array<{
		id: string;
		name: string;
		cost: number;
		cost_mod: string;
		note: string;
		category: string;
		subcategory: string;
	}>,
	quantities: Record<string, number>,
	unitCost: number
): number {
	let total = unitCost; // Start with calculated base price

	// Add costs from all selected options
	selectedOptions.forEach((option) => {
		const quantity = quantities[option.id] || 1;
		const cost = option.cost || 0;

		if (option.cost_mod === 'Each' || option.cost_mod === 'Per Foot') {
			total += cost * quantity;
		} else if (option.cost_mod === 'PLF') {
			total += cost * model.length;
		} else if (option.cost_mod === 'Per Axle') {
			total += cost * model.axle_value;
		} else {
			total += cost;
		}
	});

	return total;
}

export function calculateOptionPrice(
	option: { cost: number; cost_mod: string; id: string },
	model: Tables<'models'>,
	quantities: Record<string, number>
): number {
	const baseCost = Number(option.cost) || 0;
	const quantity = quantities[option.id] || 1;
	const costMod = option.cost_mod || '';

	if (costMod === 'Each' || costMod === 'Per Foot') {
		return baseCost * quantity;
	} else if (costMod === 'PLF') {
		return baseCost * model.length;
	} else if (costMod === 'Per Axle') {
		return baseCost * model.axle_value;
	} else {
		// Default case - just the base cost
		return baseCost;
	}
}

export function formatPriceDisplay(
	option: { cost: number; cost_mod: string; id: string },
	model: Tables<'models'>,
	quantities: Record<string, number>,
	formatCurrency: (amount: number) => string,
	translations: { each: string; perFoot: string; perAxle: string }
): string {
	const baseCost = Number(option.cost) || 0;
	const quantity = quantities[option.id] || 1;
	const costMod = option.cost_mod || '';
	const totalPrice = calculateOptionPrice(option, model, quantities);

	if (costMod === 'Each' && quantity > 1) {
		return `${formatCurrency(baseCost)} ${translations.each} × ${quantity} = ${formatCurrency(totalPrice)}`;
	} else if (costMod === 'Per Foot' && quantity > 1) {
		return `${formatCurrency(baseCost)} ${translations.perFoot} × ${quantity} ft = ${formatCurrency(totalPrice)}`;
	} else if (costMod === 'PLF') {
		return `${formatCurrency(baseCost)} PLF × ${model.length}' = ${formatCurrency(totalPrice)}`;
	} else if (costMod === 'Per Axle') {
		return `${formatCurrency(baseCost)} ${translations.perAxle} × ${model.axle_value} = ${formatCurrency(totalPrice)}`;
	} else {
		return formatCurrency(totalPrice);
	}
}

// Legacy function for backward compatibility
export function calculateTotalPrice(
	model: Tables<'models'> | undefined,
	singleSelections: Record<string, string>,
	multipleSelections: Record<string, string[]>,
	categories: Category[]
): number {
	if (!model) return 0;

	let total = Number(model.starting_price) || 0;

	// Add costs from single selections
	Object.values(singleSelections).forEach((selectedId) => {
		if (selectedId) {
			const option = findOptionById(selectedId, categories);
			if (option) {
				total += Number(option.cost) || 0;
			}
		}
	});

	// Add costs from multiple selections
	Object.values(multipleSelections).forEach((selectedIds) => {
		if (selectedIds?.length > 0) {
			selectedIds.forEach((selectedId) => {
				const option = findOptionById(selectedId, categories);
				if (option) {
					total += Number(option.cost) || 0;
				}
			});
		}
	});

	return total;
}

// Helper functions
export function findOptionById(id: string, categories: Category[]): Tables<'options'> | undefined {
	for (const cat of categories) {
		for (const sub of cat.subcategories) {
			const option = sub.options.find((opt: Tables<'options'>) => String(opt.id) === id);
			if (option) return option;
		}
	}
	return undefined;
}

export function findCategoryInfoForOption(
	id: string,
	categories: Category[]
): { categoryName: string; subcategoryName: string } | undefined {
	for (const cat of categories) {
		for (const sub of cat.subcategories) {
			const option = sub.options.find((opt: Tables<'options'>) => String(opt.id) === id);
			if (option) {
				return {
					categoryName: cat.name,
					subcategoryName: sub.name
				};
			}
		}
	}
	return undefined;
}
