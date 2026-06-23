import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Label } from '@/ui/label';

describe('Label', () => {
  it('renders its children with the base classes and data-slot', () => {
    render(<Label>Username</Label>);
    const label = screen.getByText('Username');
    expect(label).toHaveAttribute('data-slot', 'label');
    expect(label).toHaveClass('font-medium', 'text-sm');
  });

  it('associates with a control via htmlFor', () => {
    render(
      <>
        <Label htmlFor="username">Username</Label>
        <input id="username" />
      </>,
    );
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('merges a caller className over the defaults', () => {
    render(<Label className="text-base">Username</Label>);
    expect(screen.getByText('Username')).toHaveClass('text-base');
  });
});
