'use client';

import {useState, useEffect} from 'react';
import { ObtenerHilo } from '@/modules/posts/actions/Hilo';
import { PublicacionesMock, RespuestaMock } from '@/modules/posts/services/datos-falsos';

interface VistaHiloProp{
    hiloId: string;
    onBack: () => void;
}

function Comentarios({respuesta, nivel = 0}: {respuesta: RespuestaMock, nivel?: number}) {
    const indentacion = nivel * 20;

    return(
        <div style={{marginLeft: `${indentacion}px`, borderLeft: '2px solid #ddd', padding: '10px', marginTop: '15px'}}>
            <div style={{fontSize: '12px', color: '#2487ff', marginBottom: '5px'}}>
                <strong>{respuesta.autor.nombreUsuario}</strong> • {respuesta.votos} votos
            </div>
            <p style={{margin: '0 0 10px 0', fontSize:'14px'}}>{respuesta.contenido}</p>

            <button style={{fontSize: '12px', padding:'2px 8px', cursor:'pointer'}}>Responder</button>

            {respuesta.respuestasAnidadas && respuesta.respuestasAnidadas.length > 0 && (
                <div style={{marginTop: '10px'}}>
                    {respuesta.respuestasAnidadas.map((hija) => (
                        <Comentarios key={hija.id} respuesta={hija} nivel={nivel + 1}/>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function VistaHilo({hiloId, onBack}: VistaHiloProp){
    const [hilo, setHilo] = useState<PublicacionesMock | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            const data = await ObtenerHilo(hiloId);
            setHilo(data);
            setCargando(false);
        };
        cargarDatos();
    }, [hiloId]);

    if (cargando) return <div style={{padding: '20px'}}>Cargando hilo</div>;

    if (!hilo) return(
        <div style={{padding: '20px'}}>
            <button onClick={onBack} style={{marginBottom: '15px', cursor: 'pointer'}}>← Volver Atras</button>
            <p>El Hilo no existe o fue eliminado.</p>
        </div>
    );

    const colorEstado = hilo.estado === 'Resuelto' ? 'green' : hilo.estado === 'Fijado' ? 'orange' : 'blue';

    return (
        <div style={{padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto'}}>
            <button
                onClick={onBack}
                style={{marginBottom: '20px', padding: '8px 16px', cursor: 'pointer', border: '1px solid #1900f6', borderRadius: '4px', backgroundColor: '#0f8593'}}
            >
                ← Volver Atras
            </button>

            <div style={{border: '1px solid #fcf6f6', padding: '20px', borderRadius: '8px', backgroundColor: '#424141'}}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fffbfb' }}>
                        F / {hilo.comunidad}
                    </span>
                    <span style={{ backgroundColor: colorEstado, color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                        {hilo.estado}
                    </span>
            

                <h1 style={{margin: '0 0 15px 0', fontSize: '24px'}}>{hilo.titulo}</h1>
                <p style={{ fontSize: '16px', lineHeight: '1.5' }}>{hilo.contenido}</p>
                
                <div style={{ marginTop: '15px', display: 'flex', gap: '5px' }}>
                    {hilo.tags.map(tag => (
                        <span key={tag} style={{ backgroundColor: '#818080', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>
                            #{tag}
                        </span>
                    ))}
                </div>
            
                <div style={{ marginTop: '20px', fontSize: '12px', color: '#fffafa', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                    Autor: <strong>{hilo.autor.nombreUsuario}</strong> • Votos: {hilo.votos}
                </div>            
            </div>

            <h3 style={{marginTop: '30px'}}>Respuestas({hilo.repuestasCount})</h3>
            <hr style={{marginBottom: '20px'}} />

            <div>
                {hilo.hiloRespuestas.length === 0 ? (
                    <p style={{ color: '#b6b6b6' }}>No hay respuestas aún.</p>
                ) : (
                    hilo.hiloRespuestas.map((respuesta) => (
                        <Comentarios key={respuesta.id} respuesta={respuesta} />
                    ))
                )}
            </div>
        </div>
    );
}