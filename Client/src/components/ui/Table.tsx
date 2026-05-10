import React from 'react';

interface Column {
  key: string;
  header: string;
  render?: (item: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  emptyMessage?: string;
}

const Table: React.FC<TableProps> = ({ columns, data, emptyMessage = "No data found" }) => {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody id="payments-tbody">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="p-[26px] text-center text-[var(--text-secondary)] font-sans"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={item.id || index}
                className="table-row-enter"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
