import type { Tables } from '../lib/types/database.types';

export interface FormattedOption {
	value: string;
	label: string;
}

export function filterOptionsForModel(
	options: Tables<'options'>[],
	model: Tables<'models'> | undefined
): Tables<'options'>[] {
	if (!model) return [];

	return options.filter((opt) => {
		const widthMatch = opt.for_widths === null || opt.for_widths.includes(model.width);
		const lengthMatch = opt.for_lengths === null || opt.for_lengths.includes(model.length);
		const axleMatch = opt.for_axle_value === null || opt.for_axle_value === model.axle_value;
		const mainframeMatch =
			opt.for_mainframe === null || opt.for_mainframe === model.standard_mainframe;

		return widthMatch && lengthMatch && axleMatch && mainframeMatch;
	});
}

export function formatOptions(options: Tables<'options'>[]): FormattedOption[] {
	return options.map((opt) => ({
		value: String(opt.id),
		label: `${opt.name} (+$${parseFloat(opt.cost || '0').toLocaleString()})`
	}));
}
