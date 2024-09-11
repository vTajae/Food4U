from dotenv import load_dotenv
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

# Load environment variables
load_dotenv()


# Load documents and initialize the LlamaIndex
class AIService:
    def __init__(self):
        # Load the data and create an index
        documents = SimpleDirectoryReader("data").load_data()
        self.index = VectorStoreIndex.from_documents(documents)
        self.query_engine = self.index.as_query_engine()

    def get_summary(self):
        # Query the index to summarize the content
        response = self.query_engine.query("Summarize the content of the document in the directory")
        return response.response
