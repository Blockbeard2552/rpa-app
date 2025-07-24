import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: models, error } = await supabase
		.from('models')
		.select('*')
		.order('width', { ascending: true })
		.order('length', { ascending: true });

	if (error) {
		console.error('Error fetching models:', error);
		return {
			models: []
		};
	}

	return {
		models: models || []
	};
};

export const actions: Actions = {
	updateModel: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const modelId = formData.get('modelId') as string;
		const mfgBaseCost = parseFloat(formData.get('mfgBaseCost') as string) || 0;
		const mfgSurcharge = parseFloat(formData.get('mfgSurcharge') as string) || 0;
		const dealerMarkup = parseFloat(formData.get('dealerMarkup') as string) || 0;

		// Calculate derived values
		const mfgTotalCost = mfgBaseCost + mfgSurcharge;
		const startingPrice = mfgTotalCost + dealerMarkup;

		console.log('Updating model:', modelId, {
			mfgBaseCost,
			mfgSurcharge,
			mfgTotalCost,
			dealerMarkup,
			startingPrice
		});

		const { data, error } = await supabase
			.from('models')
			.update({
				mfg_base_cost: mfgBaseCost,
				mfg_surcharge: mfgSurcharge,
				mfg_total_cost: mfgTotalCost,
				dealer_mark_up: dealerMarkup,
				starting_price: startingPrice
			})
			.eq('id', modelId)
			.select();

		console.log('Update result:', { data, error });

		if (error) {
			console.error('Error updating model:', error);
			return fail(400, {
				error: 'Failed to update model: ' + error.message
			});
		}

		if (!data || data.length === 0) {
			console.error('No rows affected - possible permission issue');
			return fail(400, {
				error: 'Update failed - no rows affected. Check permissions.'
			});
		}

		return {
			success: true
		};
	}
};
