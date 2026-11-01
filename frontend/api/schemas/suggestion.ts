interface AbridgedFoodNutrient {
    nutrientId: number;
    nutrientName: string;
    unitName: string;
    value: number;
  }
  
  interface SearchResultFood {
    fdcId?: number;
    dataType?: string;
    description?: string;
    foodCode?: number;
    foodNutrients?: AbridgedFoodNutrient[];
    publicationDate?: string;
    scientificName?: string;
    brandOwner?: string;
    gtinUpc?: string;
    ingredients?: string;
    ndbNumber?: number;
    additionalDescriptions?: string;
    allHighlightFields?: string;
    score?: number;
  }
  

  interface QuerySuggest {
    queryKey: string;
    action: string;
    text: string;
  }

  export type { SearchResultFood, QuerySuggest };