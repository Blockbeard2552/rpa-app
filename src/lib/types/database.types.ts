export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	// Allows to automatically instanciate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: '12.2.3 (519615d)';
	};
	public: {
		Tables: {
			categories: {
				Row: {
					created_at: string;
					id: string;
					name: string;
					note: string | null;
				};
				Insert: {
					created_at?: string;
					id?: string;
					name: string;
					note?: string | null;
				};
				Update: {
					created_at?: string;
					id?: string;
					name?: string;
					note?: string | null;
				};
				Relationships: [];
			};
			estimates: {
				Row: {
					company: string | null;
					created_at: string;
					customer_address: string | null;
					customer_email: string | null;
					customer_name: string | null;
					customer_phone: string | null;
					deposit_amount: number;
					estimate_number: string;
					expires_at: string;
					final_total: number;
					id: number;
					model_data: Json;
					model_id: string;
					pricing_data: Json;
					sales_tax: number | null;
					selected_options: Json;
					shipping_cost: number | null;
					status: string | null;
					subtotal: number;
					user_id: string | null;
				};
				Insert: {
					company?: string | null;
					created_at?: string;
					customer_address?: string | null;
					customer_email?: string | null;
					customer_name?: string | null;
					customer_phone?: string | null;
					deposit_amount: number;
					estimate_number: string;
					expires_at: string;
					final_total: number;
					id?: number;
					model_data: Json;
					model_id: string;
					pricing_data: Json;
					sales_tax?: number | null;
					selected_options: Json;
					shipping_cost?: number | null;
					status?: string | null;
					subtotal: number;
					user_id?: string | null;
				};
				Update: {
					company?: string | null;
					created_at?: string;
					customer_address?: string | null;
					customer_email?: string | null;
					customer_name?: string | null;
					customer_phone?: string | null;
					deposit_amount?: number;
					estimate_number?: string;
					expires_at?: string;
					final_total?: number;
					id?: number;
					model_data?: Json;
					model_id?: string;
					pricing_data?: Json;
					sales_tax?: number | null;
					selected_options?: Json;
					shipping_cost?: number | null;
					status?: string | null;
					subtotal?: number;
					user_id?: string | null;
				};
				Relationships: [];
			};
			models: {
				Row: {
					axle: string;
					axle_value: number;
					created_at: string;
					dealer_mark_up: number | null;
					height: string;
					hitch: string | null;
					id: string;
					length: number;
					mfg_base_cost: number | null;
					mfg_surcharge: number | null;
					mfg_total_cost: number;
					standard_axle: string;
					standard_axle_load: string;
					standard_exterior_walls: string;
					standard_features: string[] | null;
					standard_jack: string;
					standard_mainframe: string;
					standard_tires: string;
					starting_price: number | null;
					width: number;
				};
				Insert: {
					axle: string;
					axle_value: number;
					created_at?: string;
					dealer_mark_up?: number | null;
					height: string;
					hitch?: string | null;
					id?: string;
					length: number;
					mfg_base_cost?: number | null;
					mfg_surcharge?: number | null;
					mfg_total_cost: number;
					standard_axle: string;
					standard_axle_load: string;
					standard_exterior_walls: string;
					standard_features?: string[] | null;
					standard_jack: string;
					standard_mainframe: string;
					standard_tires: string;
					starting_price?: number | null;
					width: number;
				};
				Update: {
					axle?: string;
					axle_value?: number;
					created_at?: string;
					dealer_mark_up?: number | null;
					height?: string;
					hitch?: string | null;
					id?: string;
					length?: number;
					mfg_base_cost?: number | null;
					mfg_surcharge?: number | null;
					mfg_total_cost?: number;
					standard_axle?: string;
					standard_axle_load?: string;
					standard_exterior_walls?: string;
					standard_features?: string[] | null;
					standard_jack?: string;
					standard_mainframe?: string;
					standard_tires?: string;
					starting_price?: number | null;
					width?: number;
				};
				Relationships: [];
			};
			options: {
				Row: {
					color_options: string[] | null;
					cost: string;
					cost_mod: string | null;
					created_at: string;
					for_axle_load: string | null;
					for_axle_value: number | null;
					for_lengths: number[] | null;
					for_mainframe: string | null;
					for_widths: number[] | null;
					hitch: string | null;
					id: number;
					include_height: boolean | null;
					include_location: boolean | null;
					include_width: boolean | null;
					must_include: number | null;
					must_upgrade: string | null;
					name: string;
					name_es: string | null;
					note: string | null;
					note_es: string | null;
					recommend_for_length: number[] | null;
					subcategory_id: string;
				};
				Insert: {
					color_options?: string[] | null;
					cost: string;
					cost_mod?: string | null;
					created_at?: string;
					for_axle_load?: string | null;
					for_axle_value?: number | null;
					for_lengths?: number[] | null;
					for_mainframe?: string | null;
					for_widths?: number[] | null;
					hitch?: string | null;
					id?: number;
					include_height?: boolean | null;
					include_location?: boolean | null;
					include_width?: boolean | null;
					must_include?: number | null;
					must_upgrade?: string | null;
					name: string;
					name_es?: string | null;
					note?: string | null;
					note_es?: string | null;
					recommend_for_length?: number[] | null;
					subcategory_id?: string;
				};
				Update: {
					color_options?: string[] | null;
					cost?: string;
					cost_mod?: string | null;
					created_at?: string;
					for_axle_load?: string | null;
					for_axle_value?: number | null;
					for_lengths?: number[] | null;
					for_mainframe?: string | null;
					for_widths?: number[] | null;
					hitch?: string | null;
					id?: number;
					include_height?: boolean | null;
					include_location?: boolean | null;
					include_width?: boolean | null;
					must_include?: number | null;
					must_upgrade?: string | null;
					name?: string;
					name_es?: string | null;
					note?: string | null;
					note_es?: string | null;
					recommend_for_length?: number[] | null;
					subcategory_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'options_subcategory_id_fkey';
						columns: ['subcategory_id'];
						isOneToOne: false;
						referencedRelation: 'subcategories';
						referencedColumns: ['id'];
					}
				];
			};
			orders: {
				Row: {
					created_at: string;
					delivery_charge: number | null;
					id: number;
					model: string;
					options: string | null;
					order_closed_on: string | null;
					sales_tax: number | null;
					started_processing_on: string | null;
					sub_total: number;
					total: number;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					delivery_charge?: number | null;
					id?: number;
					model: string;
					options?: string | null;
					order_closed_on?: string | null;
					sales_tax?: number | null;
					started_processing_on?: string | null;
					sub_total: number;
					total: number;
					user_id?: string;
				};
				Update: {
					created_at?: string;
					delivery_charge?: number | null;
					id?: number;
					model?: string;
					options?: string | null;
					order_closed_on?: string | null;
					sales_tax?: number | null;
					started_processing_on?: string | null;
					sub_total?: number;
					total?: number;
					user_id?: string;
				};
				Relationships: [];
			};
			subcategories: {
				Row: {
					category_id: string;
					created_at: string;
					id: string;
					multiple: boolean;
					name: string;
				};
				Insert: {
					category_id?: string;
					created_at?: string;
					id?: string;
					multiple: boolean;
					name: string;
				};
				Update: {
					category_id?: string;
					created_at?: string;
					id?: string;
					multiple?: boolean;
					name?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'subcategories_category_id_fkey';
						columns: ['category_id'];
						isOneToOne: false;
						referencedRelation: 'categories';
						referencedColumns: ['id'];
					}
				];
			};
			user_names: {
				Row: {
					created_at: string;
					id: number;
					name: string | null;
					user_id: string | null;
				};
				Insert: {
					created_at?: string;
					id?: number;
					name?: string | null;
					user_id?: string | null;
				};
				Update: {
					created_at?: string;
					id?: number;
					name?: string | null;
					user_id?: string | null;
				};
				Relationships: [];
			};
			user_roles: {
				Row: {
					id: number;
					role: Database['public']['Enums']['app_role'];
					user_id: string;
				};
				Insert: {
					id?: number;
					role: Database['public']['Enums']['app_role'];
					user_id: string;
				};
				Update: {
					id?: number;
					role?: Database['public']['Enums']['app_role'];
					user_id?: string;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			app_role: 'admin' | 'moderator';
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema['Enums']
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
		: never = never
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
		? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema['CompositeTypes']
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
		? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	public: {
		Enums: {
			app_role: ['admin', 'moderator']
		}
	}
} as const;
