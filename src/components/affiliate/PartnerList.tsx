export interface PartnerRow { key: string; primary: string; status: string; date: string }
// Native table semantics on desktop; compact stacked cells at narrow widths.
export function PartnerList({ title, firstColumn, rows, embedded = false }: { title: string; firstColumn: string; rows: PartnerRow[]; embedded?: boolean }) {
  return <div className={embedded ? "min-w-0" : "min-w-0 rounded-[2rem] border bg-white p-4 shadow-sm sm:p-6"}><table aria-label={title} className="block w-full text-left text-sm sm:table sm:table-fixed">
    <colgroup className="hidden sm:table-column-group"><col className={embedded ? "w-[5.5rem]" : ""} /><col className={embedded ? "w-[10.5rem]" : "w-[14rem]"} /><col /></colgroup>
    <thead className="sr-only sm:not-sr-only sm:table-header-group"><tr>{[firstColumn, "Status", "Datum"].map(label => <th key={label} scope="col" className="pb-3 pr-3 font-semibold">{label}</th>)}</tr></thead>
    <tbody className="block sm:table-row-group">{rows.map(row => <tr key={row.key} className="grid gap-2 border-t py-4 first:border-t-0 sm:table-row sm:first:border-t">
      <td className="break-words font-semibold sm:py-4 sm:pr-3">{row.primary}</td><td className="sm:py-4 sm:pr-3"><span className="inline-block max-w-full rounded-full whitespace-nowrap bg-muted px-3 py-1 text-sm font-medium">{row.status}</span></td><td className="break-words text-muted-foreground sm:py-4">{row.date}</td>
    </tr>)}</tbody>
  </table></div>;
}
