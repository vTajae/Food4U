export interface ProfileAttributeSchema {
    id: number;
    attribute_category: string;
    attribute_name: string;
    attribute_value: string;
    notes?: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface DietTypeSchema {
    diet_name: string;
    description?: string | null;
}

export interface ProfileDietSchema {
    diet_type: DietTypeSchema;
}

export interface ProfileSchema {
    id: number;
    age?: number | null;
    ethnicity?: string | null;
    location?: string | null;
    created_at: Date;
    updated_at: Date;
    attributes: ProfileAttributeSchema[];
    diets: ProfileDietSchema[];
}


