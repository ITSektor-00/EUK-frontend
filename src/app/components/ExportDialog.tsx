import React, { useState } from 'react';
import {
  FormControl,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Box,
  Typography,
  Divider,
  RadioGroup,
  Radio,
} from '@mui/material';
import { FileDownload, PictureAsPdf, TableChart } from '@mui/icons-material';
import { GridRowSelectionModel } from '@mui/x-data-grid';

interface Column {
  accessorKey: string;
  header: string;
}

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  columns: Column[];
  data: Record<string, unknown>[];
  selectedRows?: GridRowSelectionModel;
  onExport: (selectedColumns: string[], format: string, data: Record<string, unknown>[]) => void;
}

export default function ExportDialog({ open, onClose, columns, data, selectedRows, onExport }: ExportDialogProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(columns.map(col => col.accessorKey));
  const [format, setFormat] = useState('csv');

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnKey) 
        ? prev.filter(col => col !== columnKey)
        : [...prev, columnKey]
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(columns.map(col => col.accessorKey));
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  const handleExport = () => {
    if (selectedColumns.length === 0) {
      alert('Молимо изаберите бар једну колону за извоз');
      return;
    }
    
    // Filter data to only include selected rows if any are selected
    let exportData = data;
    if (selectedRows && Array.isArray(selectedRows) && selectedRows.length > 0) {
      exportData = data.filter(item => {
        const itemId = (item as any).ugrozenoLiceId || (item as any).predmetId || (item as any).kategorijaId;
        return selectedRows.includes(itemId);
      });
    }
    
    onExport(selectedColumns, format, exportData);
    onClose();
  };

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: <TableChart /> },
    { value: 'excel', label: 'Excel (.xlsx)', icon: <FileDownload /> },
    { value: 'pdf', label: 'PDF', icon: <PictureAsPdf /> },
  ];

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#3B82F6] text-white p-4 rounded-t-2xl -m-6 mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FileDownload />
            Извоз података
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors duration-200 cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Изаберите формат извоза
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                row
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                {formatOptions.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={
                      <Radio 
                        sx={{
                          '&.Mui-checked': {
                            color: '#3B82F6',
                          },
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {option.icon}
                        {option.label}
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Изаберите колоне за извоз
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 border border-[#3B82F6] text-[#3B82F6] rounded-md hover:bg-[#3B82F6] hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Изабери све
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="px-3 py-1.5 border border-[#3B82F6] text-[#3B82F6] rounded-md hover:bg-[#3B82F6] hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Поништи све
                </button>
              </Box>
            </Box>

            <FormGroup sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1 }}>
              {columns.map((column) => (
                <FormControlLabel
                  key={column.accessorKey}
                  control={
                    <Checkbox
                      checked={selectedColumns.includes(column.accessorKey)}
                      onChange={() => handleColumnToggle(column.accessorKey)}
                      sx={{
                        '&.Mui-checked': {
                          color: '#3B82F6',
                        },
                        '&.MuiCheckbox-root': {
                          color: '#3B82F6',
                        },
                      }}
                    />
                  }
                  label={column.header}
                />
              ))}
            </FormGroup>

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Изабрано колона: {selectedColumns.length} од {columns.length}
              </Typography>
              {selectedRows && Array.isArray(selectedRows) && selectedRows.length > 0 && (
                <Typography variant="body2" color="primary" sx={{ ml: 2 }}>
                  • Означено редова: {selectedRows.length}
                </Typography>
              )}
            </Box>
          </Box>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#3B82F6] text-[#3B82F6] rounded-md hover:bg-[#3B82F6] hover:text-white transition-colors duration-200 font-medium cursor-pointer"
          >
            Откажи
          </button>
          <button
            onClick={handleExport}
            disabled={selectedColumns.length === 0}
            className="px-4 py-2 bg-[#3B82F6] text-white rounded-md hover:bg-[#2563EB] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Извези
          </button>
        </div>
      </div>
    </div>
  );
}
