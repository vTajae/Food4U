import csv
import json
import pandas as pd
import pdfplumber
from io import BytesIO, StringIO
from typing import Any, List, Union

class FileAnalysisUtil:
    @staticmethod
    def analyze_pdf(pdf_bytes: bytes) -> str:
        """
        Analyze a PDF document and extract text from each page.
        
        :param pdf_bytes: PDF file in bytes
        :return: Extracted text as a single string
        """
        text_pages = []
        with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    text_pages.append(text)
        return "\n".join(text_pages)

    @staticmethod
    def analyze_excel(excel_bytes: bytes, sheet_name: Union[str, int] = 0) -> pd.DataFrame:
        """
        Analyze an Excel file and extract data from the specified sheet.
        
        :param excel_bytes: Excel file in bytes
        :param sheet_name: Sheet name or index
        :return: DataFrame containing the sheet data
        """
        excel_io = BytesIO(excel_bytes)
        df = pd.read_excel(excel_io, sheet_name=sheet_name)
        return df

    @staticmethod
    def analyze_csv(csv_bytes: bytes) -> pd.DataFrame:
        """
        Analyze a CSV file and return its contents as a DataFrame.
        
        :param csv_bytes: CSV file in bytes
        :return: DataFrame containing the CSV data
        """
        csv_io = StringIO(csv_bytes.decode("utf-8"))
        df = pd.read_csv(csv_io)
        return df

    @staticmethod
    def analyze_json(json_bytes: bytes) -> Any:
        """
        Analyze a JSON file and return the parsed content.
        
        :param json_bytes: JSON file in bytes
        :return: Parsed JSON object (dict or list)
        """
        json_str = json_bytes.decode("utf-8")
        return json.loads(json_str)

    @staticmethod
    def analyze_txt(txt_bytes: bytes) -> str:
        """
        Analyze a TXT file and return its contents as a string.
        
        :param txt_bytes: TXT file in bytes
        :return: The content of the text file as a string
        """
        return txt_bytes.decode("utf-8")
