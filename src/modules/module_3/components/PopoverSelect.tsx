"use client";

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, SearchIcon } from './icons';

export interface SelectOption {
  id: string;
  name: string;
}

export interface PopoverSelectProps {
  label?: string;
  options: SelectOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  showSearchInput?: boolean;
  searchPlaceholder?: string;
  titleHeader?: string;
  popoverWidth?: string;
  originTop?: boolean;
  buttonClassName?: string;
}

export default function PopoverSelect({
  label,
  options,
  selectedValue,
  onSelect,
  showSearchInput = false,
  searchPlaceholder = "Buscar...",
  titleHeader,
  popoverWidth = "w-44",
  originTop = true,
  buttonClassName,
}: PopoverSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptionName =
    options.find((option) => option.id === selectedValue)?.name || label || "Seleccionar";

  const headerTitle = titleHeader || label || "Opciones";

  const defaultButtonClass =
    "bg-lite-white hover:bg-white-gray text-main-black font-candal font-normal text-extra-tiny px-3.5 py-1 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer border-0";

  // Si tiene label fijo (ej: "Temas:", "Popular:"), muestra solo el label. Si no, muestra el valor seleccionado.
  const displayLabel = label || selectedOptionName;

  return (
    <div className="relative inline-block">
      {/* Botón Desplegable */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClassName || defaultButtonClass}
      >
        <span>{displayLabel}</span>
        {isOpen ? (
          <ChevronUpIcon className="w-[9px] h-[5px] text-main-black" />
        ) : (
          <ChevronDownIcon className="w-[9px] h-[5px] text-main-black" />
        )}
      </button>

      {/* Popover Card Desplegable */}
      {isOpen && (
        <div
          className={`absolute left-0 ${
            originTop ? 'top-0' : 'top-full mt-2'
          } z-50 ${popoverWidth} bg-lite-white rounded-[10px] p-2.5 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] border-0 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-100 font-candal font-normal`}
        >
          {/* Cabecera del Popover */}
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="font-candal font-normal text-extra-tiny text-main-black">{headerTitle}</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-extra-tiny text-main-black cursor-pointer font-candal font-normal pl-2"
            >
              <ChevronUpIcon className="w-[9px] h-[5px] text-main-black" />
            </button>
          </div>

          {/* Lista de Opciones */}
          <div className="max-h-36 overflow-y-auto space-y-1 my-1.5 pr-0.5">
            {filteredOptions.length === 0 ? (
              <p className="text-extra-tiny font-candal font-normal text-gray-custom text-center py-1">
                Sin resultados
              </p>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onSelect(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full font-candal font-normal text-extra-tiny py-1 px-2.5 rounded-full text-center transition-all cursor-pointer block truncate ${
                    selectedValue === option.id
                      ? 'bg-regular-blue text-pure-white'
                      : 'bg-white-gray hover:bg-gray-blue text-main-black'
                  }`}
                >
                  {option.name}
                </button>
              ))
            )}
          </div>

          {/* Mini Buscador Opcional */}
          {showSearchInput && (
            <div className="relative mt-1.5 pt-1.5 border-t border-white-gray flex items-center">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white-gray text-main-black font-candal font-normal text-extra-tiny pl-2.5 pr-7 py-1 rounded-full focus:outline-none placeholder:text-alpha-black placeholder:font-candal placeholder:font-normal border-0"
              />
              <SearchIcon className="absolute right-2.5 w-[18px] h-[18px] text-lite-black pointer-events-none" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
