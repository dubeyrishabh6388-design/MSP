import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusBadge } from '../src/components/common/StatusBadge';

describe('Frontend Component Tests', () => {
  it('renders StatusBadge with correct text and styles for CONFIRMED', () => {
    render(<StatusBadge status="CONFIRMED" />);
    const textNode = screen.getByText('CONFIRMED');
    expect(textNode).toBeDefined();
    const container = textNode.parentElement;
    expect(container?.className).toContain('text-emerald-800');
  });

  it('renders StatusBadge with correct text and animation for IN_PROGRESS', () => {
    render(<StatusBadge status="IN_PROGRESS" />);
    const textNode = screen.getByText('IN PROGRESS');
    expect(textNode).toBeDefined();
    const container = textNode.parentElement;
    expect(container?.className).toContain('text-blue-800');
  });

  it('renders StatusBadge for CANCELLED', () => {
    render(<StatusBadge status="CANCELLED" />);
    const textNode = screen.getByText('CANCELLED');
    expect(textNode).toBeDefined();
    const container = textNode.parentElement;
    expect(container?.className).toContain('text-rose-800');
  });
});
