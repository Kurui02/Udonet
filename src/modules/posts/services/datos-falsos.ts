export interface PublicacionesMock {
    id:string;
    titulo:string;
    contenido:string;
    comunidad:string;
    tags:string[];
    autor: { nombreUsuario: string;};
    fechaCreacion: Date;
    votos: number;
    repuestasCount: number;
    estado: 'Abierto' | 'Resuelto' | 'Fijado'
    hiloRespuestas: RespuestaMock[];
} //esto es la simulacion de la infomacion que conforma los post en la base de datos
    // no vi como ellos lo habran puesto, pueden ver y lo cambian o añaden lo que crean que falte
    // al final son datos falsos por los momentos pero es como deberia funcionar con la base de datos

export interface RespuestaMock {
    id: string;
    autor: { nombreUsuario: string;};
    contenido:string;
    fechaCreacion: Date;
    votos: number;
    respuestasAnidadas? : RespuestaMock[];
}
export const mockPublicaciones: PublicacionesMock[] = [
  {
    id: 'post_001',
    titulo: '¿Dónde está básico?',
    contenido: 'Me llamo leonel, soy nuevo ingreso y tengo que ver una materia en basico, llevo dando vueltas en circulos pero no se como llegar. Ayudenmeeeeee :Cccc',
    comunidad: 'Laudopoo',
    tags: ['Medicina', 'Básico'],
    autor: { nombreUsuario: 'Leonel' },
    fechaCreacion: new Date('2026-06-20T10:00:00Z'),
    votos: 50,
    repuestasCount: 3,
    estado : 'Resuelto',
    hiloRespuestas: [
      {
                id: 'resp_1',
                autor: { nombreUsuario: 'Joyce Valerio' },
                contenido: '¡Hola! El edificio de básico está justo detrás de la biblioteca central. No tiene pérdida.',
                fechaCreacion: new Date('2026-06-20T10:15:00Z'),
                votos: 12,
                respuestasAnidadas: [
                    {
                        id: 'resp_1_1',
                        autor: { nombreUsuario: 'Leonel' },
                        contenido: '¡Muchas gracias! Ya lo encontré. Me salvaste.',
                        fechaCreacion: new Date('2026-06-20T10:20:00Z'),
                        votos: 2,
                    }
                ]
            },
            {
                id: 'resp_2',
                autor: { nombreUsuario: 'Nepthali' },
                contenido: 'Sigue a la multitud de nuevo ingreso, todos van para allá jaja.',
                fechaCreacion: new Date('2026-06-20T10:18:00Z'),
                votos: 5,
            }
    ]
  }, // utilice lo de los mockups para hacer la prueba
  {
    id: 'post_002',
    titulo: 'Odio Sistemas',
    contenido: 'Me metí a Sistemas sin saber lo que estaba haciendo y ahora me arrepentí, quiero saber cómo puedo reparar mi error y cambiarme a la mejor carrera de todas, Ingeniería en Computación, alguien sabe cómo puedo iniciar el proceso???',
    comunidad: 'General',
    tags: ['Sistemas', 'Computación', 'General'],
    autor: { nombreUsuario: 'Nepthali' },
    fechaCreacion: new Date('2026-06-21T14:30:00Z'),
    votos: 50,
    repuestasCount: 1,
    estado: 'Fijado',
    hiloRespuestas:[]
  },
  {
    id: 'post_003',
    titulo: 'Transistores BJT',
    contenido: 'Un transistor BJT (Transistor de Unión Bipolar) es un componente electrónico semiconductor que funciona como amplificador o interruptor.',
    comunidad: 'F / DCYS',
    tags: ['Electrónica', 'Computación', 'Sistemas'],
    autor: { nombreUsuario: 'Prof. Alfredo Marot' },
    fechaCreacion: new Date('2026-06-22T08:15:00Z'),
    votos: 15,
    repuestasCount: 2,
    estado: 'Abierto',
    hiloRespuestas:[
      {
                id: 'resp_3',
                autor: { nombreUsuario: 'Dano' },
                contenido: 'Deben Aplicar la teoria para entender los transistores BJT.',
                fechaCreacion: new Date('2026-06-22T09:00:00Z'),
                votos: 30,
            }
    ]
  },
  {
    id: 'post_004',
    titulo: 'Demasiado fácil POO',
    contenido: 'Chicos, pasé POO, ya no tengo que ver más esa materia. Qué cursitos de programación recomiendan ver después de haber pasado POO chi???',
    comunidad: 'Laudopoo',
    tags: ['Sistemas', 'Computación', 'POO'],
    autor: { nombreUsuario: 'Nepthali' },
    fechaCreacion: new Date('2026-06-23T19:45:00Z'),
    votos: 50,
    repuestasCount: 0,
    estado:'Resuelto',
    hiloRespuestas: [
      {
                id: 'resp_4',
                autor: { nombreUsuario: 'Prof. Alfredo Marot' },
                contenido: 'Debes aplicar el cambio de carrera.',
                fechaCreacion: new Date('2026-06-22T09:00:00Z'),
                votos: 30, 
            },
      {
                id: 'resp_5',
                autor: { nombreUsuario: 'Admin_UDONET' },
                contenido: 'Esta publicacion sera eliminida.',
                fechaCreacion: new Date('2026-06-22T09:00:00Z'),
                votos: 30,
                respuestasAnidadas: [
                  {
                    id: 'resp_6',
                  autor: { nombreUsuario: 'Keiber' },
                  contenido: '¿Alguien me explica de forma sencilla que es POO?.',
                  fechaCreacion: new Date('2026-06-20T10:18:00Z'),
                  votos: 5,
                  }
                ]
            }
            
    ]
  }
];