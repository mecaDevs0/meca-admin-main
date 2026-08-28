import { describe, it, expect } from 'vitest';
import { formatPhone } from '@/lib/utils';

describe('formatPhone', () => {
  it('formats an 11-digit phone number (mobile with 9-digit)', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
  });

  it('formats a 10-digit phone number (landline)', () => {
    expect(formatPhone('1123456789')).toBe('(11) 2345-6789');
  });

  it('strips non-digit characters before formatting', () => {
    expect(formatPhone('(11) 98765-4321')).toBe('(11) 98765-4321');
  });

  it('returns the em dash placeholder for an empty string', () => {
    expect(formatPhone('')).toBe('—');
  });

  it('returns the em dash placeholder for null', () => {
    expect(formatPhone(null)).toBe('—');
  });

  it('returns the em dash placeholder for undefined', () => {
    expect(formatPhone(undefined)).toBe('—');
  });

  it('returns the original value when digit count is neither 10 nor 11', () => {
    expect(formatPhone('123')).toBe('123');
  });
});
