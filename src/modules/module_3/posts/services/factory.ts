import { IPostService } from './types';
import { MockPostService } from './mock-service';

export type ServiceType = 'mock' | 'supabase';

export class PostServiceFactory {
  static getService(type: ServiceType): IPostService {
    if (type === 'supabase') {
      // Cuando se migre al backend real, aquí retornaremos la implementación de Supabase.
      throw new Error('El servicio de Supabase no está implementado en este entorno de sandbox.');
    }
    // Retorna por defecto la implementación mockeada
    return MockPostService.getInstance();
  }
}
