import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function POST(req) {
    const formData = await req.formData();
    const files = formData.getAll('file');
   
    if (files.length === 0) {
        return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }
     
    const pythonServerUrl = 'http://localhost:8000/upload-pdf/';
    const serverFormData = new FormData();

    try {
        for (const file of files) {
            const tempDir = path.join(process.cwd(), 'PDF');
            await fs.mkdir(tempDir, { recursive: true });
            const fileName = file.name;
            const filePath = path.join(tempDir, fileName);
            
            const fileBuffer = await file.arrayBuffer();
            await fs.writeFile(filePath, Buffer.from(fileBuffer));

            serverFormData.append('file', new Blob([fileBuffer]), fileName);

           
          // await fs.unlink(filePath);
        }

        const response = await fetch(pythonServerUrl, {
            method: 'POST',
            body: serverFormData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Python server response:', result);

    } catch (error) {
        console.error('Error processing PDF(s):', error);
        return NextResponse.json({ error: "Error processing PDF(s)" }, { status: 500 });
    }

    return NextResponse.json({ message: "PDF(s) uploaded and processed successfully" });
}