// Define the base URL for the API
const BASE_URL = "https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search";

// Define the types for the response structure
interface Icd10Result {
  code: string;
  name: string;
}

interface Icd10Response {
  metadata: any[];
  header: string[];
  results: (string | number)[][];
}

/**
 * Searches the ICD-10-CM database using the provided query.
 * 
 * @param query - The search term (ICD-10 code or name).
 * @param searchFields - Fields to search (default is "code,name").
 * @param displayFields - Fields to display in the response (default is "code,name").
 * @param maxResults - Maximum number of results to return (default is 50).
 * @returns - A promise that resolves to an array of Icd10Result objects or null if no results.
 */
export async function searchIcd10(
  query: string,
  searchFields: string = "code,name",
  displayFields: string = "code,name",
  maxResults: number = 50
): Promise<Icd10Result[] | null> {
  const params = new URLSearchParams({
    sf: searchFields,
    df: displayFields,
    terms: query,
    maxList: maxResults.toString(),
  });

  try {
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching ICD-10 data: ${response.statusText}`);
    }

    const data: Icd10Response = await response.json();
    const results = data.results;

    if (!results || results.length === 0) {
      console.log("No results found for query:", query);
      return null;
    }

    // Process the results and map them to a list of Icd10Result objects
    return results.map((result) =>
      data.header.reduce(
        (acc, header, index) => {
          acc[header] = result[index];
          return acc;
        },
        {} as Icd10Result
      )
    );
  } catch (error) {
    console.error("An error occurred while fetching ICD-10 data:", error);
    return null;
  }
}
