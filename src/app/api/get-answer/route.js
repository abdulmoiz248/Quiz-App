import { NextResponse } from 'next/server';

export async function POST(req) {
    const { query } = await req.json();
    console.log("Query",query);
    if (!query) {
        return NextResponse.json({ error: "Query parameter is required." }, { status: 400 });
    }

    try {
               
        const pythonServerUrl = 'http://localhost:8000/ask-question/';
        const formData = new FormData();
        formData.append('query', query);

        const response = await fetch(pythonServerUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return NextResponse.json(result);

    } catch (error) {
        console.error('Error processing question:', error);
        return NextResponse.json({ error: "Error processing question" }, { status: 500 });
    }
}
