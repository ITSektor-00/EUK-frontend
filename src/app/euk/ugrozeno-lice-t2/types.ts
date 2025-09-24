export interface UgrozenoLiceT2 {
  ugrozenoLiceId?: number;
  redniBroj: string;
  ime: string;
  prezime: string;
  jmbg: string;
  pttBroj?: string;
  gradOpstina?: string;
  mesto?: string;
  ulicaIBroj?: string;
  edBroj?: string;
  pokVazenjaResenjaOStatusu?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UgrozenoLiceT2FormData {
  redniBroj: string;
  ime: string;
  prezime: string;
  jmbg: string;
  pttBroj?: string;
  gradOpstina?: string;
  mesto?: string;
  ulicaIBroj?: string;
  edBroj?: string;
  pokVazenjaResenjaOStatusu?: string;
  [key: string]: any;
}

export interface UgrozenoLiceT2Response {
  content: UgrozenoLiceT2[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
