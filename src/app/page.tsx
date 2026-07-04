"use client";

import { useState, useRef, useEffect } from 'react';
import Buscador from "@/modules/posts/components/buscador";
import VistaHilo from '@/modules/posts/components/VistaHilo';
import { createPostAction } from "@/modules/posts/actions/post";
import { getLinkMetadata } from "@/modules/posts/actions/links"; // 👈 IMPORTANTE: Asegúrate de que esta ruta sea correcta

interface LinkMetadata {
  title: string;
  description: string;
  image: {
    url: string;
  };
}

export default function Home() {
  const [hiloSeleccionado, setHiloSeleccionado] = useState<string | null>(null);
  const [postText, setPostText] = useState("");
  const [urlInput, setUrlInput] = useState(""); // 👈 Estado para controlar el input de la URL
  const [tags, setTags] = useState("");
  
  // 👈 NUEVOS: Estados para controlar la miniatura en tiempo real
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const abrirHilo = (id: string) => setHiloSeleccionado(id);
  const cerrarHilo = () => setHiloSeleccionado(null);

  // 👈 NUEVO: Efecto que escucha el campo URL y genera la miniatura de inmediato
  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    if (urlInput.trim().match(urlRegex)) {
      const obtenerVistaPrevia = async () => {
        setLoadingMetadata(true);
        setMetadata(null);
        try {
          const data = await getLinkMetadata(urlInput.trim());
          if (data.success === 1 && data.meta) {
            setMetadata(data.meta);
          }
        } catch (err) {
          console.error("Error obteniendo metadatos:", err);
        } finally {
          setLoadingMetadata(false);
        }
      };

      // Pequeño retraso (debounce) para no saturar a peticiones mientras el usuario escribe
      const timeoutId = setTimeout(obtenerVistaPrevia, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setMetadata(null);
    }
  }, [urlInput]);

  const handlePublish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setActionError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    // Si el usuario cerró la miniatura con la "X", removemos la URL antes de enviar
    if (!metadata) {
      formData.delete("detectedUrl");
    }

    try {
      const res = await createPostAction(formData);

      if (!res.success) {
        setActionError(res.error || "Ocurrió un error al crear la publicación.");
      } else {
        setSuccessMessage("¡Publicación creada correctamente!");
        // Limpiamos todos los estados tras éxito
        setPostText("");
        setUrlInput("");
        setTags("");
        setMetadata(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err) {
      setActionError("Error al conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ backgroundColor: '#13161b', minHeight: '100vh', padding: '10px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#1e1e1e', minHeight: '90vh', borderRadius: '8px', padding: '20px' }} className="space-y-6">
        
        {hiloSeleccionado ? ( 
          <VistaHilo hiloId={hiloSeleccionado} onBack={cerrarHilo} />
        ) : (
          <>
            <Buscador onSeleccionarPost={abrirHilo} />

            <div className="w-full max-w-2xl mx-auto p-4 bg-[#121212] rounded-xl border border-gray-800 text-white space-y-4 mt-4">
              <h2 className="text-sm font-semibold text-gray-400">Crear Publicación</h2>
              
              <form onSubmit={handlePublish} className="space-y-3">
                {/* Cuadro de texto */}
                <textarea
                  name="postText"
                  placeholder="¿Qué estás pensando?"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  rows={3}
                  disabled={isSubmitting}
                  className="w-full p-3 border border-gray-750 bg-[#1a1a1a] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 resize-none text-sm disabled:opacity-50"
                />

                {/* Input URL (Modificado para controlar su estado) */}
                <input 
                  type="text" 
                  name="detectedUrl" 
                  placeholder="Enlace opcional (ej: https://github.com/...)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full p-2 bg-[#1a1a1a] border border-gray-750 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                />

                {/* Campo de Tags */}
                <input 
                  type="text" 
                  name="tags" 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Tags (ej: udo,sistemas,ayuda)"
                  className="w-full p-2 bg-[#1a1a1a] border border-gray-750 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  disabled={isSubmitting}
                />

                {/* Archivo */}
                <input 
                  type="file" 
                  name="file" 
                  ref={fileInputRef}
                  disabled={isSubmitting}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer disabled:opacity-50"
                />

                {/* 🎥 NUEVO: CONTENEDOR VISUAL DE LA MINIATURA (RENDER DE LA URL) */}
                {loadingMetadata && (
                  <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800 text-center text-xs text-gray-400 animate-pulse">
                    Generando vista previa del enlace...
                  </div>
                )}

                {metadata && !loadingMetadata && (
                  <div className="relative group mt-2">
                    {/* Botón para remover la previsualización */}
                    <button
                      type="button"
                      onClick={() => setMetadata(null)}
                      className="absolute top-2 right-2 z-10 bg-black/70 hover:bg-black text-white rounded-full p-1.5 text-xs transition border border-gray-700"
                      title="Quitar vista previa"
                    >
                      ✕
                    </button>

                    <a
                      href={urlInput}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block overflow-hidden bg-[#1a1a1a] rounded-xl border border-gray-800 hover:border-gray-700 transition"
                    >
                      {metadata.image.url && (
                        <div className="relative aspect-video w-full overflow-hidden bg-zinc-900 border-b border-gray-800">
                          <img
                            src={metadata.image.url}
                            alt={metadata.title}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="p-3 space-y-1">
                        <p className="text-[11px] text-gray-500 truncate">
                          {(() => {
                            try { return new URL(urlInput).hostname; } 
                            catch { return "Enlace"; }
                          })()}
                        </p>
                        <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-blue-400 transition">
                          {metadata.title || "Sin título"}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-2">
                          {metadata.description || "Sin descripción disponible."}
                        </p>
                      </div>
                    </a>
                  </div>
                )}

                {/* Mensajes de Feedback */}
                {actionError && (
                  <div className="p-2 bg-red-950/40 border border-red-800 rounded-md text-xs text-red-400">
                    {actionError}
                  </div>
                )}

                {successMessage && (
                  <div className="p-2 bg-emerald-950/40 border border-emerald-800 rounded-md text-xs text-emerald-400 text-center">
                    {successMessage}
                  </div>
                )}

                {/* Botón de Envío */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!postText.trim() || !tags.trim() || isSubmitting}
                    className="px-5 py-1.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-500 transition"
                  >
                    {isSubmitting ? "Publicando..." : "Publicar"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </main>
  );
}