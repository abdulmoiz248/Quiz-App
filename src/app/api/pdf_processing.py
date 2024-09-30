import os
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware  # Import CORS Middleware
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv
from transformers import pipeline

app = FastAPI()
load_dotenv()

# CORS Middleware to allow requests from frontend (e.g., localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# HuggingFace API token and embedding model setup
HUGGINGFACEHUB_API_TOKEN = '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'

huggingface_embeddings = HuggingFaceBgeEmbeddings(
    model_name="BAAI/bge-small-en-v1.5",
    model_kwargs={'device': 'cpu'},
    encode_kwargs={'normalize_embeddings': True}
)

# Question-answering model setup
qa_model_name = "distilbert/distilbert-base-cased-distilled-squad"
qa_pipeline = pipeline("question-answering", model=qa_model_name)

# Text completion model setup
completion_model_name = "google/flan-t5-small"
completion_pipeline = pipeline("text2text-generation", model=completion_model_name)

vectorstore = None

@app.post("/upload-pdf/")
async def upload_pdf(files: list[UploadFile] = File(...)):
    global vectorstore
    os.makedirs("PDF", exist_ok=True)
    
    for file in files:
        print(f"Uploading PDF: {file.filename}")
        file_location = f"./PDF/{file.filename}"
        
        with open(file_location, "wb") as f:
            f.write(file.file.read())

        # Load and split the PDF
        loader = PyPDFLoader(file_location)
        docs_before_split = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=700,
            chunk_overlap=50
        )
        docs_after_split = text_splitter.split_documents(docs_before_split)

        # Create vector store for the documents
        vectorstore = FAISS.from_documents(docs_after_split, huggingface_embeddings)

    return JSONResponse(content={"message": f"PDF(s) uploaded and processed successfully: {', '.join([file.filename for file in files])}"})


@app.post("/ask-question/")
async def ask_question(query: str = Form(...)):
    global vectorstore

    if vectorstore is None:
        return JSONResponse(content={"error": "Please upload a PDF first."}, status_code=400)

    try:
        # Perform similarity search to retrieve relevant documents
        relevant_documents = vectorstore.similarity_search(query)

        if not relevant_documents:
            return JSONResponse(content={"answer": "No relevant documents found."})

        # Extract context from the most relevant document
        context = relevant_documents[0].page_content

        # Get the answer using the QA model
        answer = qa_pipeline(question=query, context=context)

        # Prepare input for the completion model (FLAN)
        combined_input = f"Context: {context}\nAnswer: {answer['answer']}"
        complete_answer = completion_pipeline(combined_input, max_length=150)

        return JSONResponse(content={"answer": complete_answer[0]['generated_text']})

    except Exception as e:
        print(f"Error during processing: {e}")  # Log the error
        return JSONResponse(content={"error": "Failed to get a response from the model."}, status_code=500)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
