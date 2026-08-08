"use client";

import React, { useState } from 'react';
import PostList from '@module_3/posts/components/PostList';
import ThreadView from '@module_3/posts/components/ThreadView';
import { UnifiedPost } from '@module_3/posts/services/supabase-service';
import { getThread } from '@module_3/posts/actions/thread';

interface SearchFeedProps {
    initialPosts: UnifiedPost[];
    currentUserId?: string | null;
}

export default function SearchFeed({ initialPosts, currentUserId }: SearchFeedProps) {
    const [selectedThread, setSelectedThread] = useState<string | null>(null);
    const [currentThread, setCurrentThread] = useState<UnifiedPost | null>(null);
    const [loadingThread, setLoadingThread] = useState(false);

    const openThread = async (id: string) => {
        setLoadingThread(true);
        setSelectedThread(id);
        const data = await getThread(id);
        setCurrentThread(data);
        setLoadingThread(false);
    };

    const closeThread = () => {
        setSelectedThread(null);
        setCurrentThread(null);
    };

    if (selectedThread) {
        return (
            <div className="w-full">
                {loadingThread ? (
                    <div className="flex flex-col items-center justify-center p-12 space-y-3">
                        <div className="w-8 h-8 border-4 border-regular-blue border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-candal font-normal text-p text-gray-custom">Cargando publicación...</p>
                    </div>
                ) : (
                    <ThreadView
                        threadId={selectedThread}
                        initialThread={currentThread}
                        onBack={closeThread}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="w-full">
            <PostList posts={initialPosts} onSelectPost={openThread} currentUserId={currentUserId} />
        </div>
    );
}
