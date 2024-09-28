import os
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv
from transformers import pipeline

app = FastAPI()
load_dotenv()

HUGGINGFACEHUB_API_TOKEN = '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'

huggingface_embeddings = HuggingFaceBgeEmbeddings(
    model_name="BAAI/bge-small-en-v1.5",
    model_kwargs={'device': 'cpu'},
    encode_kwargs={'normalize_embeddings': True}
)

# Question-answering model
qa_model_name = "distilbert/distilbert-base-cased-distilled-squad"
qa_pipeline = pipeline("question-answering", model=qa_model_name)

# Use the google/flan-t5-small model for answer completion
completion_model_name = "google/flan-t5-small"
completion_pipeline = pipeline("text2text-generation", model=completion_model_name)

vectorstore = None 

@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...)):
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

@app.post("/ask-question/")
async def ask_question(query: str = Form(...)):
    global vectorstore

    if vectorstore is None:
        return JSONResponse(content={"error": "Please upload a PDF first."}, status_code=400)

    try:
        # Perform a similarity search to retrieve the most relevant documents
        relevant_documents = vectorstore.similarity_search(query)

        if not relevant_documents:
            return JSONResponse(content={"answer": "No relevant documents found."})

        # Extract the most relevant document's content
        context = relevant_documents[0].page_content

        # Use the QA pipeline to get the answer
        answer = qa_pipeline(question=query, context=context)

        # Prepare the input for the FLAN model
        combined_input = f"Context: {context}\nAnswer: {answer['answer']}"
        complete_answer = completion_pipeline(combined_input, max_length=150)

        return JSONResponse(content={"answer": complete_answer[0]['generated_text']})

    except Exception as e:
        print(f"Error during processing: {e}")  # Log the error
        return JSONResponse(content={"error": "Failed to get a response from the model."}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
