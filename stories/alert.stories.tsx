import type { Meta, StoryObj } from '@storybook/react-vite';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  Alert,
  AlertAction,
  AlertDescription,
  type AlertProps,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type AlertStoryArgs = Omit<AlertProps, 'role'> & {
  role: 'auto' | 'status' | 'alert';
};

// `auto` keeps the derived-from-`variant` role reachable from the knob.
const ALERT_ROLE_BY_KEY: Record<string, AlertProps['role']> = {
  auto: undefined,
  status: 'status',
  alert: 'alert',
};

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Alert surfaces an inline, non-blocking status message, implemented from the Nebari Figma `Alert` variant set. Compose it with `AlertTitle` and `AlertDescription`, and drop a `lucide-react` icon as the first child for the leading-icon layout. The root is a live region whose role tracks severity — `role="alert"` (assertive) for `warning`/`destructive` and `role="status"` (polite) otherwise — overridable via the `role` prop.',
      },
    },
  },
  args: {
    role: 'auto',
    variant: 'default',
  },
  argTypes: {
    variant: {
      description:
        'Severity of the message. `default` is the neutral card style; `destructive` doubles as the “error” state.',
      control: 'select',
      options: ['default', 'success', 'warning', 'destructive'],
      table: { defaultValue: { summary: 'default' } },
    },
    role: {
      description:
        'ARIA live-region role. `auto` (the default) derives it from `variant` — `alert` (assertive) for `warning` and `destructive`, `status` (polite) otherwise — and an explicit role overrides that when the alert is rendered before the user acts.',
      control: 'select',
      options: ['auto', 'status', 'alert'],
      table: {
        type: { summary: "'status' | 'alert'" },
        defaultValue: { summary: 'auto (status | alert by variant)' },
      },
    },
    children: {
      description:
        'Composed content — `AlertTitle` and `AlertDescription`, plus an optional `lucide-react` icon as the first child for the leading-icon layout, and `AlertAction` for a trailing action.',
      control: false,
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<AlertStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The neutral `default` variant with an icon, title, and description.',
      },
    },
  },
  render: ({ role = 'auto', ...args }) => (
    <Alert {...args} role={ALERT_ROLE_BY_KEY[role]}>
      <Info />
      <AlertTitle>New environment available</AlertTitle>
      <AlertDescription>
        nebari-default-env 2.4.1 has been deployed to your cluster.
      </AlertDescription>
    </Alert>
  ),
};

export const Variants: Story = {
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'The neutral default plus all three severities. Colored variants tint the icon, title, description, and border with a single foreground token.',
      },
    },
  },
  render: ({ role = 'auto', ...args }) => (
    <div className="flex flex-col gap-4">
      <Alert {...args} role={ALERT_ROLE_BY_KEY[role]} variant="default">
        <Info />
        <AlertTitle>New environment available</AlertTitle>
        <AlertDescription>
          nebari-default-env 2.4.1 has been deployed to your cluster.
        </AlertDescription>
      </Alert>
      <Alert {...args} role={ALERT_ROLE_BY_KEY[role]} variant="success">
        <CircleCheck />
        <AlertTitle>Conda environment created</AlertTitle>
        <AlertDescription>
          Your environment is ready to use in a new notebook.
        </AlertDescription>
      </Alert>
      <Alert {...args} role={ALERT_ROLE_BY_KEY[role]} variant="warning">
        <TriangleAlert />
        <AlertTitle>Kernel restarted</AlertTitle>
        <AlertDescription>
          The kernel has been restarted. All variables and outputs have been
          cleared.
        </AlertDescription>
      </Alert>
      <Alert {...args} role={ALERT_ROLE_BY_KEY[role]} variant="destructive">
        <CircleAlert />
        <AlertTitle>Scheduled maintenance</AlertTitle>
        <AlertDescription>
          Nebari will be unavailable on Saturday, June 7 from 2–4 AM UTC for
          system upgrades.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const TitleOnly: Story = {
  name: 'Title only',
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'A single-line alert with just a title — no description. The icon stays aligned to the title.',
      },
    },
  },
  render: ({ role = 'auto', ...args }) => (
    <Alert {...args} role={ALERT_ROLE_BY_KEY[role]}>
      <CircleCheck />
      <AlertTitle>Conda environment created successfully</AlertTitle>
    </Alert>
  ),
};

export const WithoutIcon: Story = {
  name: 'Without icon',
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'With no leading icon the content sits flush left — the icon column collapses to zero width. Reserve the icon-less layout for the neutral default variant. When an alert conveys severity (`success`, `warning`, `destructive`), always pair it with an icon so meaning is carried by shape and not color alone (WCAG 1.4.1).',
      },
    },
  },
  render: ({ role = 'auto', ...args }) => (
    <Alert {...args} role={ALERT_ROLE_BY_KEY[role]}>
      <AlertTitle>JupyterHub 4.1 is now available</AlertTitle>
      <AlertDescription>
        Contact your administrator to schedule the upgrade.
      </AlertDescription>
    </Alert>
  ),
};

export const WithAction: Story = {
  name: 'With action',
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'An `AlertAction` pins a short action button to the top-right corner. The root reserves trailing space so it never overlaps the content.',
      },
    },
  },
  render: ({ role = 'auto', ...args }) => (
    <Alert {...args} role={ALERT_ROLE_BY_KEY[role]}>
      <Info />
      <AlertTitle>Your session will expire soon</AlertTitle>
      <AlertDescription>
        You will be signed out in 30 minutes due to inactivity.
      </AlertDescription>
      <AlertAction>
        <Button size="xs" variant="outline">
          Save
        </Button>
      </AlertAction>
    </Alert>
  ),
};

export const Dismissible: Story = {
  args: { variant: 'success' },
  parameters: {
    controls: { include: [] },
    docs: {
      description: {
        story:
          'Put a close icon button in the `AlertAction` slot and own the visibility in the caller. The Alert has no built-in dismiss state — `onClick` drives it. Because dismissing unmounts the alert, move focus to a sensible anchor so keyboard and screen-reader users are not stranded: dismissing returns focus to the `Show alert` button, and reopening returns it to the dismiss button.',
      },
    },
  },
  render: ({ role = 'auto', ...args }) => {
    const [open, setOpen] = useState(true);
    const showButtonRef = useRef<HTMLButtonElement>(null);
    const dismissButtonRef = useRef<HTMLButtonElement>(null);

    if (!open) {
      return (
        <Button
          ref={showButtonRef}
          variant="outline"
          size="sm"
          onClick={() => {
            setOpen(true);
            // Hand focus to the dismiss button once the alert remounts.
            requestAnimationFrame(() => dismissButtonRef.current?.focus());
          }}
        >
          Show alert
        </Button>
      );
    }

    return (
      <Alert {...args} role={ALERT_ROLE_BY_KEY[role]}>
        <CircleCheck />
        <AlertTitle>Conda environment created</AlertTitle>
        <AlertDescription>
          Your environment is ready to use in a new notebook.
        </AlertDescription>
        <AlertAction>
          <Button
            ref={dismissButtonRef}
            aria-label="Dismiss"
            size="icon-xs"
            variant="ghost"
            onClick={() => {
              setOpen(false);
              // The alert unmounts on dismiss; park focus on the trigger that
              // brings it back instead of dropping it to <body>.
              requestAnimationFrame(() => showButtonRef.current?.focus());
            }}
          >
            <X />
          </Button>
        </AlertAction>
      </Alert>
    );
  },
};
