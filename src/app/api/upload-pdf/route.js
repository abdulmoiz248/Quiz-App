import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs/promises'; // Use fs/promises for async file operations
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(req) {
    const formData = await req.formData();
    const file = formData.get('file');
   
    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
     
    // Save the uploaded file
    const tempDir = os.tmpdir();
    const fileName = file.name;
    const filePath = path.join(tempDir, fileName);
    
    const fileBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(fileBuffer));

    try {
        // Send request to the Python server
        const pythonServerUrl = 'http://localhost:8000/upload-pdf/';
        const formData = new FormData();
        formData.append('file', new Blob([fileBuffer]), fileName);

        const response = await fetch(pythonServerUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Python server response:', result);

        // Clean up the temporary file
        await fs.unlink(filePath);

    } catch (error) {
        console.error('Error processing PDF:', error);
        return NextResponse.json({ error: "Error processing PDF" }, { status: 500 });
    }

    return NextResponse.json({ message: "PDF uploaded and processed successfully" });
}
