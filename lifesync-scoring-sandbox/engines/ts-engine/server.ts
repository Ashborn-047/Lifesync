import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { computeProfile } from './computeProfile';
import { Question } from './types';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Load questions
const questionsPath = path.join(__dirname, 'questions.json');
const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
const questions: Question[] = questionsData.questions;

app.post('/compute', (req: any, res: any) => {
    try {
        const { answers } = req.body;
        if (!answers) {
            return res.status(400).json({ error: 'Missing answers' });
        }
        const result = computeProfile(answers, questions);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

const PORT = 7000;
app.listen(PORT, () => {
    console.log(`TS Engine listening on port ${PORT}`);
});
