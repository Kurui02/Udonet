"use client";

import { useState, useEffect } from "react";
import { getLinkMetadata } from "../actions/links";

interface LinkMetadata {
  title: string;
  description: string;
  image: {
    url: string;
  };
}

export default function LinkPreviewForm() {
  const [postText, setPostText] = useState("");
  const [detectedUrl, setDetectedUrl] = useState("");
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  // Expresión regular para detectar un enlace válido dentro del texto en tiempo real
  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = postText.match(urlRegex);

    if (match && match[0] !== detectedUrl) {
      const urlEncontrada = match[0];
      setDetectedUrl(urlEncontrada);
      obtenerVistaPrevia(urlEncontrada);
    } else if (!match) {
      // Si el usuario borra el enlace del texto, limpiamos la vista previa
      setDetectedUrl("");
      setMetadata(null);
    }
  }, [postText]);

  const obtenerVistaPrevia = async (url: string) => {
    setLoading(true);
    setMetadata(null);
    
    const data = await getLinkMetadata(url);
    
    if (data.success === 1 && data.meta) {
      setMetadata(data.meta);
    }
    setLoading(false);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Publicando:\nTexto: ${postText}\nEnlace embebido: ${detectedUrl || "Ninguno"}`);
    // Aquí puedes conectar luego la lógica de tu base de datos para guardar el post
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-[#121212] rounded-xl border border-gray-800 text-white space-y-4">
      <h2 className="text-sm font-semibold text-gray-400">Crear Publicación</h2>
      
      <form onSubmit={handlePublish} className="space-y-3">
        {/* Área de texto para la publicación */}
        <textarea
          placeholder="¿Qué estás pensando? (Puedes pegar un enlace aquí...)"
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          rows={3}
          className="w-full p-3 border border-gray-750 bg-[#1a1a1a] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 resize-none text-sm"
        />

        {/* CONTENEDOR DE LA VISTA PREVIA (Solo si hay carga o metadatos) */}
        {loading && (
          <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800 text-center text-xs text-gray-400 animate-pulse">
            Generando vista previa del enlace...
          </div>
        )}

        {metadata && !loading && (
          <div className="relative group">
            {/* Botón para remover la vista previa si el usuario no la quiere en su post */}
            <button
              type="button"
              onClick={() => setMetadata(null)}
              className="absolute top-2 right-2 z-10 bg-black/70 hover:bg-black text-white rounded-full p-1.5 text-xs transition border border-gray-700"
              title="Quitar vista previa"
            >
              ✕
            </button>

            <a
              href={detectedUrl}
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
                    try { return new URL(detectedUrl).hostname; } 
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

        {/* Botón de envío de la publicación */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!postText.trim()}
            className="px-5 py-1.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-500 transition"
          >
            Publicar
          </button>
        </div>
      </form>
    </div>
  );
}