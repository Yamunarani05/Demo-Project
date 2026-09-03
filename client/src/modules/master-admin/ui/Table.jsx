import React from 'react'

export default function Table({ headers, children, empty }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map(header => <th key={header}>{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {children || (
            <tr>
              <td colSpan={headers.length} className="empty-cell">{empty || 'No data found.'}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
