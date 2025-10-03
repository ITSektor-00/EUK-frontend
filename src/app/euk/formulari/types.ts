export interface KategorijaDto {
  kategorijaId: number;
  naziv: string;
  skracenica: string;
}

export interface FormularDto {
  formularId: number;
  naziv: string;
  opis: string;
  kategorijaId: number;
  kategorijaNaziv: string;
  kategorijaSkracenica: string;
  datumKreiranja: string;
  datumAzuriranja: string;
  aktivna: boolean;
  verzija: number;
  createdById: number;
  createdByUsername: string;
  updatedById: number;
  updatedByUsername: string;
  polja: FormularPoljeDto[];
  brojPolja: number;
}

export interface FormularPoljeDto {
  poljeId: number;
  formularId: number;
  formularNaziv: string;
  nazivPolja: string;
  label: string;
  tipPolja: string;
  obavezno: boolean;
  redosled: number;
  placeholder: string;
  opis: string;
  validacija: string;
  opcije: string;
  defaultVrednost: string;
  readonly: boolean;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PredmetFormularPodaciDto {
  podatakId: number;
  predmetId: number;
  predmetNaziv: string;
  poljeId: number;
  poljeNaziv: string;
  poljeLabel: string;
  poljeTip: string;
  vrednost: string;
  datumUnosa: string;
  unioKorisnikId: number;
  unioKorisnikUsername: string;
}
