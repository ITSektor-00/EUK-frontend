'use client';

import React from 'react';
import { ManualData } from '@/types/wordTemplate';

interface ManualDataStepProps {
    manualData: ManualData;
    onManualDataChange: (data: ManualData) => void;
}

const ManualDataStep: React.FC<ManualDataStepProps> = ({
    manualData,
    onManualDataChange
}) => {
    const handleChange = (field: keyof ManualData, value: string) => {
        onManualDataChange({
            ...manualData,
            [field]: value
        });
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Ručni podaci</h3>
                <p className="text-gray-600">Unesite zaglavlje i obrazloženje za rešenje</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Zaglavlje */}
                <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Zaglavlje *
                    </label>
                    <textarea
                        value={manualData.ZAGLAVLJE}
                        onChange={(e) => handleChange('ZAGLAVLJE', e.target.value)}
                        placeholder="Unesite zaglavlje rešenja..."
                        rows={4}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                        {manualData.ZAGLAVLJE.length} karaktera
                    </div>
                </div>

                {/* Obrazloženje */}
                <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Obrazloženje *
                    </label>
                    <textarea
                        value={manualData.OBRAZLOZENJE}
                        onChange={(e) => handleChange('OBRAZLOZENJE', e.target.value)}
                        placeholder="Unesite obrazloženje rešenja..."
                        rows={6}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                        {manualData.OBRAZLOZENJE.length} karaktera
                    </div>
                </div>

                {/* Dodatni podaci */}
                <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Dodatni podaci (opciono)
                    </label>
                    <textarea
                        value={manualData.DODATNI_PODACI || ''}
                        onChange={(e) => handleChange('DODATNI_PODACI', e.target.value)}
                        placeholder="Unesite dodatne podatke..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                        {(manualData.DODATNI_PODACI || '').length} karaktera
                    </div>
                </div>
            </div>

            {/* Pregled unetih podataka */}
            {(manualData.ZAGLAVLJE || manualData.OBRAZLOZENJE || manualData.DODATNI_PODACI) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Pregled unetih podataka:</h4>
                    
                    {manualData.ZAGLAVLJE && (
                        <div className="mb-3">
                            <h5 className="font-medium text-gray-700 mb-1">Zaglavlje:</h5>
                            <p className="text-gray-600 text-sm bg-white p-2 rounded border">
                                {manualData.ZAGLAVLJE}
                            </p>
                        </div>
                    )}
                    
                    {manualData.OBRAZLOZENJE && (
                        <div className="mb-3">
                            <h5 className="font-medium text-gray-700 mb-1">Obrazloženje:</h5>
                            <p className="text-gray-600 text-sm bg-white p-2 rounded border">
                                {manualData.OBRAZLOZENJE}
                            </p>
                        </div>
                    )}
                    
                    {manualData.DODATNI_PODACI && (
                        <div>
                            <h5 className="font-medium text-gray-700 mb-1">Dodatni podaci:</h5>
                            <p className="text-gray-600 text-sm bg-white p-2 rounded border">
                                {manualData.DODATNI_PODACI}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManualDataStep;
