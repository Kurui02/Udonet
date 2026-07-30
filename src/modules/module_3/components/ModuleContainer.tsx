"use client";

import { Suspense } from 'react';
import { CreatePostProvider, useCreatePost } from '@module_3/posts/exports';
import SearchBox from "@module_3/search/components/SearchBox";
import ThreadView from '@module_3/posts/components/ThreadView';
import PostList from '@module_3/posts/components/PostList';
import { useThreadNavigation } from '@module_3/hooks/useThreadNavigation';

function Module3Content() {
  const { selectedThread, openThread, closeThread } = useThreadNavigation();
  const { open: openCreatePost } = useCreatePost();

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      {selectedThread ? (
        <ThreadView threadId={selectedThread} onBack={closeThread} />
      ) : (
        <div className="bg-lite-white p-6 sm:p-8 rounded-[35px] border border-white-gray shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <SearchBox />
            </div>

            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={() => openCreatePost()}
                className="w-full sm:w-auto px-6 py-3 bg-regular-blue hover:bg-dark-main-blue text-pure-white font-candal font-normal text-p rounded-full transition-all shadow-md active:scale-95 cursor-pointer border-0"
              >
                + Crear Publicación
              </button>
            </div>
          </div>

          <PostList onSelectPost={openThread} />
        </div>
      )}
    </div>
  );
}

export default function Module3Container() {
  return (
    <CreatePostProvider>
      <Suspense fallback={<div className="max-w-[1000px] mx-auto p-12 text-center font-candal font-normal text-gray-custom text-p">Cargando módulo...</div>}>
        <Module3Content />
      </Suspense>
    </CreatePostProvider>
  );
}