// OДБИЈА СЕ Template Types

export interface OdbijaSeManualData {
    // Ručno uneti podaci
    predmet: string;
    datumDonosenjaResenja: string;
    brojResenja: string;
    datumOvlastenja: string;
    datumPodnosenja: string;
    
    // Podaci iz baze
    imePrezimeLica: string;
    ulicaIBroj: string;
    imePrezimePravnogLica: string;
    jmbgPravnogLica: string;
    adresaPravnogLica: string;
    imePrezimePodnosioca: string;
    jmbgPodnosioca: string;
    adresaPodnosioca: string;
    
    // Opciona polja
    dodatniTekst?: string;
    
    // Logička polja
    pribavljaDokumentaciju: boolean;
    vdPotpis: boolean;
    srPotpis: boolean;
}

export interface OdbijaSeTemplateRequest {
    liceId: number;
    liceTip: 't1' | 't2';
    kategorijaId: number;
    obrasciVrsteId: number;
    organizacionaStrukturaId: number;
    predmetId: number;
    manualData: OdbijaSeManualData;
}

export interface OdbijaSeTemplateResponse {
    predmetId: number;
    templateFilePath: string;
    templateStatus: 'generated' | 'error';
    templateGeneratedAt: string;
    message: string;
    success: boolean;
}

export interface Lice {
    id: number;
    ime: string;
    prezime: string;
    jmbg: string;
    ulicaIBroj: string;
    gradOpstina: string;
    pttBroj: string;
    mesto: string;
}

export interface Kategorija {
    id: number;
    naziv: string;
    skracenica: string;
}

export interface ObrasciVrste {
    id: number;
    naziv: string;
    opis?: string;
}

export interface OrganizacionaStruktura {
    id: number;
    naziv: string;
    opis?: string;
}

export interface Predmet {
    id: number;
    naziv: string;
    opis?: string;
}
