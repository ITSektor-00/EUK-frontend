"use client";
import React, { useState, useEffect, useMemo } from "react";
import { UgrozenoLiceT1, UgrozenoLiceResponse } from '../ugrozena-lica/types';
import { UgrozenoLiceT2 } from '../ugrozeno-lice-t2/types';
import { useAuth } from '../../../contexts/AuthContext';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowSelectionModel } from '@mui/x-data-grid';
import { Paper } from '@mui/material';
import { apiService } from '../../../services/api';
import { API_BASE_URL } from '@/config/api';

// Funkcija za konverziju srpske latinice u ćirilicu
const latinToCyrillic = (text: string): string => {
  if (!text) return '';
  
  const latinToCyrillicMap: { [key: string]: string } = {
    'A': 'А', 'B': 'Б', 'V': 'В', 'G': 'Г', 'D': 'Д', 'Đ': 'Ђ', 'E': 'Е', 'Ž': 'Ж',
    'Z': 'З', 'I': 'И', 'J': 'Ј', 'K': 'К', 'L': 'Л', 'Lj': 'Љ', 'M': 'М', 'N': 'Н',
    'Nj': 'Њ', 'O': 'О', 'P': 'П', 'R': 'Р', 'S': 'С', 'T': 'Т', 'Ć': 'Ћ', 'U': 'У',
    'F': 'Ф', 'H': 'Х', 'C': 'Ц', 'Č': 'Ч', 'Dž': 'Џ', 'Š': 'Ш',
    'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д', 'đ': 'ђ', 'e': 'е', 'ž': 'ж',
    'z': 'з', 'i': 'и', 'j': 'ј', 'k': 'к', 'l': 'л', 'lj': 'љ', 'm': 'м', 'n': 'н',
    'nj': 'њ', 'o': 'о', 'p': 'п', 'r': 'р', 's': 'с', 't': 'т', 'ć': 'ћ', 'u': 'у',
    'f': 'ф', 'h': 'х', 'c': 'ц', 'č': 'ч', 'dž': 'џ', 'š': 'ш'
  };
  
  let result = text;
  
  // Specijalni slučajevi za dvočlane karaktere
  result = result.replace(/Dž/g, 'Џ').replace(/dž/g, 'џ');
  result = result.replace(/Lj/g, 'Љ').replace(/lj/g, 'љ');
  result = result.replace(/Nj/g, 'Њ').replace(/nj/g, 'њ');
  
  // Konverzija ostalih karaktera
  for (const [latin, cyrillic] of Object.entries(latinToCyrillicMap)) {
    result = result.replace(new RegExp(latin, 'g'), cyrillic);
  }
  
  return result;
};

// DODAJ OVO NA VRH KOMPONENTE
const getBaseURL = () => {
  // U Docker okruženju, NODE_ENV može biti 'production', pa koristimo NEXT_PUBLIC_API_URL
  // Docker kontejner je mapiran na port 8081, ne 8080
  return API_BASE_URL;
};

