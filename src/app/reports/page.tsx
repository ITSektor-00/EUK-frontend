"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PermissionGuard } from '@/components/PermissionGuard';

interface Report {
  id: number;
  name: string;
  description: string;
  type: string;
  lastGenerated: string;
  size: string;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      // Simulacija podataka - u stvarnosti bi pozvali API
      const mockReports = [
        {
          id: 1,
          name: 'Извештај о корисницима',
          description: 'Преглед свих корисника система',
          type: 'users',
          lastGenerated: '2024-01-15',
          size: '2.3 MB'
        },
        {
          id: 2,
          name: 'Извештај о предметима',
          description: 'Статистика предмета по категоријама',
          type: 'predmeti',
          lastGenerated: '2024-01-14',
          size: '1.8 MB'
        },
        {
          id: 3,
          name: 'Извештај о угроженим лицима',
          description: 'Преглед угрожених лица',
          type: 'ugrozena-lica',
          lastGenerated: '2024-01-13',
          size: '3.1 MB'
        },
        {
          id: 4,
          name: 'Месечни извештај',
          description: 'Агрегирани подаци за протекли месец',
          type: 'monthly',
          lastGenerated: '2024-01-12',
          size: '4.2 MB'
        }
      ];
      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType: string) => {
    try {
      setLoading(true);
      // Simulacija generisanja izveštaja
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockData = {
        users: {
          total: 150,
          active: 120,
          inactive: 30,
          byRole: {
            admin: 5,
            'obradjivaci predmeta': 45,
            potpisnik: 100
          }
        },
        predmeti: {
          total: 450,
          byCategory: {
            'Кривична дела': 120,
            'Прекршаји': 180,
            'Парнични спорови': 150
          }
        },
        'ugrozena-lica': {
          total: 230,
          byStatus: {
            'Активни': 180,
            'Завршени': 50
          }
        },
        monthly: {
          newUsers: 25,
          newPredmeti: 85,
          newUgrozenaLica: 45
        }
      };

      setReportData((mockData as any)[reportType]);
      setSelectedReport(reportType);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Грешка при генерисању извештаја!');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (report: Report) => {
    // Simulacija download-a
    alert(`Преузимање извештаја: ${report.name}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <PermissionGuard routeName="/reports" requiredPermission="read" userId={user?.id || undefined}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 ИЗВЕШТАЈИ
          </h1>
          <p className="text-gray-600">
            Генерисање и преузимање извештаја система
          </p>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reports.map((report) => (
            <div key={report.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  📄
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-500">{report.description}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Последњи генерисан:</span> {report.lastGenerated}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Величина:</span> {report.size}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => generateReport(report.type)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Генериши
                </button>
                <button
                  onClick={() => downloadReport(report)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Преузми
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Report Data Display */}
        {selectedReport && reportData && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📈 ПРЕГЛЕД ИЗВЕШТАЈА
            </h2>
            
            {selectedReport === 'users' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-600">УКУПНО КОРИСНИКА</p>
                  <p className="text-2xl font-bold text-blue-900">{reportData.total}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-600">АКТИВНИ</p>
                  <p className="text-2xl font-bold text-green-900">{reportData.active}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-yellow-600">НЕАКТИВНИ</p>
                  <p className="text-2xl font-bold text-yellow-900">{reportData.inactive}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-purple-600">АДМИНИ</p>
                  <p className="text-2xl font-bold text-purple-900">{reportData.byRole.admin}</p>
                </div>
              </div>
            )}

            {selectedReport === 'predmeti' && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-600">УКУПНО ПРЕДМЕТА</p>
                  <p className="text-2xl font-bold text-blue-900">{reportData.total}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(reportData.byCategory).map(([category, count]) => (
                    <div key={category} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">{category}</p>
                      <p className="text-xl font-bold text-gray-900">{String(count)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedReport === 'ugrozena-lica' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-600">УКУПНО УГРОЖЕНИХ ЛИЦА</p>
                  <p className="text-2xl font-bold text-blue-900">{reportData.total}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-600">АКТИВНИ</p>
                  <p className="text-2xl font-bold text-green-900">{reportData.byStatus['Активни']}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">ЗАВРШЕНИ</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.byStatus['Завршени']}</p>
                </div>
              </div>
            )}

            {selectedReport === 'monthly' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-600">НОВИ КОРИСНИЦИ</p>
                  <p className="text-2xl font-bold text-blue-900">{reportData.newUsers}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-600">НОВИ ПРЕДМЕТИ</p>
                  <p className="text-2xl font-bold text-green-900">{reportData.newPredmeti}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-purple-600">НОВА УГРОЖЕНА ЛИЦА</p>
                  <p className="text-2xl font-bold text-purple-900">{reportData.newUgrozenaLica}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
