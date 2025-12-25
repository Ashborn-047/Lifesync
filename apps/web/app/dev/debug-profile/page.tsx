'use client';

import React, { useState } from 'react';
import { computeProfile } from '@lifesync/personality-engine';
import questions from '@lifesync/personality-engine/data/questions_180.json';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';

export default function DebugProfilePage() {
    const [jsonInput, setJsonInput] = useState('{}');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCompute = () => {
        try {
            setError(null);
            const answers = JSON.parse(jsonInput);
            const profile = computeProfile(answers, questions.questions as any);
            setResult(profile);
        } catch (e: any) {
            setError(e.message);
            setResult(null);
        }
    };

    return (
        <div className="container mx-auto p-8 space-y-8 text-white">
            <h1 className="text-3xl font-bold">Debug Profile Computation</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <div className="p-4 border-b border-white/10 mb-4">
                        <h2 className="text-xl font-semibold">Input Answers (JSON)</h2>
                    </div>
                    <div className="space-y-4">
                        <Textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder='{"Q001": 5, "Q002": 1...}'
                            className="h-96 font-mono bg-slate-900 text-white border-white/20"
                        />
                        <Button onClick={handleCompute} className="w-full">
                            Compute Profile
                        </Button>
                        {error && (
                            <div className="p-4 bg-red-500/20 text-red-400 rounded-md border border-red-500/30">
                                Error: {error}
                            </div>
                        )}
                    </div>
                </Card>

                <Card>
                    <div className="p-4 border-b border-white/10 mb-4">
                        <h2 className="text-xl font-semibold">Result</h2>
                    </div>
                    <div>
                        {result ? (
                            <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto h-96 font-mono text-sm border border-white/10">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        ) : (
                            <div className="text-white/50 text-center py-12">
                                No result computed yet
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
