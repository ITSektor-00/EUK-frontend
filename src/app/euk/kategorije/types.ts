export interface KategorijaT1 {
  kategorijaId?: number;
  naziv: string;
  [key: string]: string | number | boolean | undefined;
}

export interface KategorijaFormData {
  naziv: string;
  [key: string]: string | number | boolean | undefined;
}

export interface KategorijaResponse {
  content: KategorijaT1[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface KategorijaStatistics {
  totalRecords: number;
}

export interface KategorijaFilters {
  naziv?: string;
}