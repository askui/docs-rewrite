import Link from 'next/link';

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Describe your test',
    body: 'Write test steps in plain Markdown. Tell the agent what to do: "sign in with the QA credentials", "check the green badge appears", "click Submit".',
  },
  {
    step: '2',
    title: 'The agent acts on screen',
    body: 'AskUI takes screenshots and uses a vision model to understand the UI. It clicks, types, and navigates like a real user, with no injected scripts.',
  },
  {
    step: '3',
    title: 'Read the report',
    body: 'Every step gets a status and a screenshot. PASSED means it actually passed. The agent never invents a workaround to reach "done".',
  },
];

const COMPONENTS = [
  {
    name: 'Desktop App',
    role: 'Author + run',
    description:
      'The visual environment for building projects, writing prompts, and watching test runs execute on your screen.',
    href: '/docs/get-started/install-desktop',
    cta: 'Install Desktop',
  },
  {
    name: 'CLI',
    role: 'Automate + scale',
    description:
      'Run projects headless, in CI, on a schedule, or across a fleet of machines. Ships with the Desktop App installer.',
    href: '/docs/get-started/install-cli',
    cta: 'Install CLI',
  },
  {
    name: 'AgentOS',
    role: 'Runtime layer',
    description:
      'The service that gives the agent direct OS control: keyboard, mouse, and screen. Runs locally or as a background service.',
    href: '/docs/agentos',
    cta: 'Explore AgentOS',
  },
];

const WHY_ASKUI = [
  {
    title: 'No selectors, no DOM',
    description:
      'The agent reads the screen the way a person does. Tests work across web, desktop, and embedded UIs where the DOM is unavailable or too brittle to rely on.',
  },
  {
    title: 'Any model, no lock-in',
    description:
      'Route agents to Claude, Gemini, OpenAI, or your own model provider. Switch models without rewriting tests. Cached steps on stable workflows cost nothing.',
  },
  {
    title: 'Any device, any OS',
    description:
      'Windows, macOS, Linux, Android, iOS, and embedded screens. Companion Mode covers devices where software installation is not an option.',
  },
  {
    title: 'Audit-ready results',
    description:
      'Every run produces a step-by-step report with a screenshot and status per step. PASSED means the step actually passed — the agent never improvises its way to done.',
  },
];

const WHERE_TO_START = [
  {
    goal: 'New to AskUI',
    action: 'Follow the Quickstart',
    href: '/docs/quickstart',
    detail: 'Account, install, and first run in under 10 minutes.',
  },
  {
    goal: 'Moving to CI',
    action: 'Install the CLI',
    href: '/docs/get-started/install-cli',
    detail: 'Run your existing project headless with askui run.',
  },
  {
    goal: 'Remote machines',
    action: 'Set up AgentOS',
    href: '/docs/agentos',
    detail: 'Install AgentOS as a service on the machine under test.',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-16">
        <p className="text-xs font-semibold tracking-widest uppercase text-fd-muted-foreground mb-5">
          AskUI Documentation
        </p>
        <h1
          className="text-5xl font-bold tracking-tight mb-5 text-fd-foreground text-balance max-w-2xl"
        >
          UI automation in plain language
        </h1>
        <p className="text-lg text-fd-muted-foreground mb-8 max-w-xl text-balance">
          Describe what to do. AskUI's AI agent acts on the real screen and returns a step-by-step
          report with screenshots. No selectors, no recording, no code.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/docs/quickstart"
            className="inline-flex items-center justify-center rounded-md bg-fd-primary text-fd-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Quickstart (10 min)
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center justify-center rounded-md border border-fd-border px-6 py-2.5 text-sm font-medium hover:bg-fd-accent transition-colors"
          >
            Browse docs
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-fd-border px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-fd-muted-foreground mb-10 text-center">
            How it works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {HOW_IT_WORKS.map(({ step, title, body }) => (
              <div key={step} className="flex flex-col gap-3">
                <div className="w-7 h-7 rounded-full border border-fd-border flex items-center justify-center text-xs font-mono font-medium text-fd-muted-foreground shrink-0">
                  {step}
                </div>
                <h3 className="font-semibold text-fd-foreground">{title}</h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Components */}
      <section className="border-t border-fd-border px-6 py-16 bg-fd-card/40">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-fd-muted-foreground mb-10 text-center">
            The three components
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COMPONENTS.map(({ name, role, description, href, cta }) => (
              <div
                key={name}
                className="flex flex-col gap-3 rounded-lg border border-fd-border bg-fd-card p-6"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-fd-foreground">{name}</h3>
                  <span className="text-xs text-fd-muted-foreground border border-fd-border rounded px-2 py-0.5 shrink-0">
                    {role}
                  </span>
                </div>
                <p className="text-sm text-fd-muted-foreground leading-relaxed flex-1">
                  {description}
                </p>
                <Link
                  href={href}
                  className="text-sm font-medium text-fd-primary hover:underline mt-1"
                >
                  {cta} &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why AskUI */}
      <section className="border-t border-fd-border px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-fd-muted-foreground mb-10 text-center">
            Why AskUI
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-8">
            {WHY_ASKUI.map(({ title, description }) => (
              <div key={title} className="flex flex-col gap-2">
                <h3 className="font-semibold text-fd-foreground">{title}</h3>
                <p className="text-sm text-fd-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where to start */}
      <section className="border-t border-fd-border px-6 py-16 bg-fd-card/40">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest uppercase text-fd-muted-foreground mb-10 text-center">
            Where to start
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {WHERE_TO_START.map(({ goal, action, href, detail }) => (
              <Link
                key={goal}
                href={href}
                className="flex flex-col gap-2 rounded-lg border border-fd-border p-5 hover:bg-fd-accent transition-colors"
              >
                <p className="text-xs font-semibold text-fd-muted-foreground uppercase tracking-wide">
                  {goal}
                </p>
                <p className="font-semibold text-fd-foreground text-sm">{action}</p>
                <p className="text-xs text-fd-muted-foreground leading-relaxed">{detail}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
