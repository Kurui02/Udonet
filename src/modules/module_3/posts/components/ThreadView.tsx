'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getThread } from '@module_3/posts/actions/thread';
import { addReplyAction } from '@module_3/posts/actions/reply';
import { UnifiedPost, DatabaseReply } from '@module_3/posts/services/supabase-service';
import UserAvatar from '../../components/UserAvatar';

interface ThreadViewProp {
  threadId: string;
  onBack: () => void;
}

const MockUsers = ['Alejandro', 'Joyce_Valerio', 'Dano', 'Keiber'];

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
    <div className="relative w-full mb-3">
      <textarea
        value={value}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        onClick={handleClick}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="w-full p-4 bg-lite-white border border-white-gray rounded-[20px] text-main-black font-candal font-normal text-p placeholder:font-candal placeholder:font-normal placeholder:text-alpha-black resize-none focus:outline-none border-0"
      />
      
      {suggestions.length > 0 && (
        <ul className="absolute top-full left-2 bg-pure-white border border-white-gray rounded-[14px] list-none py-1.5 mt-1 w-56 max-h-40 overflow-y-auto shadow-md z-50 font-candal font-normal">
          {suggestions.map(user => (
            <li
              key={user} 
              onClick={() => insertMention(user)}
              className="px-3.5 py-2 cursor-pointer text-tiny text-main-black flex items-center gap-2 hover:bg-lite-white transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-main-blue/20 flex items-center justify-center text-extra-tiny font-candal text-main-blue shrink-0">
                {user.charAt(0).toUpperCase()}
              </div>
              <span>{user}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const renderTextWithMentions = (text: string | null) => {
  if (!text) return null;
  const mentionRegex = /(@[\w_]+)/g;
  const parts = text.split(mentionRegex);

  return parts.map((part, index) => {
    if (part.match(mentionRegex)) {
      const username = part.substring(1); 
      return (
        <span 
          key={index} 
          className="text-regular-blue font-open-sans font-extrabold cursor-pointer hover:underline"
          onClick={() => alert(`Perfil del usuario: ${username}`)}
          title={`Ver perfil de ${username}`}
        >
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

function Comments({ reply, postId, onAddReply, level = 0 }: { reply: DatabaseReply; postId: string; onAddReply: () => void; level?: number }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const indentation = Math.min(level * 24, 96);

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
    <div style={{ marginLeft: `${indentation}px` }} className="border-l-2 border-white-gray p-4 mt-3 bg-lite-white rounded-[20px] shadow-sm">
      <div className="font-candal font-normal text-tiny text-gray-custom mb-2 flex justify-between items-center">
        <span><strong className="text-main-black font-candal font-normal">{reply.author?.username || 'Anónimo'}</strong> • {new Date(reply.created_at).toLocaleDateString()}</span>
      </div>
      
      <p className="mb-3 font-candal font-normal text-p text-lite-black whitespace-pre-wrap leading-relaxed">
        {renderTextWithMentions(reply.content)}
      </p>

      {/* Botones de Interacción */}
      <div className="flex items-center gap-4 text-tiny font-candal font-normal">
        <div className="flex items-center gap-1.5 bg-pure-white px-3 py-1 rounded-full border border-white-gray">
          <button type="button" onClick={() => alert("Lógica de votos (Módulo 4)")} className="bg-transparent border-0 text-regular-blue hover:text-dark-main-blue cursor-pointer font-bold transition-colors">↑</button>
          <span className="text-main-black font-candal font-normal px-0.5">{reply.vote_count || 0}</span>
          <button type="button" onClick={() => alert("Lógica de votos (Módulo 4)")} className="bg-transparent border-0 text-gray-custom hover:text-main-black cursor-pointer font-bold transition-colors">↓</button>
        </div>

        <button 
          type="button"
          onClick={() => setShowReplyBox(!showReplyBox)} 
          className="text-regular-blue hover:text-dark-main-blue font-candal font-normal cursor-pointer transition-colors bg-transparent border-0"
        >
          {showReplyBox ? 'Cancelar' : 'Responder'}
        </button>
      </div>

      {/* Caja para Responder */}
      {showReplyBox && (
        <form onSubmit={handleSubmitReply} className="mt-3 flex flex-col gap-2">
          <MentionTextarea
            value={replyContent}
            onChange={setReplyContent}
            placeholder={`Respondiendo a ${reply.author?.username || 'Anónimo'}...`}
            rows={2}
            disabled={isPending}
          />
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={!replyContent.trim() || isPending}
              className="px-4 py-2 bg-regular-blue hover:bg-dark-main-blue disabled:opacity-50 text-pure-white border-0 rounded-full text-tiny font-candal font-normal cursor-pointer transition-all"
            >
              {isPending ? 'Enviando...' : 'Enviar Respuesta'}
            </button>
          </div>
        </form>
      )}

      {/* Recursividad del Árbol N-Arbol de Respuestas */}
      {reply.nestedReplies && reply.nestedReplies.length > 0 && (
        <div className="mt-3 space-y-2">
          {reply.nestedReplies.map((child) => (
            <Comments key={child.id} reply={child} postId={postId} onAddReply={onAddReply} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ThreadView({ threadId, onBack }: ThreadViewProp) {
  const [thread, setThread] = useState<UnifiedPost | null>(null);
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
  }, [threadId]);

  const handleMainReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainReplyContent.trim() || !thread) return;

    startTransition(async () => {
      const res = await addReplyAction(thread.id, null, mainReplyContent);
      if (res.success) {
        setMainReplyContent('');
        setShowMainReplyBox(false);
        loadData();
      } else {
        alert(res.error);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <div className="w-8 h-8 border-4 border-regular-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="font-candal font-normal text-p text-gray-custom">Cargando publicación...</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="p-10 bg-pure-white border border-white-gray rounded-[30px] text-center space-y-4 shadow-sm">
        <button 
          type="button"
          onClick={onBack} 
          className="px-5 py-2.5 bg-lite-white hover:bg-white-gray text-main-black font-candal font-normal text-p rounded-full transition-all border border-white-gray cursor-pointer"
        >
          ← Volver Atrás
        </button>
        <p className="font-candal font-normal text-p text-gray-custom">La publicación no existe o fue eliminada.</p>
      </div>
    );
  }

  const firstLink = thread.links && thread.links.length > 0 ? thread.links[0] : null;
  const authorName = thread.author?.username || 'Anónimo';
  const authorRole = thread.author?.role || 'Profesor';
  const communityBreadcrumb = `F / ${thread.community_name || 'DCYS'}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Botón de Regresar */}
      <button 
        type="button"
        onClick={onBack} 
        className="px-5 py-2.5 bg-pure-white hover:bg-lite-white text-main-black font-candal font-normal text-p rounded-full border border-white-gray transition-all cursor-pointer shadow-sm flex items-center gap-2"
      >
        ← Volver a publicaciones
      </button>

      {/* Tarjeta Principal de la Publicación */}
      <div className="p-6 sm:p-8 bg-pure-white border border-white-gray rounded-[30px] space-y-5 shadow-sm">
        {/* Cabecera del Autor y Comunidad */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <UserAvatar avatarUrl={thread.author?.avatar_url} username={authorName} size="w-[50px] h-[50px]" />
            <div className="h-[50px] flex flex-col justify-between py-[1px]">
              <h4 className="font-candal font-normal text-h4 text-main-black leading-none m-0 p-0">
                {authorName}
              </h4>
              <h5 className="font-candal font-normal text-h5 text-alpha-black leading-none m-0 p-0">
                {thread.author?.bio || 'Carrera'}
              </h5>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {thread.is_pinned && (
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full font-candal font-normal text-extra-tiny bg-deep-orange/15 text-deep-orange border border-deep-orange/30">
                📌 Fijado
              </span>
            )}
            <span className="font-candal font-normal text-tiny text-gray-custom shrink-0">
              {communityBreadcrumb}
            </span>
          </div>
        </div>

        {/* Título y Contenido */}
        <h1 className="font-candal font-normal text-h3 text-main-black leading-tight">{thread.title}</h1>
        
        {thread.content && (
          <p className="font-candal font-normal text-p text-lite-black whitespace-pre-wrap leading-relaxed">
            {renderTextWithMentions(thread.content)}
          </p>
        )}

        {/* Previsualizador de Enlace */}
        {firstLink && (
          <div className="mt-4">
            <a 
              href={firstLink.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center overflow-hidden bg-lite-white rounded-[20px] border border-white-gray hover:border-regular-blue/50 transition group p-3 gap-4"
            >
              {firstLink.image_url && (
                <div className="relative w-28 h-24 sm:w-32 sm:h-24 flex-shrink-0 overflow-hidden rounded-[14px] bg-pure-white border border-white-gray">
                  <img 
                    src={firstLink.image_url} 
                    alt={firstLink.title || 'Vista previa'} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" 
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} 
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 pr-2 space-y-1 font-candal font-normal">
                <div className="flex items-center space-x-1.5 text-tiny text-regular-blue">
                  <span>🔗</span>
                  <span className="truncate">{(() => { try { return new URL(firstLink.url).hostname; } catch { return firstLink.url; } })()}</span>
                </div>
                <h3 className="font-candal font-normal text-p text-main-black group-hover:text-regular-blue transition-colors line-clamp-1">
                  {firstLink.title || firstLink.url}
                </h3>
                {firstLink.description && (
                  <p className="text-tiny text-gray-custom line-clamp-2 leading-relaxed">
                    {firstLink.description}
                  </p>
                )}
              </div>
            </a>
          </div>
        )}

        {/* Tags */}
        {thread.tags && thread.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {thread.tags.map((tag) => (
              <span 
                key={tag} 
                className="px-3 py-1 bg-regular-blue hover:bg-dark-main-blue text-pure-white font-open-sans font-extrabold text-tiny rounded-full transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Pie de la Publicación */}
        <div className="font-candal font-normal text-p text-gray-custom border-t border-white-gray pt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-main-black">
              <span className="text-regular-blue font-bold">↑</span> {thread.votes_count || 0} votos
            </span>
          </div>

          <button 
            type="button"
            onClick={() => setShowMainReplyBox(!showMainReplyBox)} 
            className="px-5 py-2.5 bg-regular-blue hover:bg-dark-main-blue text-pure-white font-candal font-normal text-p rounded-full transition-all cursor-pointer border-0 shadow-sm"
          >
            {showMainReplyBox ? 'Cancelar' : 'Responder al Hilo'}
          </button>
        </div>
      </div>
      
      {/* Caja para Comentar al Hilo Principal */}
      {showMainReplyBox && (
        <div className="p-6 bg-pure-white rounded-[30px] border border-white-gray shadow-sm space-y-3 font-candal font-normal">
          <h3 className="text-p font-candal font-normal text-main-black">Escribe tu respuesta al hilo principal</h3>
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
                className="px-5 py-2.5 bg-regular-blue hover:bg-dark-main-blue disabled:opacity-50 text-pure-white rounded-full text-p font-candal font-normal transition-all cursor-pointer border-0 shadow-sm"
              >
                {isPending ? 'Publicando...' : 'Comentar Hilo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Respuestas Anidadas (N-Árbol) */}
      <div className="space-y-4 pt-4 font-candal font-normal">
        <h3 className="text-h4 font-candal font-normal text-main-black border-b border-white-gray pb-3">
          Respuestas ({thread.replies_count || 0})
        </h3>
        <div>
          {!thread.replies || thread.replies.length === 0 ? (
            <p className="text-p font-candal font-normal text-gray-custom italic py-4">No hay respuestas aún. ¡Sé el primero en comentar!</p>
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