export default function StampanjePage() {
  const { token } = useAuth();
  const [ugrozenaLica, setUgrozenaLica] = useState<UgrozenoLiceT1[]>([]);
  const [ugrozenaLicaT2, setUgrozenaLicaT2] = useState<UgrozenoLiceT2[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingT2, setLoadingT2] = useState(false);
  // State za custom selekciju
  const [customSelectedIds, setCustomSelectedIds] = useState<Set<number>>(new Set());
  const [customSelectedIdsT2, setCustomSelectedIdsT2] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'}|null>(null);
  const [activeTab, setActiveTab] = useState<'euk-t1' | 'euk-t2'>('euk-t1');
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [previewLice, setPreviewLice] = useState<UgrozenoLiceT1 | null>(null);
  const [previewLiceT2, setPreviewLiceT2] = useState<UgrozenoLiceT2 | null>(null);

  // Toggle funkcije za selekciju
  const toggleRowSelection = (id: number) => {
    setCustomSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleRowSelectionT2 = (id: number) => {
    setCustomSelectedIdsT2(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Select all / Deselect all
  const toggleSelectAll = () => {
    if (customSelectedIds.size > 0) {
      setCustomSelectedIds(new Set());
    } else {
      const allIds = new Set(ugrozenaLica.map(lice => lice.ugrozenoLiceId).filter((id): id is number => Boolean(id)));
      setCustomSelectedIds(allIds);
    }
  };

  const toggleSelectAllT2 = () => {
    if (customSelectedIdsT2.size > 0) {
      setCustomSelectedIdsT2(new Set());
    } else {
      const allIds = new Set(ugrozenaLicaT2.map(lice => lice.ugrozenoLiceId).filter((id): id is number => Boolean(id)));
      setCustomSelectedIdsT2(allIds);
    }
  };
  
  // Filter states
  const [filters, setFilters] = useState({
    redniBroj: '',
    ime: '',
    prezime: '',
    jmbg: '',
    gradOpstina: '',
    mesto: '',
    osnovSticanjaStatusa: '',
    datumTrajanjaPravaOd: '',
    datumTrajanjaPravaDo: '',
    edBrojT1: '', // T1 filter
    edBroj: '' // T2 filter
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    fetchUgrozenaLica();
  }, []);

  // Load T2 data when T2 tab is active
  useEffect(() => {
    if (activeTab === 'euk-t2' && ugrozenaLicaT2.length === 0) {
      fetchUgrozenaLicaT2();
    }
  }, [activeTab]);

  // Auto-apply filters when they change
  useEffect(() => {
    const hasFilters = Object.values(filters).some(value => value && value.toString().trim() !== '');
    if (hasFilters) {
      setCurrentPage(0); // Reset to first page when filters change
    }
  }, [filters]);

  const fetchUgrozenaLica = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      
      // Učitaj sve podatke kroz više stranica da pokrijemo celu bazu
      let allUgrozenaLica: UgrozenoLiceT1[] = [];
      let currentPage = 0;
      let hasMoreData = true;
      
      while (hasMoreData) {
        const params = new URLSearchParams();
        params.append('size', '1000'); // Maksimalna dozvoljena veličina stranice
        params.append('page', currentPage.toString());
        
        const data: UgrozenoLiceResponse = await apiService.getUgrozenaLica(params.toString(), token!);
        const pageData = data.content || data;
        
        if (Array.isArray(pageData) && pageData.length > 0) {
          allUgrozenaLica = [...allUgrozenaLica, ...pageData];
          currentPage++;
          
          // Ako je broj rezultata manji od size, to je poslednja stranica
          if (pageData.length < 1000) {
            hasMoreData = false;
          }
        } else {
          hasMoreData = false;
        }
      }
      
      // 🔧 Privremeno mapiranje: edBrojMernogUredjaja -> edBroj
      const mappedData = allUgrozenaLica.map(item => ({
        ...item,
        edBroj: (item.edBrojMernogUredjaja || item.edBroj)?.toString() // Mapiraj edBrojMernogUredjaja na edBroj
      }));
      
      setUgrozenaLica(mappedData);
    } catch (err) {
      console.error('Error fetching ugrozena lica:', err);
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju');
      setToast({msg: 'Greška pri dohvatanju ugroženih lica', type: 'error'});
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchUgrozenaLicaT2 = async (showLoading = true) => {
    if (showLoading) setLoadingT2(true);
    setError(null);
    
    try {
      
      // Učitaj sve podatke kroz više stranica da pokrijemo celu bazu
      let allUgrozenaLicaT2: UgrozenoLiceT2[] = [];
      let currentPage = 0;
      let hasMoreData = true;
      
      while (hasMoreData) {
        const params = new URLSearchParams();
        params.append('size', '1000'); // Maksimalna dozvoljena veličina stranice
        params.append('page', currentPage.toString());
        
        const data = await apiService.getUgrozenaLicaT2(params.toString(), token!);
        const pageData = data.content || data;
        
        if (Array.isArray(pageData) && pageData.length > 0) {
          allUgrozenaLicaT2 = [...allUgrozenaLicaT2, ...pageData];
          currentPage++;
          
          // Ako je broj rezultata manji od size, to je poslednja stranica
          if (pageData.length < 1000) {
            hasMoreData = false;
          }
        } else {
          hasMoreData = false;
        }
      }
      
      setUgrozenaLicaT2(allUgrozenaLicaT2);
    } catch (err) {
      console.error('Error fetching ugrozena lica T2:', err);
      setError(err instanceof Error ? err.message : 'Greška pri učitavanju T2');
      setToast({msg: 'Greška pri dohvatanju ugroženih lica T2', type: 'error'});
    } finally {
      if (showLoading) setLoadingT2(false);
    }
  };

  const generatePDF = async (lice: UgrozenoLiceT1) => {
    try {
      const apiUrl = `${getBaseURL()}/api/generate-envelope-pdf`;
      console.log('PDF URL:', apiUrl);
      console.log('PDF Request data:', {
        template: 'T1',
        ugrozenaLica: [{
          ugrozenoLiceId: lice.ugrozenoLiceId,
          ime: lice.ime,
          prezime: lice.prezime,
          ulicaIBroj: lice.ulicaIBroj,
          pttBroj: lice.pttBroj,
          gradOpstina: lice.gradOpstina,
          mesto: lice.mesto
        }]
      });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          template: 'T1',
          ugrozenaLica: [{
            ugrozenoLiceId: lice.ugrozenoLiceId,
            ime: lice.ime,
            prezime: lice.prezime,
            ulicaIBroj: lice.ulicaIBroj,
            pttBroj: lice.pttBroj,
            gradOpstina: lice.gradOpstina,
            mesto: lice.mesto
          }]
        })
      });

      console.log('PDF Response status:', response.status);
      console.log('PDF Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP greška: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('PDF Blob size:', blob.size, 'bytes');
      
      // Backend automatski generiše ime fajla u Content-Disposition header-u
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ?.split('filename=')[1]
        ?.replace(/"/g, '') || 'koverte-t1.pdf';
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename; // Backend generisano ime
      a.click();

      // Čišćenje
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

    } catch (error) {
      console.error('Greška pri generisanju PDF-a:', error);
      setToast({msg: 'Greška pri generisanju PDF-a', type: 'error'});
    }
  };

  // Funkcija za generisanje PDF-a zadnje strane koverte (T1)
  const generateBackSidePDF = async (lice: UgrozenoLiceT1) => {
    try {
      const apiUrl = `${getBaseURL()}/api/generate-envelope-back-side-pdf`;
      console.log('Back Side PDF URL:', apiUrl);
      console.log('Back Side PDF Request data:', {
        template: 'T1',
        ugrozenaLica: [{
          ugrozenoLiceId: lice.ugrozenoLiceId,
          ime: lice.ime,
          prezime: lice.prezime,
          ulicaIBroj: lice.ulicaIBroj,
          pttBroj: lice.pttBroj,
          gradOpstina: lice.gradOpstina,
          mesto: lice.mesto
        }]
      });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          template: 'T1',
          ugrozenaLica: [{
            ugrozenoLiceId: lice.ugrozenoLiceId,
            ime: lice.ime,
            prezime: lice.prezime,
            ulicaIBroj: lice.ulicaIBroj,
            pttBroj: lice.pttBroj,
            gradOpstina: lice.gradOpstina,
            mesto: lice.mesto
          }]
        })
      });

      console.log('Back Side PDF Response status:', response.status);
      console.log('Back Side PDF Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP greška: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('Back Side PDF Blob size:', blob.size, 'bytes');
      
      // Backend automatski generiše ime fajla u Content-Disposition header-u
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ?.split('filename=')[1]
        ?.replace(/"/g, '') || 'koverte-zadnja-strana-t1.pdf';
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename; // Backend generisano ime
      a.click();

      // Čišćenje
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

    } catch (error) {
      console.error('Greška pri generisanju PDF-a zadnje strane:', error);
      setToast({msg: 'Greška pri generisanju PDF-a zadnje strane', type: 'error'});
    }
  };

  const handlePrint = (lice: UgrozenoLiceT1) => {
    generatePDF(lice);
  };

  const generateMultiplePDF = async (lica: UgrozenoLiceT1[]) => {
    try {
      const response = await fetch(`${getBaseURL()}/api/generate-envelope-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          template: 'T1',
          ugrozenaLica: lica.map(lice => ({
            ugrozenoLiceId: lice.ugrozenoLiceId,
            ime: lice.ime,
            prezime: lice.prezime,
            ulicaIBroj: lice.ulicaIBroj,
            pttBroj: lice.pttBroj,
            gradOpstina: lice.gradOpstina,
            mesto: lice.mesto
          }))
        })
      });

      console.log('PDF Response status:', response.status);
      console.log('PDF Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP greška: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('PDF Blob size:', blob.size, 'bytes');
      
      // Backend automatski generiše ime fajla u Content-Disposition header-u
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ?.split('filename=')[1]
        ?.replace(/"/g, '') || 'koverte-t1.pdf';
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename; // Backend generisano ime
      a.click();

    // Čišćenje
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);

    } catch (error) {
      console.error('Greška pri generisanju PDF-a:', error);
      setToast({msg: 'Greška pri generisanju PDF-a', type: 'error'});
    }
  };


  // Funkcija za štampu označenih lica (T1)
  const handlePrintSelected = async () => {
    if (customSelectedIds.size === 0) {
      return;
    }

    try {
      const selectedLica = ugrozenaLica.filter(lice => 
        lice.ugrozenoLiceId && customSelectedIds.has(lice.ugrozenoLiceId)
      );

      const apiUrl = `${getBaseURL()}/api/generate-envelope-pdf`;
      console.log('🔍 PDF Request URL:', apiUrl);
      console.log('🔍 Environment:', process.env.NODE_ENV);
      console.log('🔍 Base URL:', getBaseURL());
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          template: 'T1',
          ugrozenaLica: selectedLica.map(lice => ({
            ugrozenoLiceId: lice.ugrozenoLiceId,
            ime: lice.ime,
            prezime: lice.prezime,
            ulicaIBroj: lice.ulicaIBroj,
            pttBroj: lice.pttBroj,
            gradOpstina: lice.gradOpstina,
            mesto: lice.mesto
          }))
        })
      });

      console.log('🔍 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error:', errorText);
        throw new Error(`HTTP greška: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      console.log('✅ PDF Blob size:', blob.size, 'bytes');
      
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ?.split('filename=')[1]
        ?.replace(/"/g, '') || 'koverte-t1.pdf';
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

    } catch (error) {
      console.error('❌ Greška pri generisanju PDF-a:', error);
      setToast({msg: `Greška pri generisanju PDF-a: ${error instanceof Error ? error.message : 'Nepoznata greška'}`, type: 'error'});
    }
  };

  // Funkcija za štampu označenih lica - zadnja strana (T1)
  const handlePrintSelectedBackSide = async () => {
    if (customSelectedIds.size === 0) {
      return;
    }

    try {
      const selectedLica = ugrozenaLica.filter(lice => 
        lice.ugrozenoLiceId && customSelectedIds.has(lice.ugrozenoLiceId)
      );

      const response = await fetch(`${getBaseURL()}/api/generate-envelope-back-side-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          template: 'T1',
          ugrozenaLica: selectedLica.map(lice => ({
            ugrozenoLiceId: lice.ugrozenoLiceId,
            ime: lice.ime,
            prezime: lice.prezime,
            ulicaIBroj: lice.ulicaIBroj,
            pttBroj: lice.pttBroj,
            gradOpstina: lice.gradOpstina,
            mesto: lice.mesto
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP greška: ${response.status}`);
      }

      const blob = await response.blob();
      
      // Backend automatski generiše ime fajla u Content-Disposition header-u
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ?.split('filename=')[1]
        ?.replace(/"/g, '') || 'koverte-zadnja-strana-t1.pdf';
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename; // Backend generisano ime
      a.click();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);

    } catch (error) {
      console.error('Greška pri generisanju PDF-a zadnje strane:', error);
      setToast({msg: 'Greška pri generisanju PDF-a zadnje strane', type: 'error'});
    }
  };

  // Funkcija za štampu označenih lica (T2)
  const handlePrintSelectedT2 = async () => {
    if (customSelectedIdsT2.size === 0) {
      return;
    }

    try {
      const selectedLica = ugrozenaLicaT2.filter(lice => 
        lice.ugrozenoLiceId && customSelectedIdsT2.has(lice.ugrozenoLiceId)
      );

      const response = await fetch(`${getBaseURL()}/api/generate-envelope-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          template: 'T2',
          ugrozenaLica: selectedLica.map(lice => ({
            ugrozenoLiceId: lice.ugrozenoLiceId,
            ime: lice.ime,
            prezime: lice.prezime,
            ulicaIBroj: lice.ulicaIBroj,
            pttBroj: lice.pttBroj,
            gradOpstina: lice.gradOpstina,
            mesto: lice.mesto
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP greška: ${response.status}`);
      }

      const blob = await response.blob();
      
      // Backend automatski generiše ime fajla u Content-Disposition header-u
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ?.split('filename=')[1]
        ?.replace(/"/g, '') || 'koverte-t2.pdf';
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename; // Backend generisano ime
      a.click();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

    } catch (error) {
      console.error('Greška pri generisanju PDF-a:', error);
    }
  };

  // Funkcija za štampu označenih lica - zadnja strana (T2)
  const handlePrintSelectedBackSideT2 = async () => {
    if (customSelectedIdsT2.size === 0) {
      return;
    }

    try {
      const selectedLica = ugrozenaLicaT2.filter(lice => 
        lice.ugrozenoLiceId && customSelectedIdsT2.has(lice.ugrozenoLiceId)
      );

      const response = await fetch(`${getBaseURL()}/api/generate-envelope-back-side-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          template: 'T2',
          ugrozenaLica: selectedLica.map(lice => ({
            ugrozenoLiceId: lice.ugrozenoLiceId,
            ime: lice.ime,
            prezime: lice.prezime,
            ulicaIBroj: lice.ulicaIBroj,
            pttBroj: lice.pttBroj,
            gradOpstina: lice.gradOpstina,
            mesto: lice.mesto
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP greška: ${response.status}`);
      }

      const blob = await response.blob();
      
      // Backend automatski generiše ime fajla u Content-Disposition header-u
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ?.split('filename=')[1]
        ?.replace(/"/g, '') || 'koverte-zadnja-strana-t2.pdf';
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename; // Backend generisano ime
      a.click();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

    } catch (error) {
      console.error('Greška pri generisanju PDF-a zadnje strane T2:', error);
      setToast({msg: 'Greška pri generisanju PDF-a zadnje strane T2', type: 'error'});
    }
  };

  // T2 functions
  const generatePDFT2 = async (lice: UgrozenoLiceT2) => {
    try {
      const response = await fetch(`${getBaseURL()}/api/generate-envelope-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          template: 'T2',
          ugrozenaLica: [{
            ugrozenoLiceId: lice.ugrozenoLiceId,
            ime: lice.ime,
            prezime: lice.prezime,
            ulicaIBroj: lice.ulicaIBroj,
            pttBroj: lice.pttBroj,
            gradOpstina: lice.gradOpstina,
            mesto: lice.mesto
          }]
        })
      });

      console.log('PDF Response status:', response.status);
      console.log('PDF Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP greška: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('PDF Blob size:', blob.size, 'bytes');
      
      // Backend automatski generiše ime fajla u Content-Disposition header-u
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ?.split('filename=')[1]
        ?.replace(/"/g, '') || 'koverte-t2.pdf';
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename; // Backend generisano ime
      a.click();

    // Čišćenje
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);

    } catch (error) {
      console.error('Greška pri generisanju PDF-a T2:', error);
      setToast({msg: 'Greška pri generisanju PDF-a T2', type: 'error'});
    }
  };

  // Funkcija za generisanje PDF-a zadnje strane koverte (T2)
  const generateBackSidePDFT2 = async (lice: UgrozenoLiceT2) => {
    try {
      const apiUrl = `${getBaseURL()}/api/generate-envelope-back-side-pdf`;
      console.log('Back Side PDF T2 URL:', apiUrl);
      console.log('Back Side PDF T2 Request data:', {
        template: 'T2',
        ugrozenaLica: [{
          ugrozenoLiceId: lice.ugrozenoLiceId,
          ime: lice.ime,
          prezime: lice.prezime,
          ulicaIBroj: lice.ulicaIBroj,
          pttBroj: lice.pttBroj,
          gradOpstina: lice.gradOpstina,
          mesto: lice.mesto
        }]
      });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          template: 'T2',
          ugrozenaLica: [{
            ugrozenoLiceId: lice.ugrozenoLiceId,
            ime: lice.ime,
            prezime: lice.prezime,
            ulicaIBroj: lice.ulicaIBroj,
            pttBroj: lice.pttBroj,
            gradOpstina: lice.gradOpstina,
            mesto: lice.mesto
          }]
        })
      });

      console.log('Back Side PDF T2 Response status:', response.status);
      console.log('Back Side PDF T2 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP greška: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('Back Side PDF T2 Blob size:', blob.size, 'bytes');
      
      // Backend automatski generiše ime fajla u Content-Disposition header-u
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ?.split('filename=')[1]
        ?.replace(/"/g, '') || 'koverte-zadnja-strana-t2.pdf';
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename; // Backend generisano ime
      a.click();

      // Čišćenje
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

    } catch (error) {
      console.error('Greška pri generisanju PDF-a zadnje strane T2:', error);
      setToast({msg: 'Greška pri generisanju PDF-a zadnje strane T2', type: 'error'});
    }
  };



  const generateMultiplePDFT2 = async (lica: UgrozenoLiceT2[]) => {
    try {
      const response = await fetch(`${getBaseURL()}/api/generate-envelope-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          template: 'T2',
          ugrozenaLica: lica.map(lice => ({
            ugrozenoLiceId: lice.ugrozenoLiceId,
            ime: lice.ime,
            prezime: lice.prezime,
            ulicaIBroj: lice.ulicaIBroj,
            pttBroj: lice.pttBroj,
            gradOpstina: lice.gradOpstina,
            mesto: lice.mesto
          }))
        })
      });

      console.log('PDF Response status:', response.status);
      console.log('PDF Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP greška: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('PDF Blob size:', blob.size, 'bytes');
      
      // Backend automatski generiše ime fajla u Content-Disposition header-u
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ?.split('filename=')[1]
        ?.replace(/"/g, '') || 'koverte-t2.pdf';
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename; // Backend generisano ime
      a.click();

    // Čišćenje
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);

    } catch (error) {
      console.error('Greška pri generisanju PDF-a T2:', error);
      setToast({msg: 'Greška pri generisanju PDF-a T2', type: 'error'});
    }
  };

  // Filter pretraga - automatski se primenjuje kroz useEffect
  const handleFilterSearch = async () => {
    // Filteri se automatski primenjuju kroz useEffect
    // Ova funkcija je zadržana za kompatibilnost sa dugmetom
    console.log('Filters are applied automatically');
  };

  // Pagination functions
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0); // Reset to first page
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Apply filtering and pagination to data
  const filteredData = useMemo(() => {
    if (!ugrozenaLica || ugrozenaLica.length === 0) return [];
    let filtered = [...ugrozenaLica];
    
    // Apply filters
    if (filters.redniBroj.trim()) {
      filtered = filtered.filter(lice => 
        lice.redniBroj?.toLowerCase().includes(filters.redniBroj.toLowerCase())
      );
    }
    
    if (filters.ime.trim()) {
      filtered = filtered.filter(lice => 
        lice.ime?.toLowerCase().includes(filters.ime.toLowerCase())
      );
    }
    
    if (filters.prezime.trim()) {
      filtered = filtered.filter(lice => 
        lice.prezime?.toLowerCase().includes(filters.prezime.toLowerCase())
      );
    }
    
    if (filters.jmbg.trim()) {
      filtered = filtered.filter(lice => 
        lice.jmbg?.toLowerCase().includes(filters.jmbg.toLowerCase())
      );
    }
    
    if (filters.gradOpstina.trim()) {
      filtered = filtered.filter(lice => 
        lice.gradOpstina?.toLowerCase().includes(filters.gradOpstina.toLowerCase())
      );
    }
    
    if (filters.mesto.trim()) {
      filtered = filtered.filter(lice => 
        lice.mesto?.toLowerCase().includes(filters.mesto.toLowerCase())
      );
    }
    
    if (filters.osnovSticanjaStatusa.trim()) {
      filtered = filtered.filter(lice => 
        lice.osnovSticanjaStatusa === filters.osnovSticanjaStatusa
      );
    }
    
    if (filters.datumTrajanjaPravaOd.trim()) {
      filtered = filtered.filter(lice => {
        if (!lice.datumTrajanjaPrava) return false;
        const liceDate = new Date(lice.datumTrajanjaPrava);
        const filterDate = new Date(filters.datumTrajanjaPravaOd);
        return liceDate >= filterDate;
      });
    }
    
    if (filters.datumTrajanjaPravaDo.trim()) {
      filtered = filtered.filter(lice => {
        if (!lice.datumTrajanjaPrava) return false;
        const liceDate = new Date(lice.datumTrajanjaPrava);
        const filterDate = new Date(filters.datumTrajanjaPravaDo);
        return liceDate <= filterDate;
      });
    }
    
    if (filters.edBrojT1.trim()) {
      filtered = filtered.filter(lice => 
        lice.edBroj?.toString().toLowerCase().includes(filters.edBrojT1.toLowerCase())
      );
    }
    
    return filtered;
  }, [ugrozenaLica, filters]);

  // Apply filtering to T2 data
  const filteredDataT2 = useMemo(() => {
    if (!ugrozenaLicaT2 || ugrozenaLicaT2.length === 0) return [];
    let filtered = [...ugrozenaLicaT2];
    
    // Apply filters for T2
    if (filters.redniBroj.trim()) {
      filtered = filtered.filter(lice => 
        lice.redniBroj?.toLowerCase().includes(filters.redniBroj.toLowerCase())
      );
    }
    
    if (filters.ime.trim()) {
      filtered = filtered.filter(lice => 
        lice.ime?.toLowerCase().includes(filters.ime.toLowerCase())
      );
    }
    
    if (filters.prezime.trim()) {
      filtered = filtered.filter(lice => 
        lice.prezime?.toLowerCase().includes(filters.prezime.toLowerCase())
      );
    }
    
    if (filters.jmbg.trim()) {
      filtered = filtered.filter(lice => 
        lice.jmbg?.toLowerCase().includes(filters.jmbg.toLowerCase())
      );
    }
    
    if (filters.gradOpstina.trim()) {
      filtered = filtered.filter(lice => 
        lice.gradOpstina?.toLowerCase().includes(filters.gradOpstina.toLowerCase())
      );
    }
    
    if (filters.mesto.trim()) {
      filtered = filtered.filter(lice => 
        lice.mesto?.toLowerCase().includes(filters.mesto.toLowerCase())
      );
    }
    
    if (filters.edBroj.trim()) {
      filtered = filtered.filter(lice => 
        lice.edBroj?.toString().toLowerCase().includes(filters.edBroj.toLowerCase())
      );
    }
    
    return filtered;
  }, [ugrozenaLicaT2, filters]);

  // Apply pagination to filtered data
  const paginatedData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil((filteredData?.length || 0) / pageSize);

  const goToNextPage = () => {
    const maxPage = Math.ceil((filteredData?.length || 0) / pageSize) - 1;
    if (currentPage < maxPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Kolone definicije za EUK-T1 tab
  const columns: GridColDef[] = useMemo(() => ([
    { 
      field: 'ime', 
      headerName: 'Име', 
      width: 150,
      renderHeader: () => <span className="font-semibold text-gray-900">Име</span>
    },
    { 
      field: 'prezime', 
      headerName: 'Презиме', 
      width: 150,
      renderHeader: () => <span className="font-semibold text-gray-900">Презиме</span>
    },
    { 
      field: 'ulicaIBroj', 
      headerName: 'Улица и број', 
      width: 180,
      renderHeader: () => <span className="font-semibold text-gray-900">Улица и број</span>
    },
    { 
      field: 'pttBroj', 
      headerName: 'ПТТ број', 
      width: 100,
      renderHeader: () => <span className="font-semibold text-gray-900">ПТТ број</span>
    },
    { 
      field: 'gradOpstina', 
      headerName: 'Град/Општина', 
      width: 150,
      renderHeader: () => <span className="font-semibold text-gray-900">Град/Општина</span>
    },
    { 
      field: 'mesto', 
      headerName: 'Место', 
      width: 120,
      renderHeader: () => <span className="font-semibold text-gray-900">Место</span>
    },
  ]), []);

  // Dodaj custom checkbox kolonu na početak
  const columnsWithSelection: GridColDef[] = useMemo(() => [
    {
      field: 'customSelect',
      headerName: '',
      name: 'customSelect',
      width: 50,
      sortable: false,
      filterable: false,
      renderHeader: () => (
        <input
          type="checkbox"
          checked={customSelectedIds.size > 0 && customSelectedIds.size === ugrozenaLica.length}
          ref={checkbox => {
            if (checkbox) checkbox.indeterminate = customSelectedIds.size > 0 && customSelectedIds.size < ugrozenaLica.length;
          }}
          onChange={toggleSelectAll}
          className="cursor-pointer"
        />
      ),
      renderCell: (params: GridRenderCellParams) => (
        <input
          type="checkbox"
          checked={customSelectedIds.has(params.row.ugrozenoLiceId)}
          onChange={() => toggleRowSelection(params.row.ugrozenoLiceId)}
          className="cursor-pointer"
        />
      ),
    },
    ...columns
  ], [customSelectedIds, ugrozenaLica.length, toggleSelectAll, toggleRowSelection, columns]);

  // Kolone definicije za EUK-T2 tab
  const columnsT2: GridColDef[] = useMemo(() => ([
    { 
      field: 'ime', 
      headerName: 'Име', 
      width: 150,
      renderHeader: () => <span className="font-semibold text-gray-900">Име</span>
    },
    { 
      field: 'prezime', 
      headerName: 'Презиме', 
      width: 150,
      renderHeader: () => <span className="font-semibold text-gray-900">Презиме</span>
    },
    { 
      field: 'ulicaIBroj', 
      headerName: 'Улица и број', 
      width: 180,
      renderHeader: () => <span className="font-semibold text-gray-900">Улица и број</span>
    },
    { 
      field: 'pttBroj', 
      headerName: 'ПТТ број', 
      width: 100,
      renderHeader: () => <span className="font-semibold text-gray-900">ПТТ број</span>
    },
    { 
      field: 'gradOpstina', 
      headerName: 'Град/Општина', 
      width: 150,
      renderHeader: () => <span className="font-semibold text-gray-900">Град/Општина</span>
    },
    { 
      field: 'mesto', 
      headerName: 'Место', 
      width: 120,
      renderHeader: () => <span className="font-semibold text-gray-900">Место</span>
    },
    { 
      field: 'edBroj', 
      headerName: 'ЕД број', 
      width: 120,
      renderHeader: () => <span className="font-semibold text-gray-900">ЕД број</span>
    },
    { 
      field: 'pokVazenjaResenjaOStatusu', 
      headerName: 'Покриће важења решења', 
      width: 200,
      renderHeader: () => <span className="font-semibold text-gray-900">Покриће важења решења</span>
    },
  ]), []);

  // Dodaj custom checkbox kolonu na početak za T2
  const columnsWithSelectionT2: GridColDef[] = useMemo(() => [
    {
      field: 'customSelect',
      headerName: '',
      name: 'customSelect',
      width: 50,
      sortable: false,
      filterable: false,
      renderHeader: () => (
        <input
          type="checkbox"
          checked={customSelectedIdsT2.size > 0 && customSelectedIdsT2.size === ugrozenaLicaT2.length}
          ref={checkbox => {
            if (checkbox) checkbox.indeterminate = customSelectedIdsT2.size > 0 && customSelectedIdsT2.size < ugrozenaLicaT2.length;
          }}
          onChange={toggleSelectAllT2}
          className="cursor-pointer"
        />
      ),
      renderCell: (params: GridRenderCellParams) => (
        <input
          type="checkbox"
          checked={customSelectedIdsT2.has(params.row.ugrozenoLiceId)}
          onChange={() => toggleRowSelectionT2(params.row.ugrozenoLiceId)}
          className="cursor-pointer"
        />
      ),
    },
    ...columnsT2
  ], [customSelectedIdsT2, ugrozenaLicaT2.length, toggleSelectAllT2, toggleRowSelectionT2, columnsT2]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold transition ${toast.type==='success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}
      
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-[#3B82F6] rounded-lg flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="6,9 6,2 18,2 18,9"></polyline>
              <path d="M6,18H4a2,2 0 0,1 -2,-2V11a2,2 0 0,1 2,-2H20a2,2 0 0,1 2,2v5a2,2 0 0,1 -2,2H18"></path>
              <polyline points="6,14 6,18 18,18 18,14"></polyline>
            </svg>
          </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Штампање угрожених лица</h1>
              <p className="text-base text-gray-600">Управљање штампањем угрожених лица за ЕУК систем</p>
      </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('euk-t1')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 w-[140px] h-[44px] justify-center cursor-pointer ${
                activeTab === 'euk-t1'
                  ? 'bg-[#3B82F6] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ЕУК-Т1
            </button>
            <button
              onClick={() => setActiveTab('euk-t2')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 w-[140px] h-[44px] justify-center cursor-pointer ${
                activeTab === 'euk-t2'
                  ? 'bg-[#3B82F6] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ЕУК-Т2
            </button>
        </div>
      </div>

        {/* Tab Content */}
        {activeTab === 'euk-t1' ? (
          <>
      {/* Tabela ugroženih lica */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Изаберите угрожено лице за штампање</h2>
            <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#E5E7EB] text-[#1F2937] rounded-md hover:bg-[#D1D5DB] transition-colors duration-200 text-sm font-medium cursor-pointer"
                  >
                    Филтери
                  </button>
                  {customSelectedIds.size > 0 && (
                    <>
                      <button
                        onClick={handlePrintSelected}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 cursor-pointer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6,9 6,2 18,2 18,9"></polyline>
                          <path d="M6,18H4a2,2 0 0,1 -2,-2V11a2,2 0 0,1 2,-2H20a2,2 0 0,1 2,2v5a2,2 0 0,1 -2,2H18"></path>
                          <polyline points="6,14 6,18 18,18 18,14"></polyline>
                        </svg>
                        Штампај предњу страну ({customSelectedIds.size})
                      </button>
                      <button
                        onClick={handlePrintSelectedBackSide}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 cursor-pointer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6,9 6,2 18,2 18,9"></polyline>
                          <path d="M6,18H4a2,2 0 0,1 -2,-2V11a2,2 0 0,1 2,-2H20a2,2 0 0,1 2,2v5a2,2 0 0,1 -2,2H18"></path>
                          <polyline points="6,14 6,18 18,18 18,14"></polyline>
                        </svg>
                        Штампај задњу страну ({customSelectedIds.size})
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Filters Section */}
              {showFilters && (
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Филтери и претрага</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Филтери претражују целу базу података. Сви подаци се учитавају аутоматски.
                      </p>
                    </div>
                    
                    {/* Filter Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {/* Redni broj */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Редни број</label>
                        <input
                          type="text"
                          placeholder="Претражи по редном броју..."
                          value={filters.redniBroj}
                          onChange={(e) => setFilters(prev => ({ ...prev, redniBroj: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                        />
                      </div>

                      {/* Ime */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Име</label>
                        <input
                          type="text"
                          placeholder="Претражи по имену..."
                          value={filters.ime}
                          onChange={(e) => setFilters(prev => ({ ...prev, ime: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                        />
                      </div>

                      {/* Prezime */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Презиме</label>
                        <input
                          type="text"
                          placeholder="Претражи по презимену..."
                          value={filters.prezime}
                          onChange={(e) => setFilters(prev => ({ ...prev, prezime: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                        />
                      </div>

                      {/* JMBG */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ЈМБГ</label>
                        <input
                          type="text"
                          placeholder="Претражи по ЈМБГ-у..."
                          value={filters.jmbg}
                          onChange={(e) => setFilters(prev => ({ ...prev, jmbg: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                        />
                      </div>

                      {/* Grad/Opština */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Град/Општина</label>
                        <input
                          type="text"
                          placeholder="Претражи по граду/општини..."
                          value={filters.gradOpstina}
                          onChange={(e) => setFilters(prev => ({ ...prev, gradOpstina: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                        />
                      </div>

                      {/* Mesto */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Место</label>
                        <input
                          type="text"
                          placeholder="Претражи по месту..."
                          value={filters.mesto}
                          onChange={(e) => setFilters(prev => ({ ...prev, mesto: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                        />
                      </div>

                      {/* Osnov sticanja statusa */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Основ стицања статуса</label>
                        <select
                          value={filters.osnovSticanjaStatusa}
                          onChange={(e) => setFilters(prev => ({ ...prev, osnovSticanjaStatusa: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                        >
                          <option value="">Сви основи</option>
                          <option value="MP">MP</option>
                          <option value="NSP">NSP</option>
                          <option value="DD">DD</option>
                          <option value="UDTNP">UDTNP</option>
                        </select>
                      </div>

                      {/* Datum trajanja prava - OD */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Датум трајања права - ОД</label>
                        <input
                          type="date"
                          value={filters.datumTrajanjaPravaOd}
                          onChange={(e) => setFilters(prev => ({ ...prev, datumTrajanjaPravaOd: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                        />
                      </div>

                      {/* Datum trajanja prava - DO */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Датум трајања права - ДО</label>
                        <input
                          type="date"
                          value={filters.datumTrajanjaPravaDo}
                          onChange={(e) => setFilters(prev => ({ ...prev, datumTrajanjaPravaDo: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                          min={filters.datumTrajanjaPravaOd || new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      {/* ED Broj mernog uređaja - T1 */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ЕД број мерног уређаја</label>
                        <input
                          type="text"
                          placeholder="Претражи по ЕД броју мерног уређаја..."
                          value={filters.edBrojT1}
                          onChange={(e) => setFilters(prev => ({ ...prev, edBrojT1: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Акције</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setFilters({
                              redniBroj: '',
                              ime: '',
                              prezime: '',
                              jmbg: '',
                              gradOpstina: '',
                              mesto: '',
                              osnovSticanjaStatusa: '',
                              datumTrajanjaPravaOd: '',
                              datumTrajanjaPravaDo: '',
                              edBrojT1: '',
                              edBroj: ''
                            })}
                            className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium cursor-pointer text-sm"
                          >
                            Очисти
                          </button>
                          <button
                            onClick={handleFilterSearch}
                            className="flex-1 px-3 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-all duration-200 font-medium cursor-pointer text-sm"
                            title="Претражи целу базу података"
                          >
                            Претражи базу
              </button>
                        </div>
                      </div>
                    </div>
                  </div>
            </div>
          )}
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Учитавање угрожених лица...</p>
          </div>
        ) : (
                <Paper sx={{ height: 600, width: '100%' }}>
                  <DataGrid
                    rows={filteredData}
                    columns={columnsWithSelection}
                    getRowId={(row) => row.ugrozenoLiceId || Math.random()}
                    paginationModel={{ page: currentPage, pageSize: pageSize }}
                    onPaginationModelChange={(model) => {
                      setCurrentPage(model.page);
                      setPageSize(model.pageSize);
                    }}
                    pageSizeOptions={[10, 25, 50, 100]}
                    disableRowSelectionOnClick
                    disableColumnMenu
                    disableColumnSorting
                    sx={{ 
                      border: 0,
                      '& .MuiDataGrid-cell': {
                        display: 'flex',
                        alignItems: 'center'
                      },
                      '& .MuiDataGrid-columnHeader': {
                        '& .MuiDataGrid-menuIcon': {
                          display: 'none'
                        },
                        '& .MuiDataGrid-sortIcon': {
                          display: 'none'
                        },
                        '& .MuiDataGrid-columnMenuIcon': {
                          display: 'none'
                        },
                        '& .MuiDataGrid-iconButtonContainer': {
                          display: 'none'
                        },
                        '& .MuiDataGrid-sortIconContainer': {
                          display: 'none'
                        },
                        '& .MuiDataGrid-iconButton': {
                          display: 'none'
                        }
                      }
                    }}
                    slots={{
                      footer: () => (
                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <span className="text-sm text-gray-600">
                                Укупно: <span className="font-semibold text-gray-800">{ugrozenaLica.length}</span> угрожених лица
                              </span>
                              {filteredData.length !== ugrozenaLica.length && (
                                <span className="text-sm text-blue-600">
                                  Филтрирано: <span className="font-semibold text-gray-800">{filteredData.length}</span>
                                </span>
                              )}
                              {customSelectedIds.size > 0 && (
                                <span className="text-sm text-blue-600">
                                  Означено: <span className="font-semibold">{customSelectedIds.size}</span> за штампање
                                </span>
                              )}
                              {Object.values(filters).some(value => value && value.toString().trim() !== '') && (
                                <span className="text-sm text-blue-600">
                                  Активни филтери: <span className="font-semibold">{Object.values(filters).filter(v => v && v.toString().trim() !== '').length}</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4">
                              {/* Pagination Info */}
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span>Прикажи:</span>
                                <select 
                                  value={pageSize}
                                  className="px-2 py-1 border border-gray-300 rounded text-xs bg-white cursor-pointer"
                                  onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                                >
                                  <option value={25}>25</option>
                                  <option value={50}>50</option>
                                  <option value={100}>100</option>
                                </select>
                                <span>по страници</span>
                              </div>
                              
                              {/* Page Navigation */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={goToPreviousPage}
                                  disabled={currentPage === 0}
                                  className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                  </svg>
                                </button>
                                <span className="px-3 py-1 text-xs bg-white border border-gray-300 rounded">
                                  Страница {currentPage + 1} од {totalPages}
                                </span>
                      <button
                                  onClick={goToNextPage}
                                  disabled={currentPage >= totalPages - 1}
                                  className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                              </div>
                            </div>
                          </div>
          </div>
                      )
                    }}
                  />
                </Paper>
        )}
        
        {!loading && ugrozenaLica.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Нема угрожених лица</h3>
                  <p className="mt-1 text-sm text-gray-500">Додајте угрожена лица да бисте могли да их штампате.</p>
          </div>
        )}
            </div>
          </>
        ) : (
          /* EUK-T2 Tab - Potpuna implementacija */
          <>
            {/* Tabela ugroženih lica T2 */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Изаберите угрожено лице Т2 за штампање</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#E5E7EB] text-[#1F2937] rounded-md hover:bg-[#D1D5DB] transition-colors duration-200 text-sm font-medium cursor-pointer"
                  >
                    Филтери
                  </button>
                  {customSelectedIdsT2.size > 0 && (
                    <>
                      <button
                        onClick={handlePrintSelectedT2}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 cursor-pointer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6,9 6,2 18,2 18,9"></polyline>
                          <path d="M6,18H4a2,2 0 0,1 -2,-2V11a2,2 0 0,1 2,-2H20a2,2 0 0,1 2,2v5a2,2 0 0,1 -2,2H18"></path>
                          <polyline points="6,14 6,18 18,18 18,14"></polyline>
                        </svg>
                        Штампај предњу страну ({customSelectedIdsT2.size})
                      </button>
                      <button
                        onClick={handlePrintSelectedBackSideT2}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 cursor-pointer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6,9 6,2 18,2 18,9"></polyline>
                          <path d="M6,18H4a2,2 0 0,1 -2,-2V11a2,2 0 0,1 2,-2H20a2,2 0 0,1 2,2v5a2,2 0 0,1 -2,2H18"></path>
                          <polyline points="6,14 6,18 18,18 18,14"></polyline>
                        </svg>
                        Штампај задњу страну ({customSelectedIdsT2.size})
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Filters Section */}
              {showFilters && (
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Филтери и претрага Т2</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Филтери претражују целу базу података Т2. Сви подаци се учитавају аутоматски.
                      </p>
                    </div>
                    
                    {/* Filter Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {/* Redni broj */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Редни број</label>
                        <input
                          type="text"
                          placeholder="Претражи по редном броју..."
                          value={filters.redniBroj}
                          onChange={(e) => setFilters(prev => ({ ...prev, redniBroj: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                        />
                      </div>

                      {/* Ime */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Име</label>
                        <input
                          type="text"
                          placeholder="Претражи по имену..."
                          value={filters.ime}
                          onChange={(e) => setFilters(prev => ({ ...prev, ime: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                        />
                      </div>

                      {/* Prezime */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Презиме</label>
                        <input
                          type="text"
                          placeholder="Претражи по презимену..."
                          value={filters.prezime}
                          onChange={(e) => setFilters(prev => ({ ...prev, prezime: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                        />
                      </div>

                      {/* JMBG */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ЈМБГ</label>
                        <input
                          type="text"
                          placeholder="Претражи по ЈМБГ-у..."
                          value={filters.jmbg}
                          onChange={(e) => setFilters(prev => ({ ...prev, jmbg: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                        />
                      </div>

                      {/* Grad/Opština */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Град/Општина</label>
                        <input
                          type="text"
                          placeholder="Претражи по граду/општини..."
                          value={filters.gradOpstina}
                          onChange={(e) => setFilters(prev => ({ ...prev, gradOpstina: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                        />
                      </div>

                      {/* Mesto */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Место</label>
                        <input
                          type="text"
                          placeholder="Претражи по месту..."
                          value={filters.mesto}
                          onChange={(e) => setFilters(prev => ({ ...prev, mesto: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                        />
                      </div>

                      {/* ED Broj - T2 */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ЕД број</label>
                        <input
                          type="text"
                          placeholder="Претражи по ЕД броју..."
                          value={filters.edBroj}
                          onChange={(e) => setFilters(prev => ({ ...prev, edBroj: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-text"
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Акције</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setFilters({
                              redniBroj: '',
                              ime: '',
                              prezime: '',
                              jmbg: '',
                              gradOpstina: '',
                              mesto: '',
                              osnovSticanjaStatusa: '',
                              datumTrajanjaPravaOd: '',
                              datumTrajanjaPravaDo: '',
                              edBrojT1: '',
                              edBroj: ''
                            })}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                          >
                            Очисти филтере
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DataGrid */}
              {loadingT2 ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Учитавање података Т2...</p>
                </div>
              ) : (
                <Paper className="w-full">
                  <DataGrid
                    rows={filteredDataT2}
                    columns={columnsWithSelectionT2}
                    getRowId={(row) => row.ugrozenoLiceId || Math.random()}
                    paginationModel={{ page: currentPage, pageSize: pageSize }}
                    onPaginationModelChange={(model) => {
                      setCurrentPage(model.page);
                      setPageSize(model.pageSize);
                    }}
                    pageSizeOptions={[10, 25, 50, 100]}
                    disableRowSelectionOnClick
                    disableColumnMenu
                    disableColumnSorting
                    sx={{
                      border: 0,
                      '& .MuiDataGrid-cell': {
                        display: 'flex',
                        alignItems: 'center'
                      },
                      '& .MuiDataGrid-columnHeader': {
                        '& .MuiDataGrid-menuIcon': {
                          display: 'none'
                        },
                        '& .MuiDataGrid-sortIcon': {
                          display: 'none'
                        },
                        '& .MuiDataGrid-columnMenuIcon': {
                          display: 'none'
                        },
                        '& .MuiDataGrid-iconButtonContainer': {
                          display: 'none'
                        },
                        '& .MuiDataGrid-sortIconContainer': {
                          display: 'none'
                        },
                        '& .MuiDataGrid-iconButton': {
                          display: 'none'
                        }
                      }
                    }}
                    slots={{
                      footer: () => (
                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <span className="text-sm text-gray-600">
                                Укупно: <span className="font-semibold text-gray-800">{ugrozenaLicaT2.length}</span> угрожених лица Т2
                              </span>
                              {filteredDataT2.length !== ugrozenaLicaT2.length && (
                                <span className="text-sm text-blue-600">
                                  Филтрирано: <span className="font-semibold text-gray-800">{filteredDataT2.length}</span>
                                </span>
                              )}
                              {customSelectedIdsT2.size > 0 && (
                                <span className="text-sm text-blue-600">
                                  Означено: <span className="font-semibold">{customSelectedIdsT2.size}</span> за штампање
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4">
                              {/* Pagination Info */}
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span>Прикажи:</span>
                                <select 
                                  value={pageSize}
                                  className="px-2 py-1 border border-gray-300 rounded text-xs bg-white cursor-pointer"
                                  onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                                >
                                  <option value={25}>25</option>
                                  <option value={50}>50</option>
                                  <option value={100}>100</option>
                                </select>
                                <span>по страници</span>
                              </div>
                              
                              {/* Page Navigation */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={goToPreviousPage}
                                  disabled={currentPage === 0}
                                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Претходна
                                </button>
                                <span className="text-sm text-gray-600">
                                  Страна {currentPage + 1} од {Math.ceil(filteredDataT2.length / pageSize)}
                                </span>
                                <button
                                  onClick={goToNextPage}
                                  disabled={currentPage >= Math.ceil(filteredDataT2.length / pageSize) - 1}
                                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Следећа
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    }}
                  />
                </Paper>
              )}
              
              {!loadingT2 && ugrozenaLicaT2.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Нема угрожених лица Т2</h3>
                  <p className="mt-1 text-sm text-gray-500">Додајте угрожена лица Т2 да бисте могли да их штампате.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Preview Modal */}
      {previewLice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Преглед коверте - {previewLice.ime} {previewLice.prezime}
              </h3>
              <button
                onClick={() => setPreviewLice(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div 
                  className="relative border-2 border-gray-400 shadow-2xl bg-white"
                  style={{ 
                    width: '930px', // 246mm * 3.78 (mm to px conversion)
                    height: '662px', // 175mm * 3.78 (mm to px conversion)
                    background: 'white url(/picture/koverat.png) no-repeat center center',
                    backgroundSize: 'contain'
                  }}
                >
                  {/* Fiksni tekst - tačne pozicije u pikselima */}
                  <div className="absolute text-black font-bold" style={{ 
                    left: '57px', // 15mm * 3.78
                    top: '79px', // 21mm * 3.78
                    fontSize: '10pt',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    СЕКРЕТАРИЈАТ ЗА СОЦИЈАЛНУ ЗАШТИТУ
                  </div>
                  <div className="absolute text-black font-bold" style={{ 
                    left: '57px', // 15mm * 3.78
                    top: '117px', // 31mm * 3.78
                    fontSize: '10pt',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    27 МАРТА БР. 43-45
                  </div>
                  <div className="absolute text-black font-bold" style={{ 
                    left: '57px', // 15mm * 3.78
                    top: '155px', // 41mm * 3.78
                    fontSize: '10pt',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    11000 Београд
                  </div>
                  
                  {/* Podaci o licu - nova pozicioniranja sa ćirilicom */}
                  <div className="absolute text-black font-bold" style={{ 
                    left: '90mm', // Y osa - 90mm od leve ivice
                    top: '100mm', // X osa - 100mm od gornje ivice
                    fontSize: '12pt',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    {latinToCyrillic(previewLice.ime || '')} {latinToCyrillic(previewLice.prezime || '')}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setPreviewLice(null)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Затвори
                </button>
                <button
                  onClick={() => {
                    handlePrint(previewLice);
                    setPreviewLice(null);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Штампај предњу страну
                </button>
                <button
                  onClick={() => {
                    generateBackSidePDF(previewLice);
                    setPreviewLice(null);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Штампај задњу страну
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal T2 */}
      {previewLiceT2 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Преглед коверте Т2 - {previewLiceT2.ime} {previewLiceT2.prezime}
              </h3>
              <button
                onClick={() => setPreviewLiceT2(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div 
                  className="relative border-2 border-gray-400 shadow-2xl bg-white"
                  style={{ 
                    width: '930px', // 246mm * 3.78 (mm to px conversion)
                    height: '662px', // 175mm * 3.78 (mm to px conversion)
                    background: 'white url(/picture/koverat.png) no-repeat center center',
                    backgroundSize: 'contain'
                  }}
                >
                  {/* Fiksni tekst - tačne pozicije u pikselima */}
                  <div className="absolute text-black font-bold" style={{ 
                    left: '57px', // 15mm * 3.78
                    top: '79px', // 21mm * 3.78
                    fontSize: '10pt',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    СЕКРЕТАРИЈАТ ЗА СОЦИЈАЛНУ ЗАШТИТУ
                  </div>
                  <div className="absolute text-black font-bold" style={{ 
                    left: '57px', // 15mm * 3.78
                    top: '117px', // 31mm * 3.78
                    fontSize: '10pt',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    27 МАРТА БР. 43-45
                  </div>
                  <div className="absolute text-black font-bold" style={{ 
                    left: '57px', // 15mm * 3.78
                    top: '155px', // 41mm * 3.78
                    fontSize: '10pt',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    11000 Београд
                  </div>
                  
                  {/* Podaci o licu T2 - nova pozicioniranja sa ćirilicom */}
                  <div className="absolute text-black font-bold" style={{ 
                    left: '90mm', // Y osa - 90mm od leve ivice
                    top: '100mm', // X osa - 100mm od gornje ivice
                    fontSize: '12pt',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    {latinToCyrillic(previewLiceT2.ime || '')} {latinToCyrillic(previewLiceT2.prezime || '')}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setPreviewLiceT2(null)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Затвори
                </button>
                <button
                  onClick={() => {
                    generatePDFT2(previewLiceT2);
                    setPreviewLiceT2(null);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Штампај предњу страну
                </button>
                <button
                  onClick={() => {
                    generateBackSidePDFT2(previewLiceT2);
                    setPreviewLiceT2(null);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Штампај задњу страну
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
