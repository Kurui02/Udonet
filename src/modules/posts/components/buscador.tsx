'use client';

import { useState } from 'react'; // nos va a permitir usar los estados para tener el control de la interfaz y su logica
import { BuscarPublicaciones } from '@/modules/posts/actions/search';
import { PublicacionesMock } from '@/modules/posts/services/datos-falsos'; 

interface BuscadorProp {
    onSeleccionarPost: (id: string) => void;
}

export default function Buscador({onSeleccionarPost}: BuscadorProp){
    const [termino, setTermino] = useState('');
    const [resultados, setResultados] = useState<PublicacionesMock[]>([]);
    const [cargando, setCargando] = useState(false);
    const [busqueda, setBusqueda] = useState(false);
    const [filtro, setFiltro] = useState('recientes');

    const manejarBusqueda = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!termino.trim()) return;

        setCargando(true);
        setBusqueda(true);

        try {
            const data = await BuscarPublicaciones(termino, undefined, undefined,filtro);
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
                style={{padding:'8px', width:'300px', marginRight: '10px',borderRadius: '4px', border: '1px solid #9b9b9b'}}
                />
                
                <select 
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    style={{padding:'8px', borderRadius: '4px', border: '1px solid #a7a7a7', color: '#b4b4b4'}}
                >
                    <option value="recientes">Más recientes</option>
                    <option value="votados">Más votados</option>
                    <option value="respuestas">Más respuestas</option>
                </select>

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
                                style={{border: '1px solid #d1cfcf', padding: '15px', marginBottom: '10px', borderRadius: '5px'}}                            
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{margin:'0 0 10px 0', fontSize: '18px'}}>{post.titulo}</h4>
                                    <button 
                                        onClick={() => onSeleccionarPost(post.id)}
                                        style={{padding: '4px 10px', backgroundColor: '#0070f3', color: '#white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                                    >
                                        Ver Hilo →
                                    </button>
                                </div>
                                <p style={{margin:'0 0 10px 0', fontSize: '14px', color:'#eeeded'}}>
                                    {post.contenido}
                                </p>
                                <div style={{ fontSize: '12px', color: '#cfcfcf' }}>
                                    <strong>Comunidad:</strong> {post.comunidad || 'General'} | {' '}
                                    <strong>Autor:</strong> {post.autor?.nombreUsuario} | {' '}
                                    <strong>Tags:</strong> {post.tags.join(', ')} | {' '}
                                    <strong>Votos:</strong> {post.votos} | {' '}
                                    <strong>Respuestas:</strong> {post.repuestasCount} | {' '}
                                    <strong>Estado:</strong> {post.estado}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}