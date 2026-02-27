"use client";

import { useEffect } from "react";
import { syncOfflineResults } from "@lifesync/api-sdk";
import { useToast } from "@/components/ui/Toast";

export default function SyncManager() {
    const { showToast } = useToast();

    useEffect(() => {
        const sync = async () => {
            // Check for pending items
            const queueJson = localStorage.getItem("pending_sync_queue");
            if (!queueJson) return;

            try {
                const queue = JSON.parse(queueJson);
                if (!Array.isArray(queue) || queue.length === 0) return;

                console.log(`Checking connectivity...`);
                // We attempt sync. If backend is down, this throws and we keep queue.
                // If backend is up, we sync and clear queue.

                // Normalize queue items for the SDK
                const offlineItems = queue.map((item: any) => ({
                    offline_id: item.id || item.assessment_id, // handle potential variances
                    responses: item.responses,
                    timestamp: item.timestamp,
                    user_id: item.user_id, // might be undefined
                    quiz_type: item.quiz_type
                }));

                console.log(`Attempting to sync ${offlineItems.length} items...`);

                const result = await syncOfflineResults(offlineItems);

                if (result && result.synced && result.synced.length > 0) {
                    // Success! Clear queue
                    localStorage.removeItem("pending_sync_queue");

                    showToast(
                        `Successfully synced ${result.synced.length} offline assessment(s).`,
                        "success"
                    );

                    console.log("Sync success:", result);
                }

            } catch (error) {
                // Silent fail on network error, just log
                console.warn("Sync attempt failed (likely offline):", error);
            }
        };

        // Run on mount
        sync();

        // Optional: Add online listener
        window.addEventListener('online', sync);
        return () => window.removeEventListener('online', sync);
    }, [showToast]);

    return null; // Headless component
}
