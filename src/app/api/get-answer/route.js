import { exec } from 'child_process';

export default async function handler(req, res) {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: "Query parameter is required." });
    }

    // Run Python script to ask a question
    exec(`python ask_question.py "${query}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${stderr}`);
            return res.status(500).json({ error: 'Python script failed.' });
        }

        // Send back the result from the Python script
        return res.status(200).json(JSON.parse(stdout));
    });
}
