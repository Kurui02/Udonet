"use client";

import SearchBox from "@module_3/search/components/SearchBox";
import ThreadView from '@module_3/posts/components/ThreadView';
import LinkPreviewForm from '@module_3/posts/components/LinkPreviewForm';
import { useThreadNavigation } from '@module_3/hooks/useThreadNavigation';

export default function Module3Container() {
  const { selectedThread, openThread, closeThread } = useThreadNavigation();

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#1e1e1e', minHeight: '90vh', borderRadius: '8px', padding: '20px' }} className="space-y-6">
      {selectedThread ? ( 
        <ThreadView threadId={selectedThread} onBack={closeThread} />
      ) : (
        <>
          <SearchBox onSelectPost={openThread} />
          <LinkPreviewForm />
        </>
      )}
    </div>
  );
}
