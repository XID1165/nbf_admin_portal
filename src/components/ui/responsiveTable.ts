/** Tables render as a normal table from md up and as stacked cards below 768px. Use `data-label` on labelled cells. */
export const RT = {
  table: 'block w-full text-sm md:table',
  thead: 'hidden md:table-header-group',
  tbody: 'block md:table-row-group',
  tr: 'block max-md:mb-3 max-md:rounded-card max-md:border max-md:border-line max-md:bg-white max-md:p-4 md:table-row md:border-b md:border-line md:last:border-b-0',
  th: 'px-4 py-3 text-start text-[11px] font-medium uppercase tracking-[0.15em] text-muted first:ps-6 last:pe-6',
  tdMain: 'block pb-2 md:table-cell md:px-4 md:py-3.5 md:first:ps-6 md:last:pe-6',
  td: 'flex items-center justify-between gap-4 py-1.5 before:content-[attr(data-label)] before:text-xs before:font-medium before:text-muted md:table-cell md:px-4 md:py-3.5 md:before:hidden md:first:ps-6 md:last:pe-6',
};
