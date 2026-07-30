"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { searchPosts } from '@module_3/search/actions/search';
import { getPostsAction } from '@module_3/posts/actions/post';
import { UnifiedPost } from '@module_3/posts/services/supabase-service';
import UserAvatar from '../../components/UserAvatar';
import { 
  UpvoteIcon, 
  DownvoteIcon, 
  PaperPlaneIcon, 
  ChevronRightIcon 
} from '../../components/icons';
import { formatDate } from '@/lib/utils/formatDate';

interface PostListProps {
  onSelectPost: (id: string) => void;
}

function PostCard({ post, onSelectPost }: { post: UnifiedPost; onSelectPost: (id: string) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estado neutral de votos (desactivados por defecto)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  // Estado del Popover de Tags (si hay más de 3)
  const [showAllTags, setShowAllTags] = useState(false);

  // Estado de la respuesta rápida
  const [quickReply, setQuickReply] = useState('');

  const authorName = post.author?.username || 'Anónimo';
  const authorCareer = post.author?.bio || 'Carrera'; // Fallback a Carrera si no tiene datos
  const communityBreadcrumb = `F / ${post.community_name || 'General'}`;
  const relativeDate = formatDate(post.created_at);

  const filter = searchParams.get('filter') || 'respondidos';

  const handleTagClick = (tag: string) => {
    const cleanTag = tag.replace('#', '');
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', cleanTag);
    params.set('filter', filter);
    router.push(`?${params.toString()}`);
  };

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUserVote(prev => prev === 'up' ? null : 'up');
  };

  const handleDownvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUserVote(prev => prev === 'down' ? null : 'down');
  };

  const handleQuickReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReply.trim()) return;
    alert(`Respuesta rápida enviada: "${quickReply}"`);
    setQuickReply('');
  };

  const tags = post.tags || [];
  const hasManyTags = tags.length > 3;
  const visibleTags = hasManyTags ? tags.slice(0, 2) : tags;

  return (
    <article className="bg-pure-white rounded-[30px] p-6 shadow-sm border border-white-gray hover:border-main-blue/40 transition-all font-candal font-normal">
      
      {/* 1. Cabecera Centrada del Post con Padding Proporcional (Edge-to-Edge Line) */}
      <div className="-mx-6 px-6 pt-1 pb-4 mb-4 border-b border-white-gray flex items-center justify-between gap-4">
        <h2 
          onClick={() => onSelectPost(post.id)}
          className="font-candal font-normal text-h4 text-main-black hover:text-main-blue transition-colors cursor-pointer leading-tight flex-1"
        >
          {post.title}
        </h2>

        <div className="flex items-center gap-2 shrink-0 text-alpha-black">
          <span className="font-candal font-normal text-tiny text-alpha-black">
            {communityBreadcrumb}
          </span>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); alert("Opciones de publicación"); }}
            className="font-candal font-normal text-p text-alpha-black hover:text-main-black cursor-pointer bg-transparent border-0 px-1"
          >
            •••
          </button>
        </div>
      </div>

      {/* 2. Fila del Autor (Nombre text-h4 alineado al top, Carrera text-h5 alineado al bottom) + Etiquetas (Derecha) */}
      <div className="flex items-center justify-between gap-4 mb-4">
        
        {/* Datos del Autor: Altura de 50px ajustada con justify-between para alinear al top y bottom del avatar (Imagen 1) */}
        <div className="flex items-center gap-3">
          <UserAvatar avatarUrl={post.author?.avatar_url} username={authorName} size="w-[50px] h-[50px]" />

          <div className="h-[50px] flex flex-col justify-between py-[1px]">
            <h4 className="font-candal font-normal text-h4 text-main-black leading-none m-0 p-0">
              {authorName}
            </h4>
            
            {/* DEUDA TÉCNICA MÓDULO 4: Reservado para <UserBadge reputation={post.author?.reputation} role={post.author?.role} /> */}
            <h5 className="font-candal font-normal text-h5 text-alpha-black leading-none m-0 p-0">
              {authorCareer}
            </h5>
          </div>
        </div>

        {/* Lista de Etiquetas Apiladas a la Derecha con Hover a Regular Blue / Pure White */}
        {tags.length > 0 && (
          <div className="relative flex flex-col items-end space-y-1 text-right shrink-0">
            {visibleTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTagClick(tag);
                }}
                className="px-2.5 py-0.5 rounded-full bg-lite-white text-main-black border border-white-gray hover:bg-regular-blue hover:text-pure-white transition-colors cursor-pointer border-0 font-open-sans font-extrabold text-extra-tiny"
              >
                #{tag}
              </button>
            ))}

            {hasManyTags && (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllTags(!showAllTags);
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-main-blue/15 text-main-blue hover:bg-regular-blue hover:text-pure-white transition-colors cursor-pointer border-0 font-open-sans font-extrabold text-extra-tiny"
                >
                  +{tags.length - 2} más ▾
                </button>

                {/* Popover de Tags Adicionales */}
                {showAllTags && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-1 bg-pure-white border border-white-gray rounded-[16px] p-2.5 shadow-lg z-50 flex flex-col gap-1 min-w-[120px]"
                  >
                    <span className="font-candal font-normal text-extra-tiny text-alpha-black border-b border-white-gray pb-1 px-1">
                      Todas las etiquetas
                    </span>
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setShowAllTags(false);
                          handleTagClick(tag);
                        }}
                        className="text-left px-2 py-1 rounded-md hover:bg-regular-blue hover:text-pure-white text-main-black font-open-sans font-extrabold text-extra-tiny transition-colors border-0 bg-transparent"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Contenido de la Publicación */}
      {post.content && (
        <p className="font-candal font-normal text-p text-lite-black leading-relaxed mb-4 line-clamp-3">
          {post.content}
        </p>
      )}

      {/* 4. Contador de Votos: Votos (+) en color Link (main-blue) y Votos (-) en Deep Orange */}
      <div className="flex items-center justify-between text-tiny font-candal font-normal mb-3">
        <div className="flex items-center gap-3">
          <span className="text-main-blue font-bold">
            {post.votes_count || 0} (+) votos
          </span>
          <span className="text-deep-orange font-bold">
            0 (-) votos
          </span>
        </div>

        <span className="text-alpha-black">{relativeDate}</span>
      </div>

      {/* 5. Barra Inferior Interactiva */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          
          {/* Botones de Votos Desactivados por Defecto (Flechas Imagen 2) */}
          <button 
            type="button" 
            onClick={handleUpvote}
            className="p-0 border-0 bg-transparent cursor-pointer hover:scale-105 transition-transform"
          >
            <UpvoteIcon active={userVote === 'up'} className="w-8 h-8" />
          </button>

          <button 
            type="button" 
            onClick={handleDownvote}
            className="p-0 border-0 bg-transparent cursor-pointer hover:scale-105 transition-transform"
          >
            <DownvoteIcon active={userVote === 'down'} className="w-8 h-8" />
          </button>

          {/* Input de Respuesta Rápida EXACTO a Imagen 3 (Fondo Lite-White, Borde 2px main-blue, Avión de Papel Delineado con Doblez) */}
          <form 
            onSubmit={handleQuickReplySubmit}
            onClick={(e) => e.stopPropagation()}
            className="hidden sm:flex items-center bg-lite-white rounded-full pl-5 pr-[3px] py-[3px] border-2 border-main-blue w-64 justify-between h-[42px]"
          >
            <input 
              type="text" 
              value={quickReply}
              onChange={(e) => setQuickReply(e.target.value)}
              placeholder="Escribe una respuesta..." 
              className="bg-transparent border-0 text-tiny font-candal font-normal text-main-black placeholder:text-alpha-black focus:outline-none flex-1 pr-2"
            />
            <button 
              type="submit"
              className="w-[34px] h-[34px] rounded-full bg-main-blue hover:bg-dark-main-blue flex items-center justify-center border-0 text-pure-white cursor-pointer shrink-0 transition-colors shadow-xs"
            >
              <PaperPlaneIcon className="w-4 h-4 text-pure-white" />
            </button>
          </form>
        </div>

        {/* Enlace Ver respuestas > con Texto text-alpha-black e Icono Chevron Bold Negro */}
        <button
          type="button"
          onClick={() => onSelectPost(post.id)}
          className="font-candal font-normal text-tiny text-alpha-black hover:text-main-black flex items-center gap-1.5 cursor-pointer transition-colors bg-transparent border-0 group"
        >
          <span>Ver respuestas</span>
          <ChevronRightIcon className="w-5 h-5 text-main-black group-hover:scale-110 transition-transform" />
        </button>
      </div>

    </article>
  );
}

