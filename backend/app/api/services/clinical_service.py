import requests
from typing import List, Dict, Optional

class ClinicalService:
    BASE_URL = "https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search"

    @staticmethod
    def search_icd10(query: str, search_fields: str = "code,name", display_fields: str = "code,name", max_results: int = 50) -> Optional[List[Dict]]:
        """
        Search the ICD-10-CM database using the provided query.

        :param query: The search term (ICD-10 code or name)
        :param search_fields: Fields to search (e.g., "code,name")
        :param display_fields: Fields to display in the response (e.g., "code,name")
        :param max_results: Maximum number of results to return
        :return: A list of dictionaries containing the search results, or None if no results found
        """
        params = {
            "sf": search_fields,
            "df": display_fields,
            "terms": query,
            "maxList": max_results
        }

        try:
            response = requests.get(ClinicalService.BASE_URL, params=params)
            response.raise_for_status()  # Raise an exception for bad responses (4xx/5xx)
            data = response.json()

            # The API returns data in a specific format: [metadata, header, results]
            results = data[3] if len(data) > 3 else []

            if not results:
                print("No results found for query:", query)
                return None

            # Process the results to a list of dicts for easier use
            return [dict(zip(data[1], result)) for result in results]

        except requests.RequestException as e:
            print(f"An error occurred while fetching ICD-10 data: {e}")
            return None
