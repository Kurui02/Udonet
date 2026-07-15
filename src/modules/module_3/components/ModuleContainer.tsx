"use client";

import { useState } from "react";
import SearchBox from "@module_3/search/components/SearchBox";
import ThreadView from '@module_3/posts/components/ThreadView';
import CreatePostModal from '@module_3/posts/components/CreatePostForm';
import { useThreadNavigation } from '@module_3/hooks/useThreadNavigation';

export default function Module3Container() {
  const { selectedThread, openThread, closeThread } = useThreadNavigation();

  const [ isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#1e1e1e', minHeight: '90vh', borderRadius: '8px', padding: '20px' }} className="space-y-6">
      {selectedThread ? ( 
        <ThreadView threadId={selectedThread} onBack={closeThread} />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-4">
            <div className="flex-1">
              <SearchBox onSelectPost={openThread} />
            </div>
            
            <div className="flex items-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition shadow-md active:scale-95"
              >
                + Crear Publicación
              </button>
            </div>
          </div>
        </>
      )}

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