export default function PostList({ onSelectPost }: PostListProps) {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<UnifiedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const query = searchParams.get('q') || '';
  const filter = searchParams.get('filter') || 'respondidos';

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let results: UnifiedPost[] = [];
        if (query.trim() === '') {
          results = await getPostsAction(filter);
        } else {
          const tags = query.includes(',') 
            ? query.split(',').map(t => t.trim().toLowerCase()) 
            : [];
          results = await searchPosts(query, undefined, tags, filter);
        }
        setPosts(results);
      } catch (error) {
        console.error("Error al cargar publicaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [query, filter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <div className="w-8 h-8 border-4 border-main-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="font-candal font-normal text-p text-alpha-black">Cargando publicaciones...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="p-10 bg-pure-white border border-white-gray rounded-[30px] text-center shadow-sm">
        <p className="font-candal font-normal text-p text-alpha-black">
          {query 
            ? `No se encontraron publicaciones para "${query}"` 
            : 'No hay publicaciones disponibles por el momento.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {query && (
        <p className="font-candal font-normal text-tiny text-alpha-black px-1">
          Resultados de búsqueda para: <span className="text-main-black font-candal font-normal">&quot;{query}&quot;</span>
        </p>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onSelectPost={onSelectPost} />
        ))}
      </div>
    </div>
  );
}