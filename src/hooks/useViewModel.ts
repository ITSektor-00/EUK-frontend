import { useEffect, useState } from 'react';
import { ViewModelFactory } from '../viewmodels/ViewModelFactory';

// Hook za korišćenje ViewModel-a u React komponentama
export function useViewModel<T>(
  data: any[],
  createViewModel: (data: any) => T
): T[] {
  const [viewModels, setViewModels] = useState<T[]>([]);

  useEffect(() => {
    try {
      const newViewModels = data.map(item => createViewModel(item));
      setViewModels(newViewModels);
    } catch (error) {
      console.error('Greška pri kreiranju ViewModel-a:', error);
    }
  }, [data, createViewModel]);

  return viewModels;
}

// Specijalizovani hook-ovi za različite tipove entiteta
export function useUgrozenoLiceViewModels(data: any[]): any[] {
  return useViewModel(data, (item) => ViewModelFactory.createUgrozenoLiceViewModel(item));
}

export function usePredmetViewModels(data: any[]): any[] {
  return useViewModel(data, (item) => ViewModelFactory.createPredmetViewModel(item));
}

export function useKategorijaViewModels(data: any[]): any[] {
  return useViewModel(data, (item) => ViewModelFactory.createKategorijaViewModel(item));
}

export function useUgrozenoLiceT2ViewModels(data: any[]): any[] {
  return useViewModel(data, (item) => ViewModelFactory.createUgrozenoLiceT2ViewModel(item));
}
