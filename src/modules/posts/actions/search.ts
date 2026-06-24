'use server';

import { mockPublicaciones } from '@/modules/posts/services/datos-falsos'; 

// realiza la busqueda como parametro oblicatorio cualquier termino, la comunidad y los tags son metodos opcionales, la busqueda funciona solo con cualquier termino
export async function BuscarPublicaciones(termino:string, comunidad?:string, tags?: string[]) {
    try {
        if (!termino || termino.trim() === '') {
            return [];
        } // si no el parametro de termino que el obligatorio esta vacio, no se va a mostrar nada

        const busqueda = termino.trim().toLowerCase();

        await new Promise((resolve) => setTimeout(resolve, 500));
         // esto no es mucho solo a traves de los datos falsos se filtra segun los parametros de busqeda
        let resultdos = mockPublicaciones.filter((post) => {
            const coincideTermino =
                post.titulo.toLowerCase().includes(busqueda)||
                post.contenido.toLowerCase().includes(busqueda)||
                post.tags.some(tag => tag.toLowerCase().includes(busqueda));
            
            const coincideComunidad = comunidad ? post.comunidad === comunidad:true;

            const coincideTags = tags && tags.length > 0 ? tags.some(tag => post.tags.includes(tag)) : true;

            return coincideTermino && coincideComunidad && coincideTags;
        });

        resultdos.sort((a,b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime());
        return resultdos.slice(0,10);
    } catch (error) {
        console.error("Error al realizar la busqueda:", error);
        return[];
    }
    
}