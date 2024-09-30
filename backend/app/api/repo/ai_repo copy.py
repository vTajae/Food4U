import io
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from concurrent.futures import ThreadPoolExecutor, as_completed
from llama_cloud import TextNode
from llama_index.core import VectorStoreIndex, Document, StorageContext, Settings
from llama_index.embeddings.gemini import GeminiEmbedding
from llama_index.vector_stores.qdrant import QdrantVectorStore
import google.generativeai as palm  # Use 'palm' as per official documentation
from qdrant_client import QdrantClient
from app.config.llama_config import AIConfig
from app.config.gemini_config import GeminiConfig


class AIRepository:
    def __init__(self):
        
        print({
            GeminiConfig.GOOGLE_GEMINI_API_KEY: "DATEKEYYYYY"
        })
        self.drive_service = self.authenticate_google_drive()
        self.vector_store = self.initialize_vector_store()
        self.index = self.initialize_index()
        # Configure API key
        palm.configure(api_key=GeminiConfig.GOOGLE_GEMINI_API_KEY)

    def authenticate_google_drive(self):
        """Authenticate using service account credentials for Google Drive API."""
        credentials = GeminiConfig.get_drive_credentials()
        service = build('drive', 'v3', credentials=credentials)
        return service

    def initialize_vector_store(self):
        """Initialize Qdrant vector store by connecting to the Qdrant Cloud Cluster."""
        # Connect to the Qdrant Cloud cluster
        client = QdrantClient(url=GeminiConfig.QDRANT_URL,
                              api_key=GeminiConfig.QDRANT_API_KEY)

        # Fetch collections to verify connection
        print(client.get_collections())

        # Initialize the vector store
        vector_store = QdrantVectorStore(
            client=client, collection_name="document_collection")
        return vector_store

    def initialize_index(self):
        """Initialize VectorStoreIndex using Qdrant vector store."""
        documents = self.load_documents_from_google_drive(
            GeminiConfig.GOOGLE_DRIVE_FOLDER_ID)
        nodes = self.construct_nodes(documents)

        # Set the embedding model for LlamaIndex
        palm.configure(api_key=GeminiConfig.GOOGLE_GEMINI_API_KEY)
        Settings.embed_model = GeminiEmbedding(
            model_name=AIConfig.EMBEDDING_MODEL_NAME,
            api_key=GeminiConfig.GOOGLE_GEMINI_API_KEY
        )

        # Create a storage context for the vector store
        storage_context = StorageContext.from_defaults(
            vector_store=self.vector_store)
        return VectorStoreIndex(nodes=nodes, storage_context=storage_context)

    def load_documents_from_google_drive(self, folder_id):
        """Load files from Google Drive and return them as Document objects."""
        documents = []
        page_token = None

        while True:
            query = f"'{folder_id}' in parents and trashed=false"
            results = self.drive_service.files().list(
                q=query, spaces='drive',
                fields='nextPageToken, files(id, name, mimeType)',
                pageToken=page_token
            ).execute()

            items = results.get('files', [])
            if not items:
                print(f"No files found in Google Drive folder: {folder_id}")
                break

            with ThreadPoolExecutor(max_workers=4) as executor:
                future_to_file = {
                    executor.submit(
                        self.load_file_content,
                        item['id'], item['name'], item['mimeType']
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

            page_token = results.get('nextPageToken', None)
            if page_token is None:
                break

        return documents

    def load_file_content(self, file_id, file_name, mime_type):
        """Load and process the content of the file via the Google Gemini API."""
        try:
            request = self.drive_service.files().get_media(fileId=file_id)
            file_stream = io.BytesIO()
            downloader = MediaIoBaseDownload(file_stream, request)

            done = False
            while not done:
                status, done = downloader.next_chunk()

            file_stream.seek(0)
            file_content = file_stream.read()

            # Process the file content using the Gemini API document processor
            return self.process_file_with_gemini(file_content, file_name, mime_type)

        except Exception as e:
            print(f"Error loading file content from Google Drive: {e}")
            return None

    def process_file_with_gemini(self, file_content, file_name, mime_type):
        """Process files using the Google Gemini Document Processing API."""
        
        try:
            # Check if the file format is supported
            if mime_type in ['application/pdf', 'text/csv', 'text/plain', 'text/html']:
                # Step 1: Upload the file using Gemini API
                # File API for file upload
                uploaded_file = palm.upload_file(file_content)

                if uploaded_file:  # Check if the file was successfully uploaded
                    print(f"Successfully uploaded {file_name}")

                    # Step 2: Generate content (e.g., summarize or extract text)
                    prompt = "Extract and summarize the document content."
                    response = self.model.generate_content(
                        [prompt, uploaded_file])

                    # Extract the text from the response
                    document_text = response.get('text', '')

                    if document_text:
                        print(f"Successfully processed {file_name}")
                        return document_text
                    else:
                        print(f"Failed to extract text from {file_name}")
                        return None
                else:
                    print(f"Failed to upload {file_name}")
                    return None
            else:
                print(f"Unsupported file type: {mime_type}")
                return None

        except Exception as e:
            print(f"Error processing file {file_name} with Google Gemini: {e}")
            return None

    def construct_nodes(self, documents):
        """Construct TextNode objects from extracted document content."""
        nodes = []
        for doc in documents:
            metadata = {"file_name": doc.metadata["file_name"]}
            text_node = TextNode(text=doc.content, metadata=metadata)
            nodes.append(text_node)
        return nodes

    def get_query_engine(self):
        """Get the query engine initialized from the index."""
        return self.index.as_query_engine()

    def query(self, query_text):
        """Execute a query on the index and return results."""
        query_engine = self.get_query_engine()
        return query_engine.query(query_text)

    def generate_summary(self, prompt):
        """Generate a response using the Gemini model."""
        # Prepare the prompt with the document texts
        sample_files = [doc.text for doc in self.documents]

        # Combine the prompt and sample files
        full_prompt = prompt + "\n\n" + "\n\n".join(sample_files)

        # Generate text using the Gemini model
        response = palm.generate_text(
            model='gemini-1.5-flash',
            prompt=full_prompt,
            temperature=0.7,
            max_output_tokens=800,
        )

        if response.result:
            print(response.result)
            return response.result
        else:
            print("Failed to generate response.")
            return None
