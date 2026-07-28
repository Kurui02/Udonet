'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getThread } from '@module_3/posts/actions/thread';
import { addReplyAction } from '@module_3/posts/actions/reply';
import { MockPost, MockReply } from '@module_3/posts/services/mock-data';

interface ThreadViewProp {
  threadId: string;
  onBack: () => void;
}

const MockUsers = [
  'Alejandro','Joyce_Valerio', 'Dano', 'Keiber'
];

interface MentionTextareaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}

function MentionTextarea({ value, onChange, placeholder, disabled, rows }: MentionTextareaProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [mentionQuery, setMentionQuery] = useState({ start: -1, text: '' });

  const checkMention = (text: string, cursor: number) => {
    const textBeforeCursor = text.slice(0, cursor);
    const match = textBeforeCursor.match(/(?:^|\s)@(\w*)$/);

    if (match) {
      const search = match[1].toLowerCase();
      const filtered = MockUsers.filter(u => u.toLowerCase().includes(search));
      setSuggestions(filtered);
      setMentionQuery({ start: cursor - match[1].length, text: match[1] });
    } else {
      setSuggestions([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    checkMention(e.target.value, e.target.selectionStart);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    checkMention(value, (e.target as HTMLTextAreaElement).selectionStart);
  };

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    checkMention(value, (e.target as HTMLTextAreaElement).selectionStart);
  };

  const insertMention = (username: string) => {
    const beforeAt = value.slice(0, mentionQuery.start - 1);
    const endOfQuery = mentionQuery.start + mentionQuery.text.length;
    const afterCursor = value.slice(endOfQuery);
    
    const newValue = `${beforeAt}@${username} ${afterCursor}`;
    onChange(newValue);
    setSuggestions([]);
  };

  return (
    <div className="relative w-full mb-2.5">
      <textarea
        value={value}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        onClick={handleClick}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-md text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      {suggestions.length > 0 && (
        <ul className="absolute top-full left-2.5 bg-gray-800 border border-gray-600 rounded-lg list-none py-1 mt-1 w-56 max-h-40 overflow-y-auto shadow-xl z-50">
          {suggestions.map(user => (
            <li
              key={user}
              onClick={() => insertMention(user)}
              className="px-3 py-2 cursor-pointer text-xs text-gray-200 flex items-center gap-2 hover:bg-gray-700 transition-colors"
            >
              <div className="w-5.5 h-5.5 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                {user.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{user}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const renderTextWithMentions = (text: string) => {
  const mentionRegex = /(@[\w_]+)/g;
  const parts = text.split(mentionRegex);

  return parts.map((part, index) => {
    if (part.match(mentionRegex)) {
      const username = part.substring(1); 
      return (
        <span 
          key={index} 
          className="text-blue-400 font-semibold cursor-pointer hover:underline"
          onClick={() => alert(`Esto redigiria al perfil del usuario: ${username}`)}
          title={`Ver perfil de ${username}`}
        >
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};


function Comments({ reply,postId,onAddReply,level = 0 }: { reply: MockReply; postId: string; onAddReply:() => void; level?: number }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const indentation = Math.min(level * 20, 80);

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    startTransition(async () => {
      const res = await addReplyAction(postId, reply.id, replyContent);
      if (res.success) {
        setReplyContent('');
        setShowReplyBox(false);
        onAddReply();
      } else {
        alert(res.error);
      }
    });
  };

  return (
        <div style={{ marginLeft: `${indentation}px` }} className="border-l-2 border-gray-700 p-3 mt-3 bg-zinc-900 rounded-md">
            <div className="text-xs text-blue-400 mb-1.5 flex justify-between items-center">
                <span><strong>{reply.author.username}</strong> • {new Date(reply.createdAt).toLocaleDateString()}</span>
            </div>
            
            <p className="mb-2.5 text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
              {renderTextWithMentions(reply.content)}
            </p>

            {/* BOTONES DE INTERACCIÓN */}
            <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                    <button 
                        onClick={() => alert("Lógica de votos(Módulo 4)")} 
                        className="bg-transparent border-0 text-zinc-400 hover:text-white cursor-pointer font-bold transition-colors"
                    >
                        ▲
                    </button>
                    <span className="text-white font-bold px-0.5">{reply.votes}</span>
                    <button 
                        onClick={() => alert("Lógica de votos(Módulo 4)")} 
                        className="bg-transparent border-0 text-zinc-400 hover:text-white cursor-pointer font-bold transition-colors"
                    >
                        ▼
                    </button>
                </div>

                <button 
                    onClick={() => setShowReplyBox(!showReplyBox)} 
                    className="bg-transparent border-0 text-blue-500 hover:text-blue-400 cursor-pointer font-semibold transition-colors"
                >
                    {showReplyBox ? 'Cancelar' : 'Responder'}
                </button>
            </div>

            {/* CAJA DE TEXTO PARA RESPONDER*/}
            {showReplyBox && (
                <form onSubmit={handleSubmitReply} className="mt-2.5 flex flex-col gap-2">
                    
                    <MentionTextarea
                      value={replyContent}
                      onChange={setReplyContent}
                      placeholder={`Respondiendo a ${reply.author.username}...`}
                      rows={2}
                      disabled={isPending}
                    />
                    <div className="flex justify-end">
                        <button 
                            type="submit" 
                            disabled={!replyContent.trim() || isPending}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-bold transition-all cursor-pointer"
                        >
                            {isPending ? 'Enviando...' : 'Enviar Respuesta'}
                        </button>
                    </div>
                </form>
            )}

            {/* RECURSIVIDAD DE RESPUESTAS */}
            {reply.nestedReplies && reply.nestedReplies.length > 0 && (
                <div className="mt-2 space-y-2">
                    {reply.nestedReplies.map((child) => (
                        <Comments key={child.id} reply={child} postId={postId} onAddReply={onAddReply} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ThreadView({ threadId, onBack }: ThreadViewProp) {
  const [thread, setThread] = useState<MockPost | null>(null);
  const [loading, setLoading] = useState(true);

  const [showMainReplyBox, setShowMainReplyBox] = useState(false);
  const [mainReplyContent, setMainReplyContent] = useState('');
  const [isPending, startTransition] = useTransition();

   const loadData = async () => {
    const data = await getThread(threadId);
    setThread(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [threadId])

  const handleMainReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainReplyContent.trim() || !thread) return;

    startTransition(async () => {
      const res = await addReplyAction(thread.id, null, mainReplyContent);
      if (res.success) {
        setMainReplyContent('');
        setShowMainReplyBox(false);
        loadData(); // Recargamos para sincronizar cambios persistidos
      } else {
        alert(res.error);
      }
    });
  };

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

        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
          {renderTextWithMentions(thread.content)}
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
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowMainReplyBox(!showMainReplyBox)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-xs"
            >
              {showMainReplyBox ? 'Cancelar' : 'Responder al Hilo'}
            </button>

            <div className="flex items-center gap-1.5 bg-gray-900 px-2.5 py-1 rounded-md border border-gray-700">
              <button 
                onClick={() => alert("Lógica de votos (Módulo 4)")} 
                className="bg-transparent border-0 text-gray-400 hover:text-white cursor-pointer font-bold text-sm transition-colors"
              >
                ▲
              </button>
              <span className="font-bold text-white">{thread.votes}</span>
              <button 
                onClick={() => alert("Lógica de votos (Módulo 4)")} 
                className="bg-transparent border-0 text-gray-400 hover:text-white cursor-pointer font-bold text-sm transition-colors"
              >
                ▼
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* CAJA DE TEXTO PARA EL HILO PRINCIPAL */}
      {showMainReplyBox && (
        <div className="p-4 bg-[#1f2937] rounded-xl border border-gray-700 shadow-md">
          <h3 className="text-sm font-semibold mb-2">Escribe tu respuesta</h3>
          <form onSubmit={handleMainReplySubmit}>
            <MentionTextarea 
              value={mainReplyContent}
              onChange={setMainReplyContent}
              placeholder="Escribe lo que piensas sobre este hilo..."
              rows={3}
              disabled={isPending}
            />
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={!mainReplyContent.trim() || isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-xs font-bold transition-all cursor-pointer"
              >
                {isPending ? 'Publicando...' : 'Comentar Hilo'}
              </button>
            </div>
          </form>
        </div>
      )}

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
              <Comments key={reply.id} reply={reply} postId={thread.id} onAddReply={loadData} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}