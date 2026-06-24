'use client';

import { useState } from 'react'; // nos va a permitir usar los estados para tener el control de la interfaz y su logica
import { BuscarPublicaciones } from '@/modules/posts/actions/search';
import { PublicacionesMock } from '@/modules/posts/services/datos-falsos'; 

export default function Buscador(){
    const [termino, setTermino] = useState('');
    const [resultados, setResultados] = useState<PublicacionesMock[]>([]);
    const [cargando, setCargando] = useState(false);
    const [busqueda, setBusqueda] = useState(false);

    const manejarBusqueda = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!termino.trim()) return;

        setCargando(true);
        setBusqueda(true);

        try {
            const data = await BuscarPublicaciones(termino);
            setResultados(data);
        } catch (error) {
            console.error("Error en la búsqueda:", error);
            alert("Hubo un error al realizar la búsqueda.");
        } finally {
            setCargando(false);
        }
    };

    return(
        <div style={{padding:'20px', fontFamily: 'sans-serif'}}>
            <h2>Buscador</h2>

            <form onSubmit={manejarBusqueda} style={{marginBottom: '20px'}}>
                <input 
                type="text" 
                placeholder="Busca por titulo, comunidad o tag"
                value={termino}
                onChange={(e) => setTermino(e.target.value)}
                style={{padding:'8px', width:'300px', marginRight: '10px'}}
                />
                <button type="submit" disabled={cargando} style={{padding:'8px 16px'}}>
                    {cargando ? 'Buscando...' : 'Buscar'}
                </button>
            </form>

            <hr />

            <div style={{marginTop: '20px'}}>
                <h3>Resultados: </h3>

                {cargando && <p>Cargando Publicacones</p>}

                {!cargando && busqueda && resultados.length=== 0 && (
                    <p>No se encontraron publicaciones para "{termino}"</p>
                )}

                {!cargando && resultados.length >0 && (
                    <ul style={{listStyle:'none', padding:'0'}}>
                        {resultados.map((post) => (
                            <li
                                key={post.id}
                                style={{border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '5px'}}                            
                            >
                                <h4 style={{margin:'0 0 10px 0'}}>{post.titulo}</h4>
                                <p style={{margin:'0 0 10px 0', fontSize: '14px', color:'#555'}}>
                                    {post.contenido}
                                </p>
                                <div style={{ fontSize: '12px', color: '#888' }}>
                                    <strong>Autor:</strong> {post.autor?.nombreUsuario} | {' '}
                                    <strong>Tags:</strong> {post.tags.join(', ')} | {' '}
                                    <strong>Votos:</strong> {post.votos}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}