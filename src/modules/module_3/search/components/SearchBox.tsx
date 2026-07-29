"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PopoverSelect from '../../components/PopoverSelect';
import SearchInput from './SearchInput';

export default function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Inicializar estados desde los parámetros de búsqueda de la URL
  const queryParam = searchParams.get('q') || '';
  const filterParam = searchParams.get('filter') || 'popular';

  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [filter, setFilter] = useState(filterParam);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Opciones de Temas y Filtros Populares
  const topicOptions = [
    { id: 'Sistemas', name: 'Sistemas' },
    { id: 'Computación', name: 'Computación' },
    { id: 'Básico', name: 'Básico' },
  ];

  const popularOptions = [
    { id: 'popular', name: 'Más Populares' },
    { id: 'recientes', name: 'Más Recientes' },
    { id: 'votados', name: 'Más Votados' },
  ];

  // Clase para botones
  const filterButtonClass =
    "h-[42px] bg-lite-white hover:bg-white-gray text-main-black font-candal font-normal text-p px-5 rounded-full flex items-center gap-3 transition-colors cursor-pointer border-0";

  // Sincronizar estados con los parámetros URL cuando cambian externamente
  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
    setFilter(searchParams.get('filter') || 'popular');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim());
    } else {
      params.delete('q');
    }
    params.set('filter', filter);
    
    router.push(`?${params.toString()}`);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    const params = new URLSearchParams(searchParams.toString());
    params.set('filter', newFilter);
    router.push(`?${params.toString()}`);
  };

  const handleTagClick = (tag: string) => {
    const cleanTag = tag.replace('#', '');
    if (selectedTag === cleanTag) {
      setSelectedTag(null);
      setSearchTerm('');
    } else {
      setSelectedTag(cleanTag);
      setSearchTerm(`#${cleanTag}`);
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', cleanTag);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-pure-white rounded-[30px] p-5 sm:p-6 shadow-sm border border-white-gray w-full mb-6">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Campo Principal de Búsqueda */}
        <div className="flex-1 w-full min-w-[200px]">
          <SearchInput
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Selector Desplegable de Temas */}
        <div className="relative">
          <PopoverSelect
            label="Temas:"
            options={topicOptions}
            selectedValue={selectedTag || ''}
            onSelect={(val) => handleTagClick(val)}
            titleHeader="Temas"
            showSearchInput={true}
            searchPlaceholder="Buscar..."
            popoverWidth="w-44"
            originTop={false}
            buttonClassName={filterButtonClass}
          />
        </div>

        {/* Selector Desplegable de Popularidad */}
        <div className="relative">
          <PopoverSelect
            label="Popular:"
            options={popularOptions}
            selectedValue={filter}
            onSelect={(val) => handleFilterChange(val)}
            titleHeader="Popular"
            popoverWidth="w-48"
            originTop={false}
            buttonClassName={filterButtonClass}
          />
        </div>

      </form>
    </div>
  );
}