from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from app.config.llama_config import AIConfig
from llama_index.llms.ollama import Ollama

class AIService:
    def __init__(self):
        # Load documents from the directory specified in the config
        documents = SimpleDirectoryReader(AIConfig.DATA_DIRECTORY).load_data()

        # Set the embedding model and LLM model using settings from the config
        Settings.embed_model = HuggingFaceEmbedding(model_name=AIConfig.EMBEDDING_MODEL_NAME)
        Settings.llm = Ollama(model=AIConfig.LLM_MODEL, request_timeout=AIConfig.REQUEST_TIMEOUT)

        # Create the index from the documents
        self.index = VectorStoreIndex.from_documents(documents)
        self.query_engine = self.index.as_query_engine()

    def get_summary(self):
        # Query the index to summarize the content of the document directory
        response = self.query_engine.query("Summarize the content of the document in the directory")
        return response.response

    async def invalidate_refresh_token(self, token: str):
        # Token invalidation logic (this is a placeholder for your actual token logic)
        return {"message": "Token invalidated"}
