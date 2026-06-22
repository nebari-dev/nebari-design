import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from '@/ui/switch';

describe('Switch', () => {
  it('renders a switch role', () => {
    render(<Switch aria-label="Wifi" />);
    expect(screen.getByRole('switch', { name: 'Wifi' })).toBeInTheDocument();
  });

  it('reflects checked state via data attributes', () => {
    render(<Switch aria-label="Wifi" defaultChecked />);
    expect(screen.getByRole('switch', { name: 'Wifi' })).toHaveAttribute(
      'data-checked',
    );
  });

  it('starts unchecked by default', () => {
    render(<Switch aria-label="Wifi" />);
    expect(screen.getByRole('switch', { name: 'Wifi' })).toHaveAttribute(
      'data-unchecked',
    );
  });

  it('sets data-slot on the root', () => {
    render(<Switch aria-label="Wifi" />);
    expect(screen.getByRole('switch', { name: 'Wifi' })).toHaveAttribute(
      'data-slot',
      'switch',
    );
  });

  it('toggles and fires onCheckedChange', async () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Wifi" onCheckedChange={onCheckedChange} />);
    const toggle = screen.getByRole('switch', { name: 'Wifi' });
    await userEvent.click(toggle);
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(toggle).toHaveAttribute('data-checked');
  });

  it('does not toggle when disabled', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch aria-label="Wifi" disabled onCheckedChange={onCheckedChange} />,
    );
    const toggle = screen.getByRole('switch', { name: 'Wifi' });
    expect(toggle).toHaveAttribute('data-disabled');
    await userEvent.click(toggle);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('merges a caller className', () => {
    render(<Switch aria-label="Wifi" className="custom-class" />);
    expect(screen.getByRole('switch', { name: 'Wifi' })).toHaveClass(
      'custom-class',
    );
  });
});
