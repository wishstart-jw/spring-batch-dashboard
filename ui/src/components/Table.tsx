import React from 'react'

type SortOrder = 'asc' | 'desc'

export interface TableColumn<T> {
  key: string
  title: React.ReactNode
  sortable?: boolean
  sortKey?: string
  headerClassName?: string
  cellClassName?: string
  render: (row: T) => React.ReactNode
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string | number
  emptyMessage: string
  sortBy?: string
  sortOrder?: SortOrder
  onSortChange?: (sortBy: string) => void
  emptyColSpan?: number
}

const getSortButtonClass = (isActive: boolean) => {
  return isActive
    ? 'font-semibold text-primary-700 dark:text-primary-300'
    : 'font-medium text-gray-700 dark:text-gray-200'
}

const renderSortIndicator = (isActive: boolean, sortOrder?: SortOrder) => {
  if (!isActive) {
    return <span className="ml-1 text-gray-400">↕</span>
  }

  return <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
}

export function Table<T>({
  columns,
  data,
  rowKey,
  emptyMessage,
  sortBy,
  sortOrder,
  onSortChange,
  emptyColSpan
}: TableProps<T>) {
  return (
    <div className="table-container">
      <table className="table">
        <thead className="table-header">
          <tr>
            {columns.map((column) => {
              const sortable = column.sortable && !!onSortChange
              const sortKey = column.sortKey ?? column.key
              const isActiveSort = sortable && sortBy === sortKey
              const ariaSort = isActiveSort ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'

              return (
                <th key={column.key} className={`table-header-cell ${column.headerClassName ?? ''}`} aria-sort={ariaSort}>
                  {sortable ? (
                    <button
                      type="button"
                      className={getSortButtonClass(Boolean(isActiveSort))}
                      onClick={() => onSortChange(sortKey)}
                    >
                      {column.title}
                      {renderSortIndicator(Boolean(isActiveSort), sortOrder)}
                    </button>
                  ) : (
                    column.title
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="table-body">
          {data.map((row) => (
            <tr key={rowKey(row)} className="table-row">
              {columns.map((column) => (
                <td key={`${rowKey(row)}-${column.key}`} className={`table-cell ${column.cellClassName ?? ''}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}

          {data.length === 0 && (
            <tr className="table-row">
              <td
                colSpan={emptyColSpan ?? columns.length}
                className="table-cell text-center py-8 text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
