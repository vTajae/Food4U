function parseAutocompleteData(data: any[]): AutocompleteResult[] {
    const codes = data[1];  // The list of codes
    const descriptions = data[3];  // The list of corresponding descriptions
  
    if (!codes || !descriptions) {
      return [];
    }
  
    return codes.map((code: string, index: number) => ({
      code,
      description: descriptions[index][0]  // Descriptions are inside nested arrays
    }));
  }