import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(req) {
    const formData = await req.formData();
    console.log("Form Data:", formData);
    const file = formData.get('file');
   
    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, file.name);

    try {
       
        fs.writeFileSync(tempFilePath, buffer);

        
        const execAsync = promisify(exec);
        const command = `python src/app/api/pdf_processing.py "${tempFilePath}"`;
        const { stdout, stderr } = await execAsync(command);

        if (stderr) {
            console.error('Error:', stderr);
            return NextResponse.json({ error: "Error processing PDF" }, { status: 500 });
        }

        console.log('Python script output:', stdout);

        // Clean up the temporary file
        fs.unlinkSync(tempFilePath);

        return NextResponse.json({ message: "PDF uploaded and processed successfully" });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: "Error processing PDF" }, { status: 500 });
    }
   
}