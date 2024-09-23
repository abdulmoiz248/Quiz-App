import os
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from urllib.request import urlretrieve
import numpy as np
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.llms import HuggingFaceHub
from dotenv import load_dotenv


load_dotenv()

HUGGINGFACEHUB_API_TOKEN = 'hf_GqLFyJUadtBcHhJGUuYmlsCBOyPVidGliYe'

huggingface_embeddings = HuggingFaceBgeEmbeddings(
    model_name="BAAI/bge-small-en-v1.5",
    model_kwargs={'device':'cpu'},
    encode_kwargs={'normalize_embeddings': True}
)

hf = HuggingFaceHub(
    repo_id="mistralai/Mistral-7B-v0.1",
    huggingfacehub_api_token=HUGGINGFACEHUB_API_TOKEN,
    model_kwargs={"temperature": 0.1, "max_length": 500}
)

vectorstore = None 


def upload_pdf(file: UploadFile = File(...)):
    global vectorstore
    file_location = f"./PDF/{file.filename}"
    os.makedirs("PDF", exist_ok=True)
    with open(file_location, "wb") as f:
        f.write(file.file.read())

    loader = PyPDFLoader(file_location)
    docs_before_split = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=700,
        chunk_overlap=50
    )
    docs_after_split = text_splitter.split_documents(docs_before_split)

    vectorstore = FAISS.from_documents(docs_after_split, huggingface_embeddings)

    return JSONResponse(content={"message": "PDF uploaded and processed successfully."})



async def ask_question(query: str = Form(...)):
    global vectorstore

    if vectorstore is None:
        return JSONResponse(content={"error": "Please upload a PDF first."}, status_code=400)

    relevant_documents = vectorstore.similarity_search(query)
    
    if not relevant_documents:
        return JSONResponse(content={"answer": "No relevant documents found."})

    context = relevant_documents[0].page_content
    response = hf.invoke(f"Context: {context}\nQuestion: {query}")

    return JSONResponse(content={"answer": response})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)