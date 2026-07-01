import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, CalendarDays } from 'lucide-react';
import type * as React from 'react';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/ui/card';
import { Field, FieldLabel } from '@/ui/field';
import { Input } from '@/ui/input';

type CardStoryArgs = React.ComponentProps<typeof Card> & {
  showFooter?: boolean;
  showHeader?: boolean;
};

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Card groups related content and actions in a static surface. Compose it with CardHeader, CardTitle, CardDescription, CardAction, CardContent, and CardFooter.',
      },
    },
  },
  args: {
    showFooter: true,
    showHeader: true,
    size: 'default',
  },
  argTypes: {
    size: {
      control: 'select',
      description: 'Controls the default spacing used by the card sections.',
      options: ['default', 'sm'],
      table: { defaultValue: { summary: 'default' } },
    },
    showHeader: {
      control: 'boolean',
      description: 'Story-only toggle for rendering CardHeader.',
      table: { defaultValue: { summary: 'true' } },
    },
    showFooter: {
      control: 'boolean',
      description: 'Story-only toggle for rendering CardFooter.',
      table: { defaultValue: { summary: 'true' } },
    },
    className: { table: { disable: true } },
    children: { table: { disable: true } },
  },
} satisfies Meta<CardStoryArgs>;

export default meta;

type Story = StoryObj<CardStoryArgs>;

export const Default: Story = {
  render: ({ showFooter, showHeader, ...args }) => (
    <Card {...args} className="w-[360px]">
      {showHeader && (
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
          <CardAction>
            <Button size="sm" variant="link">
              Sign Up
            </Button>
          </CardAction>
        </CardHeader>
      )}
      <CardContent>
        <form className="grid gap-3">
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input placeholder="name@example.com" type="email" />
          </Field>
          <Field>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel>Password</FieldLabel>
              <Button
                className="h-auto px-0 py-0"
                size="sm"
                type="button"
                variant="link"
              >
                Forgot your password?
              </Button>
            </div>
            <Input type="password" />
          </Field>
        </form>
      </CardContent>
      {showFooter && (
        <CardFooter className="flex-col items-stretch">
          <Button>Login</Button>
          <Button variant="outline">Login with SSO</Button>
        </CardFooter>
      )}
    </Card>
  ),
};

export const Sizes: Story = {
  name: 'Size',
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="w-[300px]">
        <CardHeader>
          <CardTitle>Default Card</CardTitle>
          <CardDescription>Standard section spacing.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Use the default size for forms, summaries, and grouped content.
          </p>
        </CardContent>
        <CardFooter>
          <Button size="sm" variant="outline">
            Action
          </Button>
        </CardFooter>
      </Card>
      <Card className="w-[300px]" size="sm">
        <CardHeader>
          <CardTitle>Small Card</CardTitle>
          <CardDescription>Compact section spacing.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Use small cards where density matters inside dashboards.
          </p>
        </CardContent>
        <CardFooter>
          <Button size="sm" variant="outline">
            Action
          </Button>
        </CardFooter>
      </Card>
    </div>
  ),
};

export const WithAction: Story = {
  name: 'With action',
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Environment status</CardTitle>
        <CardDescription>nebari-default-env is ready.</CardDescription>
        <CardAction>
          <Badge variant="secondary">Healthy</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Version</dt>
            <dd className="font-medium">2.4.1</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Python</dt>
            <dd className="font-medium">3.12</dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="outline">
          View details
          <ArrowRight />
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const HeaderExamples: Story = {
  name: 'Header examples',
  render: () => (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="w-[260px]">
        <CardHeader>
          <CardTitle>Title only</CardTitle>
        </CardHeader>
      </Card>
      <Card className="w-[260px]">
        <CardHeader>
          <CardTitle>With description</CardTitle>
          <CardDescription>Use supporting copy for context.</CardDescription>
        </CardHeader>
      </Card>
      <Card className="w-[260px]">
        <CardHeader className="border-b">
          <CardTitle>With action</CardTitle>
          <CardDescription>Action aligns to the top-right.</CardDescription>
          <CardAction>
            <Badge variant="outline">Live</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Content begins below the separated header.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const FooterExamples: Story = {
  name: 'Footer examples',
  render: () => (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="w-[260px]">
        <CardHeader>
          <CardTitle>Single action</CardTitle>
          <CardDescription>Primary command aligned left.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button size="sm">Create</Button>
        </CardFooter>
      </Card>
      <Card className="w-[260px]">
        <CardHeader>
          <CardTitle>Action pair</CardTitle>
          <CardDescription>Cancel and confirm side by side.</CardDescription>
        </CardHeader>
        <CardFooter className="justify-end">
          <Button size="sm" variant="outline">
            Cancel
          </Button>
          <Button size="sm">Confirm</Button>
        </CardFooter>
      </Card>
      <Card className="w-[260px]">
        <CardHeader>
          <CardTitle>Separated footer</CardTitle>
          <CardDescription>
            Footer can carry secondary metadata.
          </CardDescription>
        </CardHeader>
        <CardFooter className="border-t justify-between">
          <span className="text-muted-foreground text-sm">Updated now</span>
          <Button size="sm" variant="outline">
            View
          </Button>
        </CardFooter>
      </Card>
    </div>
  ),
};

export const CustomSpacing: Story = {
  name: 'Custom spacing',
  render: () => (
    <div className="grid gap-4 sm:grid-cols-3">
      {[
        { className: 'w-[220px] [--card-spacing:--spacing(4)]', label: '16px' },
        { className: 'w-[220px] [--card-spacing:--spacing(5)]', label: '20px' },
        { className: 'w-[220px] [--card-spacing:--spacing(6)]', label: '24px' },
      ].map((card) => (
        <Card className={card.className} key={card.label}>
          <CardHeader>
            <CardTitle>{card.label}</CardTitle>
            <CardDescription>Shared section spacing.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Header, content, and footer stay aligned.
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};

export const EdgeToEdgeContent: Story = {
  name: 'Edge-to-edge content',
  render: () => (
    <Card className="w-[360px]">
      <div className="flex aspect-video items-end bg-secondary p-(--card-spacing)">
        <Badge>
          <CalendarDays />
          Featured
        </Badge>
      </div>
      <CardHeader>
        <CardTitle>Design systems meetup</CardTitle>
        <CardDescription>
          Practical patterns for component APIs and documentation.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button size="sm" variant="outline">
          View event
        </Button>
      </CardFooter>
    </Card>
  ),
};
