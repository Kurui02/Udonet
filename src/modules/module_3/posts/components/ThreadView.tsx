'use client';

import { useState, useEffect } from 'react';
import { getThread } from '@module_3/posts/actions/thread';
import { MockPost, MockReply } from '@module_3/posts/services/mock-data';

interface ThreadViewProp {
  threadId: string;
  onBack: () => void;
}

function Comments({ reply, level = 0 }: { reply: MockReply; level?: number }) {
  const indentation = level * 16;

  return (
    <div
      style={{ marginLeft: `${indentation}px` }}
      className="border-l-2 border-gray-800 pl-4 mt-4 space-y-1.5"
    >
      <div className="text-xs text-blue-400 font-semibold">
        <strong>{reply.author.username}</strong> • {reply.votes} votos
      </div>
      <p className="text-sm text-gray-200">{reply.content}</p>

      <button className="text-xs px-2.5 py-1 bg-[#222] hover:bg-[#2e2e2e] text-gray-300 rounded border border-gray-800 transition cursor-pointer">
        Responder
      </button>

      {reply.nestedReplies && reply.nestedReplies.length > 0 && (
        <div className="mt-3 space-y-2">
          {reply.nestedReplies.map((child) => (
            <Comments key={child.id} reply={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ThreadView({ threadId, onBack }: ThreadViewProp) {
  const [thread, setThread] = useState<MockPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await getThread(threadId);
      setThread(data);
      setLoading(false);
    };
    loadData();
  }, [threadId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-400">Cargando publicación...</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="p-8 border border-dashed border-gray-800 rounded-xl text-center space-y-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition"
        >
          ← Volver Atrás
        </button>
        <p className="text-gray-400 text-sm">El Hilo no existe o fue eliminado.</p>
      </div>
    );
  }

  const statusColor =
    thread.status === 'Resuelto'
      ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-400'
      : thread.status === 'Fijado'
      ? 'bg-amber-950/50 border border-amber-800 text-amber-400'
      : 'bg-blue-950/50 border border-blue-800 text-blue-400';

  // Obtenemos el link guardado si existe
  const targetUrl = thread.links && thread.links.length > 0 ? thread.links[0] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-white">
      {/* Botón Volver */}
      <button
        onClick={onBack}
        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-semibold rounded-lg transition-all"
      >
        ← Volver Atrás
      </button>

      {/* Tarjeta Principal del Post */}
      <div className="p-6 bg-[#181818] border border-gray-800 rounded-xl space-y-4 shadow-xl">
        {/* Encabezado: Comunidad y Estado */}
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            F / {thread.community || 'General'}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor}`}>
            {thread.status}
          </span>
        </div>

        {/* Título y Contenido */}
        <h1 className="text-xl font-bold text-white">{thread.title}</h1>
        <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
          {thread.content}
        </p>

        {/* ------------------------------------------------------------- */}
        {/* VISTA PREVIA COMPACTA / PEQUEÑA DEL LINK                      */}
        {/* ------------------------------------------------------------- */}
        {targetUrl && (
          <div className="mt-4">
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center overflow-hidden bg-[#121212] rounded-xl border border-gray-800 hover:border-blue-500/50 transition group p-2 gap-3.5"
            >
              {/* Imagen de Previsualización Pequeña */}
              {thread.linkMetadata?.image?.url && (
                <div className="relative w-28 h-24 sm:w-32 sm:h-24 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                  <img
                    src={thread.linkMetadata.image.url}
                    alt={thread.linkMetadata.title || 'Vista previa'}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Información del enlace */}
              <div className="flex-1 min-w-0 pr-2 space-y-1">
                <div className="flex items-center space-x-1.5 text-xs text-blue-400 font-medium">
                  <span>🔗</span>
                  <span className="truncate">
                    {(() => {
                      try { return new URL(targetUrl).hostname; }
                      catch { return targetUrl; }
                    })()}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                  {thread.linkMetadata?.title || targetUrl}
                </h3>

                {thread.linkMetadata?.description && (
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {thread.linkMetadata.description}
                  </p>
                )}
              </div>
            </a>
          </div>
        )}

        {/* Etiquetas (Tags) */}
        {thread.tags && thread.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {thread.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-[#222] border border-gray-800 rounded-md text-xs text-gray-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Metadata Inferior */}
        <div className="text-xs text-gray-400 border-t border-gray-850 pt-3 flex items-center justify-between">
          <div>
            Autor: <strong className="text-gray-200">{thread.author.username}</strong>
          </div>
          <div>Votos: {thread.votes}</div>
        </div>
      </div>

      {/* Sección Respuestas */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-white border-b border-gray-850 pb-2">
          Respuestas ({thread.repliesCount || 0})
        </h3>

        <div>
          {!thread.replies || thread.replies.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No hay respuestas aún.</p>
          ) : (
            thread.replies.map((reply) => (
              <Comments key={reply.id} reply={reply} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}