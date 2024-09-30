import io
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from llama_cloud import TextNode
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core import VectorStoreIndex, Document, Settings
# from llama_index.llms.ollama import Ollama
# from llama_index.llms.openai import OpenAI
import google.generativeai as gemini  # Import Gemini API properly
from concurrent.futures import ThreadPoolExecutor, as_completed
from app.config.llama_config import AIConfig
from app.config.gemini_config import GeminiConfig
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.embeddings.gemini import GeminiEmbedding
from llama_index.vector_stores.qdrant import QdrantVectorStore
from llama_index.core import Settings
import qdrant_client



class AIRepository:
    def __init__(self):
        # Authenticate with Google Drive API using googleapiclient
        self.drive_service = self.authenticate_google_drive()


           # Load PDFs from Google Drive and extract content
        documents = self.load_documents_from_google_drive(GeminiConfig.GOOGLE_DRIVE_FOLDER_ID)

        # Create TextNodes with the extracted content from the PDFs
        nodes = self.construct_nodes(documents)

        # Create the vector store client (Qdrant in this case)
        client = qdrant_client.QdrantClient(path="qdrant_gemini_3")

        # Define the vector store for Qdrant
        vector_store = QdrantVectorStore(client=client, collection_name="pdf_collection")

        # Set Gemini embedding model in LlamaIndex settings
        Settings.embed_model = GeminiEmbedding(
            model_name=AIConfig.EMBEDDING_MODEL_NAME, api_key=GeminiConfig.GOOGLE_GEMINI_API_KEY
        )

        # Configure Gemini API for LLM
        gemini.configure(api_key=GeminiConfig.GOOGLE_GEMINI_API_KEY)

        # Create a storage context for the vector store
        storage_context = StorageContext.from_defaults(vector_store=vector_store)


        # # Load files directly from Google Drive and create the documents in memory
        # documents = self.load_documents_from_google_drive(
        #     GeminiConfig.GOOGLE_DRIVE_FOLDER_ID)

        # # Set the embedding and LLM model from the configuration
        # Settings.embed_model = HuggingFaceEmbedding(
        #     model_name=AIConfig.EMBEDDING_MODEL_NAME)

        # # Settings.llm = OpenAI(model=AIConfig.LLM_MODEL,
        # #                       request_timeout=AIConfig.REQUEST_TIMEOUT)

        # gemini.configure(api_key=GeminiConfig.GOOGLE_GEMINI_API_KEY)
        # # Create the index from the in-memory documents
        self.index = VectorStoreIndex(nodes=nodes, storage_context=storage_context)        
        
        

    def authenticate_google_drive(self):
        """
        Authenticate using service account credentials loaded from the environment for Google Drive API.
        """
        credentials = GeminiConfig.get_drive_credentials()

        # Build the Google Drive API service once
        service = build('drive', 'v3', credentials=credentials)
        return service

    def load_documents_from_google_drive(self, folder_id):
        """
        Load files from a Google Drive folder into memory and return them as Document objects.
        """
        documents = []
        page_token = None

        while True:
            # Query files in the specified folder
            query = f"'{folder_id}' in parents and trashed=false"
            results = self.drive_service.files().list(
                q=query,
                spaces='drive',
                fields='nextPageToken, files(id, name, mimeType)',
                pageToken=page_token
            ).execute()

            items = results.get('files', [])
            if not items:
                print(f"No files found in Google Drive folder: {folder_id}")
                break

            # Use ThreadPoolExecutor to download files concurrently
            with ThreadPoolExecutor(max_workers=4) as executor:
                future_to_file = {executor.submit(
                    self.load_file_content, item['id'], item['name']): item for item in items}

                for future in as_completed(future_to_file):
                    file_content = future.result()
                    if file_content:
                        item = future_to_file[future]
                        # Directly pass the PDF content as binary
                        documents.append(Document(content=file_content, metadata={
                                         "file_name": item['name']}))

            page_token = results.get('nextPageToken', None)
            if page_token is None:
                break

        return documents

    def load_file_content(self, file_id, file_name):
        """
        Load the content of a PDF file from Google Drive directly into memory using googleapiclient.
        """
        try:
            # Download the file
            request = self.drive_service.files().get_media(fileId=file_id)
            file_stream = io.BytesIO()
            downloader = MediaIoBaseDownload(file_stream, request)

            done = False
            while not done:
                status, done = downloader.next_chunk()

            file_stream.seek(0)

            # Directly return the PDF file stream (binary data)
            print(f"Loaded PDF file: {file_name}")
            return file_stream

        except Exception as e:
            print(f"Error loading file content from Google Drive: {e}")
            return None

    def get_query_engine(self):
        # Initialize query engine from the index
        return self.index.as_query_engine()

    def query(self, query_text: str):
        # Execute a query on the index
        query_engine = self.get_query_engine()
        return query_engine.query(query_text)

    def construct_nodes(self, documents):
        """
        Construct TextNode objects for building the index from extracted PDF text.
        """
        nodes = []
        for doc in documents:
            # Fix: Accessing 'metadata' and 'content' attributes directly
            metadata = {"file_name": doc.metadata["file_name"]}
            text_node = TextNode(text=doc.content, metadata=metadata)
            nodes.append(text_node)
        return nodes