import os
from dotenv import load_dotenv
from fastapi import APIRouter

import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, Response

from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader("data").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()
response = query_engine.query("Summarize the content of the document in the directory")
print(response)

router = APIRouter()

load_dotenv()

@router.get("/ai")
async def dashboard():
    # Your dashboard logic here
    return {"message": response.response}



