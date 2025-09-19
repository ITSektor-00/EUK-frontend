"use client";
import React, { useState, useEffect } from "react";
// import Image from 'next/image';
import { UgrozenoLice, UgrozenoLiceResponse } from '../ugrozena-lica/types';

export default function StampanjePage() {
  const [ugrozenaLica, setUgrozenaLica] = useState<UgrozenoLice[]>([]);
  const [loading, setLoading] = useState(true);
  // const [selectedLice, setSelectedLice] = useState<UgrozenoLice | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'}|null>(null);

  useEffect(() => {
    fetchUgrozenaLica();
  }, []);

  const fetchUgrozenaLica = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/euk/ugrozena-lica?size=1000');
      if (!res.ok) {
        throw new Error('Greška pri dohvatanju podataka');
      }

      const data: UgrozenoLiceResponse = await res.json();
      setUgrozenaLica(data.content || []);
    } catch (error) {
      console.error('Error fetching ugrozena lica:', error);
      setToast({msg: 'Greška pri dohvatanju ugroženih lica', type: 'error'});
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (lice: UgrozenoLice) => {
    // Kreiramo print window sa preciznim pozicioniranjem
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      setToast({msg: 'Greška pri otvaranju prozora za štampanje', type: 'error'});
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Štampanje ugroženog lica - ${lice.ime} ${lice.prezime}</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            .envelope { 
              width: 250mm; 
              height: 176mm; 
              position: relative; 
              border: 1px solid #ccc; 
              margin: 0;
              background: white;
              page-break-after: always;
            }
            .ime {
              position: absolute;
              left: 110mm;
              bottom: 85mm;
              font-family: Arial, sans-serif;
              font-size: 14pt;
              font-weight: bold;
            }
            .prezime {
              position: absolute;
              right: 30mm;
              bottom: 85mm;
              font-family: Arial, sans-serif;
              font-size: 14pt;
              font-weight: bold;
            }
            .mesto-rodjenja {
              position: absolute;
              left: 110mm;
              bottom: 75mm;
              font-family: Arial, sans-serif;
              font-size: 12pt;
            }
            .opstina-rodjenja {
              position: absolute;
              right: 30mm;
              bottom: 75mm;
              font-family: Arial, sans-serif;
              font-size: 12pt;
            }
            .no-print { display: none; }
          }
          .envelope { 
            width: 250mm; 
            height: 176mm; 
            position: relative; 
            border: 1px solid #ccc; 
            margin: 20px auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .ime {
            position: absolute;
            left: 110mm;
            bottom: 85mm;
            font-family: Arial, sans-serif;
            font-size: 14pt;
            font-weight: bold;
            color: #333;
          }
          .prezime {
            position: absolute;
            right: 30mm;
            bottom: 85mm;
            font-family: Arial, sans-serif;
            font-size: 14pt;
            font-weight: bold;
            color: #333;
          }
          .mesto-rodjenja {
            position: absolute;
            left: 110mm;
            bottom: 75mm;
            font-family: Arial, sans-serif;
            font-size: 12pt;
            color: #666;
          }
          .opstina-rodjenja {
            position: absolute;
            right: 30mm;
            bottom: 75mm;
            font-family: Arial, sans-serif;
            font-size: 12pt;
            color: #666;
          }
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #3A3CA6;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          }
          .print-button:hover {
            background: #2a2b8a;
          }
          .info {
            position: fixed;
            top: 20px;
            left: 20px;
            background: #f0f0f0;
            padding: 15px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            max-width: 300px;
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button class="print-button" onclick="window.print()">Štampaj</button>
          <div class="info">
            <h3>Informacije o štampanju:</h3>
            <p><strong>Dimenzije koverta:</strong> 250mm x 176mm</p>
            <p><strong>Ime:</strong> 110mm od leve ivice, 85mm od donje ivice</p>
            <p><strong>Prezime:</strong> 30mm od desne ivice, 85mm od donje ivice</p>
            <p><strong>Mesto rođenja:</strong> 110mm od leve ivice, 75mm od donje ivice</p>
            <p><strong>Opština rođenja:</strong> 30mm od desne ivice, 75mm od donje ivice</p>
          </div>
        </div>
        
        <div class="envelope">
          <div class="ime">${lice.ime || ''}</div>
          <div class="prezime">${lice.prezime || ''}</div>
          <div class="mesto-rodjenja">${lice.mestoRodjenja || ''}</div>
          <div class="opstina-rodjenja">${lice.opstinaRodjenja || ''}</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setToast({msg: 'Prozor za štampanje je otvoren', type: 'success'});
    setTimeout(() => setToast(null), 3000);
  };

  const handlePrintMultiple = () => {
    if (selectedIds.length === 0) {
      setToast({msg: 'Izaberite bar jedno ugroženo lice za štampanje', type: 'error'});
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const selectedLica = ugrozenaLica.filter(lice => selectedIds.includes(lice.ugrozenoLiceId));
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      setToast({msg: 'Greška pri otvaranju prozora za štampanje', type: 'error'});
      return;
    }

    const envelopesHtml = selectedLica.map(lice => `
      <div class="envelope">
        <div class="ime">${lice.ime || ''}</div>
        <div class="prezime">${lice.prezime || ''}</div>
        <div class="mesto-rodjenja">${lice.mestoRodjenja || ''}</div>
        <div class="opstina-rodjenja">${lice.opstinaRodjenja || ''}</div>
      </div>
    `).join('');

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Štampanje ${selectedLica.length} ugroženih lica</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            .envelope { 
              width: 250mm; 
              height: 176mm; 
              position: relative; 
              border: 1px solid #ccc; 
              margin: 0;
              background: white;
              page-break-after: always;
            }
            .ime {
              position: absolute;
              left: 110mm;
              bottom: 85mm;
              font-family: Arial, sans-serif;
              font-size: 14pt;
              font-weight: bold;
            }
            .prezime {
              position: absolute;
              right: 30mm;
              bottom: 85mm;
              font-family: Arial, sans-serif;
              font-size: 14pt;
              font-weight: bold;
            }
            .mesto-rodjenja {
              position: absolute;
              left: 110mm;
              bottom: 75mm;
              font-family: Arial, sans-serif;
              font-size: 12pt;
            }
            .opstina-rodjenja {
              position: absolute;
              right: 30mm;
              bottom: 75mm;
              font-family: Arial, sans-serif;
              font-size: 12pt;
            }
            .no-print { display: none; }
          }
          .envelope { 
            width: 250mm; 
            height: 176mm; 
            position: relative; 
            border: 1px solid #ccc; 
            margin: 20px auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .ime {
            position: absolute;
            left: 110mm;
            bottom: 85mm;
            font-family: Arial, sans-serif;
            font-size: 14pt;
            font-weight: bold;
            color: #333;
          }
          .prezime {
            position: absolute;
            right: 30mm;
            bottom: 85mm;
            font-family: Arial, sans-serif;
            font-size: 14pt;
            font-weight: bold;
            color: #333;
          }
          .mesto-rodjenja {
            position: absolute;
            left: 110mm;
            bottom: 75mm;
            font-family: Arial, sans-serif;
            font-size: 12pt;
            color: #666;
          }
          .opstina-rodjenja {
            position: absolute;
            right: 30mm;
            bottom: 75mm;
            font-family: Arial, sans-serif;
            font-size: 12pt;
            color: #666;
          }
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #3A3CA6;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          }
          .print-button:hover {
            background: #2a2b8a;
          }
          .info {
            position: fixed;
            top: 20px;
            left: 20px;
            background: #f0f0f0;
            padding: 15px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            max-width: 300px;
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button class="print-button" onclick="window.print()">Štampaj sve (${selectedLica.length})</button>
          <div class="info">
            <h3>Informacije o štampanju:</h3>
            <p><strong>Broj koverta:</strong> ${selectedLica.length}</p>
            <p><strong>Dimenzije koverta:</strong> 250mm x 176mm</p>
            <p><strong>Ime:</strong> 110mm od leve ivice, 85mm od donje ivice</p>
            <p><strong>Prezime:</strong> 30mm od desne ivice, 85mm od donje ivice</p>
            <p><strong>Mesto rođenja:</strong> 110mm od leve ivice, 75mm od donje ivice</p>
            <p><strong>Opština rođenja:</strong> 30mm od desne ivice, 75mm od donje ivice</p>
          </div>
        </div>
        
        ${envelopesHtml}
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setToast({msg: `Prozor za štampanje ${selectedLica.length} koverta je otvoren`, type: 'success'});
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelect = (id: number, checked: boolean) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(ugrozenaLica.map(lice => lice.ugrozenoLiceId));
    } else {
      setSelectedIds([]);
    }
  };

  return (
    <div className="p-8 w-full h-full">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold transition ${toast.type==='success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}
      
      {/* Header sa naslovom */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-16 md:h-16 rounded-lg flex items-center justify-center" style={{backgroundColor: '#3A3CA6'}}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="6,9 6,2 18,2 18,9"></polyline>
              <path d="M6,18H4a2,2 0 0,1 -2,-2V11a2,2 0 0,1 2,-2H20a2,2 0 0,1 2,2v5a2,2 0 0,1 -2,2H18"></path>
              <polyline points="6,14 6,18 18,18 18,14"></polyline>
            </svg>
          </div>
          <h1 className="text-4xl font-bold ml-2">Štampanje ugroženih lica</h1>
        </div>
      </div>

      {/* Informacije o štampanju */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Informacije o štampanju</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
          <div>
            <p><strong>Dimenzije koverta:</strong> 250mm x 176mm</p>
            <p><strong>Ime:</strong> 110mm od leve ivice, 85mm od donje ivice</p>
            <p><strong>Prezime:</strong> 30mm od desne ivice, 85mm od donje ivice</p>
          </div>
          <div>
            <p><strong>Mesto rođenja:</strong> 110mm od leve ivice, 75mm od donje ivice</p>
            <p><strong>Opština rođenja:</strong> 30mm od desne ivice, 75mm od donje ivice</p>
            <p><strong>Format štampanja:</strong> Precizno pozicioniranje na koverti</p>
          </div>
        </div>
      </div>

      {/* Tabela ugroženih lica */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Izaberite ugroženo lice za štampanje</h2>
          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handlePrintMultiple}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 6,2 18,2 18,9"></polyline>
                  <path d="M6,18H4a2,2 0 0,1 -2,-2V11a2,2 0 0,1 2,-2H20a2,2 0 0,1 2,2v5a2,2 0 0,1 -2,2H18"></path>
                  <polyline points="6,14 6,18 18,18 18,14"></polyline>
                </svg>
                Štampaj izabrane ({selectedIds.length})
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
                Poništi izbor
              </button>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Učitavanje ugroženih lica...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === ugrozenaLica.length && ugrozenaLica.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ime</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prezime</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JMBG</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mesto rođenja</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opština rođenja</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcije</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ugrozenaLica.map((lice) => (
                  <tr key={lice.ugrozenoLiceId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(lice.ugrozenoLiceId)}
                        onChange={(e) => handleSelect(lice.ugrozenoLiceId, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lice.ugrozenoLiceId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lice.ime}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lice.prezime}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lice.jmbg}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lice.mestoRodjenja}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lice.opstinaRodjenja}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handlePrint(lice)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6,9 6,2 18,2 18,9"></polyline>
                          <path d="M6,18H4a2,2 0 0,1 -2,-2V11a2,2 0 0,1 2,-2H20a2,2 0 0,1 2,2v5a2,2 0 0,1 -2,2H18"></path>
                          <polyline points="6,14 6,18 18,18 18,14"></polyline>
                        </svg>
                        Štampaj
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && ugrozenaLica.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nema ugroženih lica</h3>
            <p className="mt-1 text-sm text-gray-500">Dodajte ugrožena lica da biste mogli da ih štampate.</p>
          </div>
        )}
        
        {!loading && ugrozenaLica.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
            Prikazano {ugrozenaLica.length} ugroženih lica
            {selectedIds.length > 0 && (
              <span className="ml-2 font-medium text-blue-600">
                • Izabrano {selectedIds.length} za štampanje
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
