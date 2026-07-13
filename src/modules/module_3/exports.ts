// Contrato público de comunicación y exposición del Módulo 3

// Contenedor principal de la interfaz de usuario (composición)
export { default as Module3Container } from './components/ModuleContainer';

// Funciones expuestas para búsqueda
export { searchPosts } from './search/exports';

// 3. Datos y tipos expuestos para posts/hilos
export { mockPosts } from './posts/exports';
export type { MockPost, MockReply } from './posts/exports';

// 4. Servicios y Factoría de Datos
export { PostServiceFactory } from './posts/services/factory';
export type { IPostService } from './posts/services/types';
