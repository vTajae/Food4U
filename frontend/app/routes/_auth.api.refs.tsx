// api/refs.ts
import { LoaderFunction, json } from '@remix-run/cloudflare';
import { ClinicalService } from '../../api/services/clinicalService';
import AutoCompleteData from '../context/refs/allergies.json';
import { Suggestion } from '../../api/interfaces/refs';

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('query');
  const type = url.searchParams.get('type');


  // console.log('Query:', query);
  // console.log('Type:', type);


  if (!query || !type) {
    return json({ suggestions: [] });
  }

  if (type === 'icd10cm') {
    // Fetch from ClinicalService
    try {
      const suggestions = await ClinicalService.autocompleter(query, 10, 'conditions');

      if (!suggestions || suggestions.length === 0) {
        return json({ suggestions: [] });
      }

      return json({ suggestions: suggestions });
    } catch (error) {
      console.error('Error fetching medical codes:', error);
      return json({ suggestions: [], error: 'Error fetching medical codes' }, { status: 500 });
    }
  }
  else    if (type === 'conditions') {
    // Fetch from ClinicalService
    try {
      const suggestions = await ClinicalService.autocompleter(query, 10, 'conditions');

      if (!suggestions || suggestions.length === 0) {
        return json({ suggestions: [] });
      }

      return json({ suggestions: suggestions });
    } catch (error) {
      console.error('Error fetching medical codes:', error);
      return json({ suggestions: [], error: 'Error fetching medical codes' }, { status: 500 });
    }
  }
  
  else {
    // Handle other types by fetching from AutoCompleteData

    // Transform the JSON data into the expected structure
    const autocompleteData = AutoCompleteData.autocomplete;
    const allSuggestions: Record<string, Suggestion[]> = {};

    for (const [key, values] of Object.entries(autocompleteData)) {
      allSuggestions[key] = values.map((value) => ({
        name: typeof value === 'string' ? value : value.name,
      }));
    }

    const suggestions = allSuggestions[type] || [];

    const filteredSuggestions = suggestions.filter((s) =>
      s.name.toLowerCase().includes(query.toLowerCase())
    );

    return json({ suggestions: filteredSuggestions });
  }
};
