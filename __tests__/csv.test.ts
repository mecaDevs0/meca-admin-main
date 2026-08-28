import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { escapeCell, exportCsv, csvFilename } from '@/lib/csv';

describe('escapeCell', () => {
  it('returns a plain value unchanged when it has no special characters', () => {
    expect(escapeCell('hello')).toBe('hello');
  });

  it('wraps a value containing a comma in quotes', () => {
    expect(escapeCell('a,b')).toBe('"a,b"');
  });

  it('wraps a value containing a double quote in quotes and doubles inner quotes', () => {
    expect(escapeCell('say "hi"')).toBe('"say ""hi"""');
  });

  it('wraps a value containing a newline in quotes', () => {
    expect(escapeCell('line1\nline2')).toBe('"line1\nline2"');
  });

  it('wraps a value containing a carriage return in quotes', () => {
    expect(escapeCell('line1\rline2')).toBe('"line1\rline2"');
  });
});

describe('csvFilename', () => {
  it('prefixes the filename with the given prefix and appends a .csv extension', () => {
    const name = csvFilename('export');
    expect(name.startsWith('export_')).toBe(true);
    expect(name.endsWith('.csv')).toBe(true);
  });

  it('includes the current date in YYYY-MM-DD format', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(csvFilename('report')).toBe(`report_${today}.csv`);
  });
});

describe('exportCsv', () => {
  let createObjectURLMock: ReturnType<typeof vi.fn>;
  let revokeObjectURLMock: ReturnType<typeof vi.fn>;
  let clickMock: ReturnType<typeof vi.fn>;
  let capturedBlob: Blob | null;

  beforeEach(() => {
    capturedBlob = null;
    createObjectURLMock = vi.fn((blob: Blob) => {
      capturedBlob = blob;
      return 'blob:mock-url';
    });
    revokeObjectURLMock = vi.fn();
    // jsdom does not implement URL.createObjectURL/revokeObjectURL
    URL.createObjectURL = createObjectURLMock as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL = revokeObjectURLMock as unknown as typeof URL.revokeObjectURL;
    clickMock = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(clickMock as () => void);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a Blob with BOM + header + rows and triggers a download', async () => {
    exportCsv(
      'clients.csv',
      [
        { header: 'Name', accessor: (r: { name: string; age: number }) => r.name },
        { header: 'Age', accessor: (r: { name: string; age: number }) => r.age },
      ],
      [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ]
    );

    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
    expect(clickMock).toHaveBeenCalledTimes(1);

    expect(capturedBlob).not.toBeNull();
    const text = (await capturedBlob!.text()).replace(/^﻿/, '');
    expect(text).toBe('Name,Age\nAlice,30\nBob,25');
  });

  it('escapes cell values that contain commas', async () => {
    exportCsv(
      'test.csv',
      [{ header: 'Description', accessor: (r: { desc: string }) => r.desc }],
      [{ desc: 'Item, with comma' }]
    );
    const text = (await capturedBlob!.text()).replace(/^﻿/, '');
    expect(text).toBe('Description\n"Item, with comma"');
  });

  it('renders null/undefined accessor values as empty strings', async () => {
    exportCsv(
      'test.csv',
      [{ header: 'Value', accessor: (r: { v: string | null }) => r.v }],
      [{ v: null }]
    );
    const text = (await capturedBlob!.text()).replace(/^﻿/, '');
    expect(text).toBe('Value\n');
  });

  it('sets the anchor download attribute to the given filename', () => {
    let capturedAnchor: HTMLAnchorElement | null = null;
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === 'a') capturedAnchor = el as HTMLAnchorElement;
      return el;
    });

    exportCsv('my-export.csv', [{ header: 'A', accessor: () => 'x' }], [{}]);
    expect((capturedAnchor as HTMLAnchorElement | null)?.download).toBe('my-export.csv');
  });
});
