from llama_cloud import HuggingFaceInferenceApiEmbedding
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.ollama import Ollama
from config import Config

class AIService:
    def __init__(self):
        # Load documents from the directory specified in the config
        documents = SimpleDirectoryReader(Config.DATA_DIRECTORY).load_data()

        # Set the embedding model and LLM model using settings from the config
        Settings.embed_model = HuggingFaceInferenceApiEmbedding(model_name=Config.EMBEDDING_MODEL_NAME)
        Settings.llm = Ollama(model=Config.LLM_MODEL, request_timeout=Config.REQUEST_TIMEOUT)

        # Create the index from the documents
        self.index = VectorStoreIndex.from_documents(documents)
        self.query_engine = self.index.as_query_engine()

    def get_summary(self):
        # Query the index to summarize the content of the document directory
        response = self.query_engine.query("Summarize the content of the document in the directory")
        return response.response
