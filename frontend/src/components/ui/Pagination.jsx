import { ChevronLeft, ChevronRight } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20]
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #f1f5f9',
        borderRadius: '0 0 12px 12px',
        fontSize: '0.82rem',
        color: '#475569',
        flexWrap: 'wrap',
        gap: '12px'
      }}
    >
      {/* 1. Context Information (Feedforward / Nielsen H1 & Shneiderman Rule 8) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span>
          Mostrando <strong>{startItem}</strong> a <strong>{endItem}</strong> de <strong>{totalItems}</strong> registros
        </span>

        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b' }}>Filas:</span>
            <div style={{ width: '82px' }}>
              <CustomSelect
                value={pageSize}
                onChange={(val) => onPageSizeChange(Number(val))}
                options={pageSizeOptions.map((opt) => ({ value: opt, label: String(opt) }))}
                ariaLabel="Cantidad de filas por página"
                dropDirection="up"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Pagination Navigation Controls (Nielsen H3 & H7 / Shneiderman Rule 7) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Página anterior"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: currentPage <= 1 ? '#cbd5e1' : '#334155',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Number Buttons */}
        {getPageNumbers().map((num) => {
          const isActive = num === currentPage;
          return (
            <button
              key={num}
              type="button"
              onClick={() => onPageChange(num)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: isActive ? '1px solid #15803d' : '1px solid #cbd5e1',
                backgroundColor: isActive ? '#15803d' : '#ffffff',
                color: isActive ? '#ffffff' : '#334155',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {num}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Página siguiente"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: currentPage >= totalPages ? '#cbd5e1' : '#334155',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
