// Contrato público de comunicación y exposición del Módulo 3

// Contenedor principal de la interfaz de usuario (composición)
export { default as Module3Container } from './components/ModuleContainer';

// Funciones y componentes expuestos para búsqueda
export { searchPosts, SearchInput, SearchBox } from './search/exports';

// Componentes, datos y tipos expuestos para posts/hilos
export { mockPosts, PostList, ThreadView } from './posts/exports';
export type { MockPost, MockReply } from './posts/exports';

// Servicios y Factoría de Datos
export { PostServiceFactory } from './posts/services/factory';
export type { PostService } from './posts/services/types';
export { CreatePostProvider, useCreatePost } from './posts/exports';

