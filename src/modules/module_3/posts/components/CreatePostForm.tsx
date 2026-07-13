"use client";

import { useState } from "react";
import { createPostAction } from "@module_3/posts/actions/post";

export default function CreatePostForm() {
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    const result = await createPostAction(formData);
    
    if (result.success) {
      setMessage("¡Post publicado con éxito!");
    } else {
      setMessage(result.error || "Ocurrió un error");
    }
  }

  return (
    <form action={handleSubmit} className="p-4 bg-gray-900 rounded-lg text-white">
      <h2 className="text-xl font-bold mb-4">Crear Publicación</h2>
      
      {/* Campo de Contenido */}
      <textarea
        name="postText"
        className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded"
        placeholder="¿Qué estás pensando?"
        required
      />

      {/* Campo de Enlace */}
      <input
        type="text"
        name="detectedUrl"
        className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded"
        placeholder="Enlace opcional..."
      />

      {/* NUEVO: Campo de Tags */}
      <input
        type="text"
        name="tags"
        className="w-full p-2 mb-2 bg-gray-800 border border-gray-600 rounded"
        placeholder="Tags (separados por comas, ej: udo, sistemas, examen)"
        required
      />
      <small className="block mb-4 text-gray-400">
        * Obligatorio: Separa tus etiquetas con comas.
      </small>

      {/* Campo de archivo */}
      <div className="mb-4">
        <input type="file" name="file" className="block w-full text-sm" />
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Publicar
      </button>

      {message && <p className="mt-4 text-center">{message}</p>}
    </form>
  );
}