'use client';

import { useState } from 'react'; // nos va a permitir usar los estados para tener el control de la interfaz y su logica
import { searchPosts } from '@module_3/search/actions/search';
import { MockPost } from '@module_3/posts/exports'; 

interface SearchBoxProps {
    onSelectPost: (id: string) => void;
}

export default function SearchBox({onSelectPost}: SearchBoxProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<MockPost[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('recientes'); // Valor inicial: Más recientes

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setSearchQuery(searchTerm); // guardamos el termino buscado
        try {
            // Mapeamos los tags que el usuario podria escribir usando comas
            const tags = searchTerm.includes(',') 
                ? searchTerm.split(',').map(t => t.trim().toLowerCase()) 
                : [];
            
            // llamamos a la funcion del servidor pasándole el termino, comunidad opcional y filtros
            const data = await searchPosts(searchTerm, undefined, tags, filter);
            setResults(data);
        } catch (error) {
            console.error("Error en la búsqueda:", error);
            alert("Hubo un error al realizar la búsqueda.");
        } finally {
            setLoading(false);
        }
    };

    return(
        <div style={{padding:'20px', fontFamily: 'sans-serif'}}>
            <h2>Buscador</h2>

            <form onSubmit={handleSearch} style={{marginBottom: '20px'}}>
                <input 
                type="text" 
                placeholder="Busca por titulo, comunidad o tag"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{padding:'8px', width:'300px', marginRight: '10px',borderRadius: '4px', border: '1px solid #9b9b9b'}}
                />
                
                <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{padding:'8px', borderRadius: '4px', border: '1px solid #a7a7a7', color: '#b4b4b4'}}
                >
                    <option value="recientes">Más recientes</option>
                    <option value="votados">Más votados</option>
                    <option value="respuestas">Más respuestas</option>
                </select>

                <button type="submit" disabled={loading} style={{padding:'8px 16px'}}>
                    {loading ? 'Buscando...' : 'Buscar'}
                </button>
            </form>

            <hr />

            <div style={{marginTop: '20px'}}>
                <h3>Resultados: </h3>

                {loading && <p>Cargando Publicacones</p>}

                {!loading && searchQuery && results.length === 0 && (
                    <p>No se encontraron publicaciones para &quot;{searchTerm}&quot;</p>
                )}

                {!loading && results.length > 0 && (
                    <ul style={{listStyle:'none', padding:'0'}}>
                        {results.map((post) => (
                            <li
                                key={post.id}
                                onClick={() => onSelectPost(post.id)}
                                style={{
                                    padding: '15px',
                                    border: '1px solid #787777',
                                    marginBottom: '10px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    backgroundColor: '#7e7d7d',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.backgroundColor = '#909090';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.backgroundColor = '#7e7d7d';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{margin: '0 0 5px 0', color: '#2487ff'}}>{post.title}</h4>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectPost(post.id);
                                        }}
                                        style={{
                                            padding: '4px 10px', 
                                            backgroundColor: '#0070f3', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '4px', 
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Ver Hilo →
                                    </button>
                                </div>
                                <p style={{margin: '0 0 10px 0', fontSize: '13px', color: '#fffdfd'}}>{post.content}</p>
                                <div style={{fontSize: '11px', color: '#fff9f9'}}>
                                    <strong>Comunidad:</strong> {post.community || 'General'} | {' '}
                                    <strong>Autor:</strong> {post.author?.username} | {' '}
                                    <strong>Tags:</strong> {post.tags.join(', ')} | {' '}
                                    <strong>Votos:</strong> {post.votes} | {' '}
                                    <strong>Respuestas:</strong> {post.repliesCount} | {' '}
                                    <strong>Estado:</strong> {post.status}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}