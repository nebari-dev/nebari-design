import { act, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { Slider } from '@/ui/slider';

async function renderSlider(ui: ReactElement) {
  const result = render(ui);
  await act(async () => {});
  return result;
}

function getSliderInput(name: string) {
  const input = document.querySelector<HTMLInputElement>(
    `input[type="range"][aria-label="${name}"]`,
  );

  expect(input).toBeInTheDocument();
  return input as HTMLInputElement;
}

describe('Slider', () => {
  it('renders one accessible slider thumb by default', async () => {
    await renderSlider(<Slider defaultValue={40} />);

    const slider = getSliderInput('Value');
    expect(slider).toHaveAttribute('aria-valuenow', '40');
    expect(document.querySelector('[data-slot="slider"]')).toHaveAttribute(
      'data-slot',
      'slider',
    );
    expect(document.querySelector('[data-slot="slider-control"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="slider-track"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="slider-range"]')).toHaveClass(
      'data-[orientation=vertical]:left-0',
      'data-[orientation=vertical]:w-full',
    );
    expect(
      document.querySelectorAll('[data-slot="slider-thumb"]'),
    ).toHaveLength(1);
  });

  it('renders one thumb per range value', async () => {
    await renderSlider(<Slider defaultValue={[20, 80]} />);

    expect(getSliderInput('Minimum value')).toHaveAttribute(
      'aria-valuenow',
      '20',
    );
    expect(getSliderInput('Maximum value')).toHaveAttribute(
      'aria-valuenow',
      '80',
    );
    expect(
      document.querySelectorAll('[data-slot="slider-thumb"]'),
    ).toHaveLength(2);
  });

  it('renders a visual value tooltip for each thumb', async () => {
    await renderSlider(<Slider defaultValue={[20, 80]} />);

    const tooltips = document.querySelectorAll(
      '[data-slot="slider-value-tooltip"]',
    );
    expect(tooltips).toHaveLength(2);
    expect(tooltips[0]).toHaveTextContent('20');
    expect(tooltips[1]).toHaveTextContent('80');
    expect(tooltips[0]).toHaveClass('bg-foreground', 'text-background');
  });

  it('shows only the active thumb tooltip', async () => {
    await renderSlider(<Slider defaultValue={[20, 80]} />);

    const minimumValue = getSliderInput('Minimum value');
    await act(async () => {
      minimumValue.focus();
    });

    const thumbs = document.querySelectorAll('[data-slot="slider-thumb"]');
    expect(thumbs[0]).toHaveClass(
      '[&_[data-slot=slider-value-tooltip]]:visible',
      '[&_[data-slot=slider-value-tooltip]]:opacity-100',
    );
    expect(thumbs[1]).not.toHaveClass(
      '[&_[data-slot=slider-value-tooltip]]:visible',
    );
  });

  it('can hide the visual value tooltip', async () => {
    await renderSlider(<Slider defaultValue={40} showValueTooltip={false} />);

    expect(
      document.querySelector('[data-slot="slider-value-tooltip"]'),
    ).not.toBeInTheDocument();
  });

  it('supports custom thumb labels', async () => {
    await renderSlider(
      <Slider
        defaultValue={55}
        getThumbAriaLabel={() => 'Workspace CPU limit'}
      />,
    );

    expect(getSliderInput('Workspace CPU limit')).toBeInTheDocument();
  });

  it('applies vertical orientation data and classes', async () => {
    await renderSlider(<Slider defaultValue={60} orientation="vertical" />);

    const root = document.querySelector('[data-slot="slider"]');
    expect(root).toHaveAttribute('data-orientation', 'vertical');
    expect(root).toHaveClass(
      'data-[orientation=vertical]:h-44',
      'data-[orientation=vertical]:w-8',
    );
    expect(document.querySelector('[data-slot="slider-control"]')).toHaveClass(
      'data-[orientation=vertical]:flex-col',
    );
    expect(document.querySelector('[data-slot="slider-track"]')).toHaveClass(
      'data-[orientation=horizontal]:h-1.5',
      'data-[orientation=vertical]:w-1.5',
    );
  });

  it('disables the nested range input and exposes disabled data', async () => {
    await renderSlider(<Slider defaultValue={50} disabled />);

    const slider = getSliderInput('Value');
    expect(slider).toBeDisabled();
    expect(document.querySelector('[data-slot="slider"]')).toHaveAttribute(
      'data-disabled',
    );
  });

  it('merges caller className on the root', async () => {
    await renderSlider(<Slider className="custom-slider" defaultValue={30} />);

    expect(document.querySelector('[data-slot="slider"]')).toHaveClass(
      'custom-slider',
    );
  });
});
