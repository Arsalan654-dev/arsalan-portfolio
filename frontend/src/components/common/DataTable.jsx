'use client';
import { useState, useMemo } from 'react';
import Pagination from './Pagination';
import SearchBar from './SearchBar';
import FilterDropdown from './FilterDropdown';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  searchPlaceholder = 'Search...',
  filterOptions = [],
  onSearch,
  onFilter,
  onSort,
  page = 1,
  totalPages = 1,
  totalItems = 0,
  perPage = 10,
  onPageChange,
  onBulkAction,
  onRowClick,
  getRowLink,
  sortField: externalSortField,
  sortOrder: externalSortOrder
}) {
  const [selected, setSelected] = useState([]);
  const [internalSortField, setInternalSortField] = useState('');
  const [internalSortOrder, setInternalSortOrder] = useState('asc');
  const [filters, setFilters] = useState({});

  const sortField = externalSortField ?? internalSortField;
  const sortOrder = externalSortOrder ?? internalSortOrder;

  const allSelected = useMemo(
    () => data.length > 0 && selected.length === data.length,
    [data, selected]
  );

  const handleSelectAll = () => {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(data.filter(Boolean).map(row => row._id || row.id));
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSort = (field) => {
    const newOrder =
      sortField === field
        ? sortOrder === 'asc'
          ? 'desc'
          : sortOrder === 'desc'
          ? 'newest'
          : 'asc'
        : 'asc';
    if (onSort) {
      onSort(field, newOrder);
    } else {
      setInternalSortField(field);
      setInternalSortOrder(newOrder);
    }
  };

  const handleFilter = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    if (onFilter) onFilter(updated);
  };

  const resetFilters = () => {
    setFilters({});
    if (onFilter) onFilter({});
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <i className="fas fa-sort ms-1" style={{ opacity: 0.3, fontSize: '0.75rem' }}></i>;
    }
    if (sortOrder === 'asc') return <i className="fas fa-sort-up ms-1" style={{ fontSize: '0.75rem' }}></i>;
    if (sortOrder === 'desc') return <i className="fas fa-sort-down ms-1" style={{ fontSize: '0.75rem' }}></i>;
    return <i className="fas fa-clock ms-1" style={{ fontSize: '0.75rem' }} title="Newest"></i>;
  };

  const renderCell = (row, col, rowIndex) => {
    if (col.render) return col.render(row, rowIndex);
    const value = col.accessor ? row[col.accessor] : row[col.key];
    if (value === null || value === undefined) return '—';
    return value;
  };

  const handleRowClick = (row, rowIndex) => {
    if (onRowClick) {
      onRowClick(row, rowIndex);
    } else if (getRowLink) {
      const link = getRowLink(row);
      // eslint-disable-next-line react-hooks/immutability
      if (link) window.location.href = link;
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <SearchBar
          placeholder={searchPlaceholder}
          onSearch={onSearch || (() => {})}
        />

        {filterOptions.map((filter) => (
          <FilterDropdown
            key={filter.key || filter.label}
            label={filter.label}
            options={filter.options}
            value={filters[filter.key] || ''}
            onChange={(val) => handleFilter(filter.key, val)}
          />
        ))}

        {(Object.values(filters).some((v) => v) || sortField) && (
          <button
            className="btn btn-sm"
            onClick={resetFilters}
            style={{ color: 'var(--ap)', background: 'transparent', border: '1px solid var(--bdr)' }}
          >
            <i className="fas fa-undo me-1"></i>Reset
          </button>
        )}

        <div className="ms-auto d-flex gap-2">
          {onBulkAction && selected.length > 0 && (
            <>
              <button
                className="btn btn-sm"
                onClick={() => onBulkAction('delete', data.filter(row => selected.includes(row._id || row.id)))}
                style={{ background: '#dc3545', color: '#fff', border: 'none' }}
              >
                <i className="fas fa-trash-alt me-1"></i>Delete ({selected.length})
              </button>
              <button
                className="btn btn-sm"
                onClick={() => onBulkAction('mark', data.filter(row => selected.includes(row._id || row.id)))}
                style={{ background: 'var(--ap)', color: '#fff', border: 'none' }}
              >
                <i className="fas fa-check me-1"></i>Mark ({selected.length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive" style={{ borderRadius: '12px', border: '1px solid var(--bdr)' }}>
        <table className="table table-hover mb-0" style={{ color: 'var(--tp)', minWidth: '640px' }}>
          <thead>
            <tr style={{ background: 'var(--bs)' }}>
              {onBulkAction && (
                <th style={{ width: '40px', borderBottom: '1px solid var(--bdr)' }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    style={{ accentColor: 'var(--ap)' }}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key || col.accessor}
                  onClick={() => col.sortable !== false && handleSort(col.accessor || col.key)}
                  style={{
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    borderBottom: '1px solid var(--bdr)',
                    padding: '12px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'var(--ts)',
                    whiteSpace: 'nowrap',
                    userSelect: 'none'
                  }}
                >
                  {col.header || col.label || col.key}
                  {col.sortable !== false && renderSortIcon(col.accessor || col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  {onBulkAction && <td style={{ borderBottom: '1px solid var(--bdr)' }}><div className="skeleton-box" style={{ width: 18, height: 18, borderRadius: 4 }} /></td>}
                  {columns.map((col) => (
                    <td key={col.key || col.accessor} style={{ borderBottom: '1px solid var(--bdr)', padding: '12px' }}>
                      <div
                        className="skeleton-box"
                        style={{
                          height: 14,
                          width: `${40 + Math.random() * 40}%`,
                          borderRadius: 4,
                          background: 'var(--bdr)',
                          opacity: 0.5
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onBulkAction ? 1 : 0)}
                  className="text-center py-5"
                  style={{ borderBottom: '1px solid var(--bdr)' }}
                >
                  <i className="fas fa-inbox" style={{ fontSize: '2.5rem', color: 'var(--bdr)', marginBottom: '0.5rem' }}></i>
                  <p style={{ color: 'var(--ts)', margin: 0 }}>
                    No data found
                  </p>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row._id || row.id || rowIndex}
                  onClick={() => handleRowClick(row, rowIndex)}
                  style={{
                    cursor: onRowClick || getRowLink ? 'pointer' : 'default',
                    borderBottom: '1px solid var(--bdr)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139,92,246,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {onBulkAction && (
                    <td style={{ borderBottom: '1px solid var(--bdr)', padding: '12px' }}>
                      <input
                        type="checkbox"
                        checked={selected.includes(row._id || row.id)}
                        onChange={() => handleSelect(row._id || row.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ accentColor: 'var(--ap)' }}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key || col.accessor}
                      style={{
                        borderBottom: '1px solid var(--bdr)',
                        padding: '12px',
                        fontSize: '0.9rem',
                        whiteSpace: col.nowrap ? 'nowrap' : 'normal'
                      }}
                    >
                      {renderCell(row, col, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(totalPages > 1 || totalItems > 0) && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          perPage={perPage}
          onPageChange={onPageChange || (() => {})}
        />
      )}
    </div>
  );
}
