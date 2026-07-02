'use client';

import {useState} from 'react';
import Buscador from "@/modules/posts/components/buscador";
import VistaHilo from '@/modules/posts/components/VistaHilo';

export default function Home() {
  const [hiloSeleccionado, setHiloSeleccionado] = useState<string | null>(null);

  const abrirHilo = (id: string) => {
    setHiloSeleccionado(id);
  };

  const cerrarHilo = () => {
    setHiloSeleccionado(null);
  };

  return (
    <main style={{backgroundColor: '#13161b', minHeight: '100vh', padding:'10px'}}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#1e1e1e', minHeight: '90vh', borderRadius: '8px'}}>
        {hiloSeleccionado ? ( 
          <VistaHilo 
            hiloId={hiloSeleccionado}
            onBack={cerrarHilo}
          />
        ): (
          <Buscador 
            onSeleccionarPost={abrirHilo}
          />
        )}
      </div>
    </main>
  )
}