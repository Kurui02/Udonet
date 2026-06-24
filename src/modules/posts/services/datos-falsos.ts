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
} //esto es la simulacion de la infomacion que conforma los post en la base de datos
    // no vi como ellos lo habran puesto, pueden ver y lo cambian o añaden lo que crean que falte
    // al final son datos falsos por los momentos pero es como deberia funcionar con la base de datos

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
    repuestasCount: 3
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
    repuestasCount: 1
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
    repuestasCount: 2
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
    repuestasCount: 0
  }
];