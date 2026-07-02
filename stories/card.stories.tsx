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

const singleCardClassName = 'w-[min(calc(100vw-3rem),22.5rem)] min-w-0';
const rowCardClassName = 'w-full min-w-0';
const responsiveTwoCardGridClassName =
  'grid w-[min(calc(100vw-3rem),42rem)] grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-4';
const responsiveThreeCardGridClassName =
  'grid w-[min(calc(100vw-3rem),56rem)] grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-4';

export const Default: Story = {
  render: ({ showFooter, showHeader, ...args }) => (
    <Card {...args} className={singleCardClassName}>
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
    <div className={responsiveTwoCardGridClassName}>
      <Card className={rowCardClassName}>
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
      <Card className={rowCardClassName} size="sm">
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
    <Card className={singleCardClassName}>
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
    <div className={responsiveThreeCardGridClassName}>
      <Card className={rowCardClassName}>
        <CardHeader>
          <CardTitle>Title only</CardTitle>
        </CardHeader>
      </Card>
      <Card className={rowCardClassName}>
        <CardHeader>
          <CardTitle>With description</CardTitle>
          <CardDescription>Use supporting copy for context.</CardDescription>
        </CardHeader>
      </Card>
      <Card className={rowCardClassName}>
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
    <div className={responsiveThreeCardGridClassName}>
      <Card className={rowCardClassName}>
        <CardHeader>
          <CardTitle>Single action</CardTitle>
          <CardDescription>Primary command aligned left.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button size="sm">Create</Button>
        </CardFooter>
      </Card>
      <Card className={rowCardClassName}>
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
      <Card className={rowCardClassName}>
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
    <div className={responsiveThreeCardGridClassName}>
      {[
        {
          className: 'w-full min-w-0 [--card-spacing:--spacing(4)]',
          label: '16px',
        },
        {
          className: 'w-full min-w-0 [--card-spacing:--spacing(5)]',
          label: '20px',
        },
        {
          className: 'w-full min-w-0 [--card-spacing:--spacing(6)]',
          label: '24px',
        },
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
    <Card className={singleCardClassName}>
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
