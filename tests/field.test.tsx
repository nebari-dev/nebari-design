import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui/field';
import { Switch } from '@/ui/switch';

describe('Field', () => {
  it('names the control via its label', () => {
    render(
      <Field>
        <FieldLabel>Enable copy</FieldLabel>
        <Switch />
      </Field>,
    );
    expect(
      screen.getByRole('switch', { name: 'Enable copy' }),
    ).toBeInTheDocument();
  });

  it('associates the description with the control', () => {
    render(
      <Field>
        <FieldLabel>Enable copy</FieldLabel>
        <FieldDescription>Allow copying this environment</FieldDescription>
        <Switch />
      </Field>,
    );
    expect(
      screen.getByRole('switch', { name: 'Enable copy' }),
    ).toHaveAccessibleDescription('Allow copying this environment');
  });

  it('toggles the control when the label is clicked', async () => {
    render(
      <Field>
        <FieldLabel>Enable copy</FieldLabel>
        <Switch />
      </Field>,
    );
    const toggle = screen.getByRole('switch', { name: 'Enable copy' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(screen.getByText('Enable copy'));
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('shows a forced error message and sets data-slots on each part', () => {
    render(
      <Field>
        <FieldLabel>Enable copy</FieldLabel>
        <FieldDescription>Description</FieldDescription>
        <FieldError match>Something went wrong</FieldError>
        <Switch />
      </Field>,
    );
    expect(screen.getByText('Enable copy')).toHaveAttribute(
      'data-slot',
      'field-label',
    );
    expect(screen.getByText('Description')).toHaveAttribute(
      'data-slot',
      'field-description',
    );
    expect(screen.getByText('Something went wrong')).toHaveAttribute(
      'data-slot',
      'field-error',
    );
  });
});
