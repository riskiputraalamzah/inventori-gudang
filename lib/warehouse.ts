export const warehouseRacks = [
  { code: 'A-01', name: 'Rak A-01', xPercent: 17, yPercent: 12.5 },
  { code: 'A-02', name: 'Rak A-02', xPercent: 17, yPercent: 37.5 },
  { code: 'A-03', name: 'Rak A-03', xPercent: 17, yPercent: 62.5 },
  { code: 'A-04', name: 'Rak A-04', xPercent: 17, yPercent: 87.5 },
  { code: 'B-01', name: 'Rak B-01', xPercent: 50, yPercent: 12.5 },
  { code: 'B-02', name: 'Rak B-02', xPercent: 50, yPercent: 37.5 },
  { code: 'B-03', name: 'Rak B-03', xPercent: 50, yPercent: 62.5 },
  { code: 'B-04', name: 'Rak B-04', xPercent: 50, yPercent: 87.5 },
  { code: 'C-01', name: 'Rak C-01', xPercent: 83, yPercent: 12.5 },
  { code: 'C-02', name: 'Rak C-02', xPercent: 83, yPercent: 37.5 },
  { code: 'C-03', name: 'Rak C-03', xPercent: 83, yPercent: 62.5 },
  { code: 'C-04', name: 'Rak C-04', xPercent: 83, yPercent: 87.5 },
] as const;

export type WarehouseRack = (typeof warehouseRacks)[number];

export function getWarehouseRack(code: string): WarehouseRack | undefined {
  return warehouseRacks.find((rack) => rack.code === code);
}
