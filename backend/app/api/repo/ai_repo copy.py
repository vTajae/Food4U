from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.ollama import Ollama
from app.config.llama_config import AIConfig

class AIRepository:
    def __init__(self):
        # Load documents from the directory specified in the config
        documents = SimpleDirectoryReader(AIConfig.DATA_DIRECTORY).load_data()

        # Set the embedding model and LLM model using settings from the config
        Settings.embed_model = HuggingFaceEmbedding(model_name=AIConfig.EMBEDDING_MODEL_NAME)
        Settings.llm = Ollama(model=AIConfig.LLM_MODEL, request_timeout=AIConfig.REQUEST_TIMEOUT)

        # Create the index from the documents
        self.index = VectorStoreIndex.from_documents(documents)

    def get_query_engine(self):
        # Initialize query engine from the index
        return self.index.as_query_engine()

    def query(self, query_text: str):
        # Execute a query on the index
        query_engine = self.get_query_engine()
        return query_engine.query(query_text)
