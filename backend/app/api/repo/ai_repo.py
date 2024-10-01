import io
import logging
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from concurrent.futures import ThreadPoolExecutor, as_completed
from llama_cloud import TextNode
from llama_index.core import VectorStoreIndex, Document, StorageContext, Settings
from llama_index.embeddings.gemini import GeminiEmbedding
from llama_index.vector_stores.qdrant import QdrantVectorStore
import google.generativeai as palm
from qdrant_client import QdrantClient
from app.config.llama_config import AIConfig
from app.config.gemini_config import GeminiConfig

# Configure the logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIRepository:
    def __init__(self):
        logger.info("Initializing AIRepository.")

        # Authenticate with Google Drive
        self.drive_service = self.authenticate_google_drive()

        # Initialize Qdrant vector store
        self.vector_store = self.initialize_vector_store()

        # Initialize the index with text documents from Google Drive
        self.index = self.initialize_index()

        # Configure the PaLM client using the API key
        palm.configure(api_key=GeminiConfig.GOOGLE_GEMINI_API_KEY)
        logger.info("AIRepository initialized successfully.")

    def authenticate_google_drive(self):
        """Authenticate using service account credentials for Google Drive API."""
        logger.info("Authenticating Google Drive.")
        credentials = GeminiConfig.get_drive_credentials()
        service = build('drive', 'v3', credentials=credentials)
        logger.info("Google Drive authenticated successfully.")
        return service

    def initialize_vector_store(self):
        """Initialize Qdrant vector store by connecting to the Qdrant Cloud Cluster."""
        logger.info("Initializing Qdrant vector store.")
        # Connect to the Qdrant Cloud cluster
        client = QdrantClient(
            url=GeminiConfig.QDRANT_URL,
            api_key=GeminiConfig.QDRANT_API_KEY
        )

        # Fetch collections to verify connection
        collections = client.get_collections()
        logger.info(f"Connected to Qdrant. Available collections: {collections}")

        # Initialize the vector store
        vector_store = QdrantVectorStore(
            client=client,
            collection_name="document_collection"
        )
        logger.info("Qdrant vector store initialized successfully.")
        return vector_store

    def initialize_index(self):
        """Initialize VectorStoreIndex using Qdrant vector store."""
        logger.info("Initializing VectorStoreIndex.")

        # Load text documents from Google Drive
        documents = self.load_text_documents_from_google_drive(
            GeminiConfig.GOOGLE_DRIVE_FOLDER_ID
        )
        nodes = self.construct_nodes(documents)

        # Set the embedding model for LlamaIndex
        Settings.embed_model = GeminiEmbedding(
            model_name=AIConfig.EMBEDDING_MODEL_NAME,
            api_key=GeminiConfig.GOOGLE_GEMINI_API_KEY
        )
        logger.info("Embedding model set for LlamaIndex.")

        # Create a storage context for the vector store
        storage_context = StorageContext.from_defaults(
            vector_store=self.vector_store
        )
        logger.info("Storage context created for vector store.")

        index = VectorStoreIndex(nodes=nodes, storage_context=storage_context)
        logger.info("VectorStoreIndex initialized successfully.")
        return index

    def load_text_documents_from_google_drive(self, folder_id):
        """Load text files from Google Drive and return them as Document objects."""
        logger.info(f"Loading text documents from Google Drive folder: {folder_id}")
        documents = []
        page_token = None

        while True:
            query = (
                f"'{folder_id}' in parents and trashed=false and mimeType='text/plain'"
            )
            results = self.drive_service.files().list(
                q=query,
                spaces='drive',
                fields='nextPageToken, files(id, name, mimeType)',
                pageToken=page_token
            ).execute()

            items = results.get('files', [])
            if not items:
                logger.warning(f"No text files found in Google Drive folder: {folder_id}")
                break

            with ThreadPoolExecutor(max_workers=4) as executor:
                future_to_file = {
                    executor.submit(
                        self.load_file_content,
                        item['id'],
                        item['name']
                    ): item for item in items
                }

                for future in as_completed(future_to_file):
                    file_content = future.result()
                    if file_content:
                        item = future_to_file[future]
                        document = Document(
                            text=file_content,
                            metadata={"file_name": item['name']}
                        )
                        documents.append(document)
                        logger.info(f"Loaded and processed file: {item['name']}")

            page_token = results.get('nextPageToken', None)
            if page_token is None:
                break

        logger.info(f"Total documents loaded: {len(documents)}")
        return documents

    def load_file_content(self, file_id, file_name):
        """Load the content of a text file from Google Drive."""
        logger.info(f"Loading file content for: {file_name}")
        try:
            request = self.drive_service.files().get_media(fileId=file_id)
            file_stream = io.BytesIO()
            downloader = MediaIoBaseDownload(file_stream, request)

            done = False
            while not done:
                status, done = downloader.next_chunk()

            file_stream.seek(0)
            file_content = file_stream.read().decode('utf-8')
            return file_content

        except Exception as e:
            logger.error(f"Error loading file content from Google Drive: {e}")
            return None

    def construct_nodes(self, documents):
        """Construct TextNode objects from extracted document content."""
        logger.info("Constructing TextNode objects from documents.")
        nodes = []
        for doc in documents:
            metadata = {"file_name": doc.metadata["file_name"]}
            text_node = TextNode(text=doc.text, metadata=metadata)
            nodes.append(text_node)
        logger.info(f"Total TextNode objects constructed: {len(nodes)}")
        return nodes

    def get_query_engine(self):
        """Get the query engine initialized from the index."""
        logger.info("Initializing query engine from index.")
        return self.index.as_query_engine()

    def query(self, query_text):
        """Execute a query on the index and return results."""
        logger.info(f"Executing query: {query_text}")
        query_engine = self.get_query_engine()
        result = query_engine.query(query_text)
        logger.info(f"Query result: {result}")
        return result

    def generate_summary(self, prompt:str):
        """Generate a response using the Gemini model."""
        logger.info(f"Generating summary with prompt: {prompt}")

        model = palm.GenerativeModel("gemini-1.5-flash-latest")
        response = model.generate_content(
            prompt,
            generation_config=palm.types.GenerationConfig(
                # Only one candidate for now.
                candidate_count=1,
                stop_sequences=["x"],
                max_output_tokens=20,
                temperature=1.0,
            ),
        )


        if response.text:
            logger.info(f"Generated summary: {response.text}")
            return response.text
        else:
            logger.error("Failed to generate response.")
            return None
