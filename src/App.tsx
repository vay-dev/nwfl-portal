import { useEffect, useRef, useState, useCallback } from 'react'
import {
  AlertCircle,
  ArrowUpRight,
  Bug,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  Link,
  FolderCode,
  Layers3,
  LayoutDashboard,
  ListTodo,
  Route,
  Terminal,
} from 'lucide-react'

import {
  FEATURES,
  LAYERS,
  LOGIC,
  PROJECT,
  dependencies,
  priorities,
  type LogicEntry,
} from './data/nwflData'

import { createPortalData } from './data/createPortalData'

const data = createPortalData(PROJECT, LAYERS, FEATURES)

const {
  project,
  metrics,
  roadmap,
  bugs,
  activeFeatures,
} = data

type SectionId = 'overview' | 'roadmap' | 'bugs' | 'logic' | 'plan'

const navItems: { id: SectionId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'roadmap', label: 'Roadmap', icon: Route },
  { id: 'bugs', label: 'Bug Log', icon: Bug },
  { id: 'logic', label: 'Logic', icon: Terminal },
  { id: 'plan', label: 'Execution Plan', icon: ListTodo },
]

const statusStyles: Record<'done' | 'in-progress' | 'planned' | 'blocked', string> = {
  done: 'bg-emerald-950 text-emerald-400 ring-1 ring-emerald-800/70',
  'in-progress': 'bg-amber-950 text-amber-300 ring-1 ring-amber-800/70',
  planned: 'bg-slate-900 text-slate-300 ring-1 ring-slate-700',
  blocked: 'bg-red-950 text-red-300 ring-1 ring-red-800/70',
}

const metricStyles: Record<NonNullable<import('./data/createPortalData').Metric['tone']>, string> = {
  cyan: 'text-cyan-400',
  amber: 'text-amber-400',
  green: 'text-emerald-400',
  slate: 'text-slate-100',
}

const severityStyles: Record<import('./data/createPortalData').Severity, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-400',
  medium: 'bg-amber-400',
  low: 'bg-cyan-400',
}

const severityTextStyles: Record<import('./data/createPortalData').Severity, string> = {
  critical: 'text-red-300',
  high: 'text-orange-300',
  medium: 'text-amber-300',
  low: 'text-cyan-300',
}

function getInitialSection(): SectionId {
  const rawHash = window.location.hash.replace('#', '')
  const [section] = rawHash.split('/')
  return navItems.some((item) => item.id === section) ? (section as SectionId) : 'overview'
}

function getHashItemId(): string | null {
  const rawHash = window.location.hash.replace('#', '')
  const [, itemId] = rawHash.split('/')
  return itemId || null
}

function StatusBadge({ status }: { status: 'done' | 'in-progress' | 'planned' | 'blocked' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${statusStyles[status]}`}
    >
      {status.replace('-', ' ')}
    </span>
  )
}

function CopyLink({
  section,
  itemId,
  onCopy,
}: {
  section: string
  itemId: string
  onCopy?: (itemId: string) => void
}) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(() => {
    const hash = `#${section}/${itemId}`
    const url = `${window.location.origin}${window.location.pathname}${hash}`
    window.history.replaceState(null, '', hash)
    onCopy?.(itemId)
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }, [section, itemId, onCopy])
  return (
    <button
      type="button"
      onClick={copy}
      title="Copy link"
      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-800 hover:text-cyan-400"
    >
      <Link size={12} />
      <span className="font-mono text-[10px] tracking-wide">{copied ? 'copied!' : itemId}</span>
    </button>
  )
}

function BugCard({
  bug,
  isActive,
  onCopyLink,
}: {
  bug: import('./data/createPortalData').BugItem
  isActive: boolean
  onCopyLink: (itemId: string) => void
}) {
  return (
    <article
      id={bug.id}
      className="group card-surface grid gap-4 rounded-2xl border border-transparent p-4 transition-[border-color,box-shadow] duration-300 md:grid-cols-[auto_1fr_auto] md:items-start"
      style={isActive ? { borderColor: '#22D3EE', boxShadow: '0 0 0 1px rgba(34, 211, 238, 0.18)' } : undefined}
    >
      <div className="flex items-center gap-3 md:pt-1">
        <span className={`h-2.5 w-2.5 rounded-full ${severityStyles[bug.severity]}`} />
        <span className={`font-mono text-[11px] uppercase tracking-[0.2em] ${severityTextStyles[bug.severity]}`}>
          {bug.severity}
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
          <span className="font-mono text-[11px] text-slate-500">{bug.id}</span>
          <h3 className="text-sm font-semibold text-slate-200 md:text-[15px]">{bug.title}</h3>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-400">{bug.detail}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span>{bug.feature}</span>
          <span>{bug.fixedAt ? `Fixed ${bug.fixedAt}` : 'Not fixed yet'}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 justify-self-start md:justify-self-end">
        <span className="inline-flex rounded-md bg-emerald-950 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-400 ring-1 ring-emerald-800/70">
          {bug.status}
        </span>
        <CopyLink section="bugs" itemId={bug.id} onCopy={onCopyLink} />
      </div>
    </article>
  )
}

function RoadmapCard({
  phase,
  activeItemId,
  onCopyLink,
}: {
  phase: import('./data/createPortalData').RoadmapPhase
  activeItemId: string | null
  onCopyLink: (itemId: string) => void
}) {
  const phaseActive = activeItemId === phase.id

  return (
    <article
      id={phase.id}
      className="group card-surface rounded-2xl border border-transparent p-5 transition-[border-color,box-shadow] duration-300"
      style={phaseActive ? { borderColor: phase.accent, boxShadow: `0 0 0 1px ${phase.accent}33` } : undefined}
    >
      <div className="grid gap-4 md:grid-cols-[4px_1fr]">
        <div className="rounded-full" style={{ backgroundColor: phase.accent }} />
        <div>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold text-slate-100">{phase.name}</h3>
                <StatusBadge status={phase.status} />
                <CopyLink section="roadmap" itemId={phase.id} onCopy={onCopyLink} />
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{phase.summary}</p>
            </div>
            <div className="text-sm text-slate-500">{phase.helper}</div>
          </div>

          <div className="progress-track mt-5 h-2">
            <div
              className="progress-fill"
              style={{ width: `${phase.progress}%`, backgroundColor: phase.accent }}
            />
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-2">
            {phase.features.slice(0, 4).map((feature) => (
              <div
                id={feature.id}
                key={feature.id}
                className="group rounded-xl border border-transparent bg-slate-950/55 p-4 transition-[border-color,box-shadow] duration-300"
                style={
                  activeItemId === feature.id
                    ? { borderColor: phase.accent, boxShadow: `0 0 0 1px ${phase.accent}33` }
                    : undefined
                }
              >
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge
                    status={
                      feature.status === 'not-started' ? 'planned' : (feature.status as Exclude<'done' | 'in-progress' | 'planned' | 'blocked', 'planned'>)
                    }
                  />
                  <h4 className="text-sm font-semibold text-slate-100">{feature.name}</h4>
                  <CopyLink section="roadmap" itemId={feature.id} onCopy={onCopyLink} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">{feature.notes}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>{feature.files.length} file references</span>
                  <span>{feature.bugCount} bug records</span>
                  {feature.completedAt ? <span>Completed {feature.completedAt}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

function LogicCard({ entry }: { entry: LogicEntry }) {
  const [open, setOpen] = useState(false)
  return (
    <article className="card-surface rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 p-5 text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">{entry.category}</span>
          </div>
          <h3 className="text-[15px] font-semibold text-slate-100">{entry.title}</h3>
          <p className="mt-1.5 text-sm leading-6 text-slate-400 line-clamp-2">{entry.summary}</p>
        </div>
        <ChevronRight
          size={16}
          className={`mt-1 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-90' : ''}`}
        />
      </button>

      {open && (
        <div className="border-t border-slate-800/80 px-5 pb-5 grid gap-5 pt-5">
          {entry.endpoints.length > 0 && (
            <div>
              <div className="section-label mb-3">Endpoints / Files</div>
              <div className="grid gap-1.5">
                {entry.endpoints.map((ep, i) => (
                  <div key={i} className="rounded-lg bg-slate-900/70 px-3 py-2 font-mono text-[11px] text-slate-300 ring-1 ring-slate-800">
                    {ep}
                  </div>
                ))}
              </div>
            </div>
          )}

          {entry.flow.length > 0 && (
            <div>
              <div className="section-label mb-3">Flow</div>
              <ol className="grid gap-2">
                {entry.flow.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-6 text-slate-400">
                    <span className="mt-0.5 shrink-0 font-mono text-[10px] text-cyan-500">{String(i + 1).padStart(2, '0')}</span>
                    <span>{step.replace(/^\d+\.\s*/, '')}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {entry.decisions.length > 0 && (
            <div>
              <div className="section-label mb-3">Design Decisions</div>
              <ul className="grid gap-2">
                {entry.decisions.map((d, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-6 text-slate-400">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500/60" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {entry.gotchas.length > 0 && (
            <div>
              <div className="section-label mb-3">Gotchas</div>
              <ul className="grid gap-2">
                {entry.gotchas.map((g, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-6 text-amber-300/80">
                    <AlertCircle size={14} className="mt-1 shrink-0 text-amber-400" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

function App() {
  const [activeSection, setActiveSection] = useState<SectionId>(getInitialSection)
  const [activeHashItemId, setActiveHashItemId] = useState<string | null>(getHashItemId)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const restoringHashRef = useRef(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const fixedBugCount = bugs.filter((bug) => bug.status === 'fixed').length
  const openBugCount = bugs.length - fixedBugCount

  useEffect(() => {
    const syncHashItem = () => setActiveHashItemId(getHashItemId())
    window.addEventListener('hashchange', syncHashItem)
    return () => window.removeEventListener('hashchange', syncHashItem)
  }, [])

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.id)
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element))

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (restoringHashRef.current) return
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)
        const topEntry = visibleEntries[0]
        if (!topEntry) return
        setActiveSection(topEntry.target.id as SectionId)
      },
      {
        rootMargin: '-18% 0px -52% 0px',
        threshold: [0.2, 0.35, 0.6],
      },
    )

    sections.forEach((section) => observer.observe(section))

    const rawHash = window.location.hash.replace('#', '')
    const [section, itemId] = rawHash.split('/')
    if (sectionIds.includes(section as SectionId)) {
      const element = document.getElementById(section)
      if (element) {
        restoringHashRef.current = true
        requestAnimationFrame(() => {
          element.scrollIntoView({ block: 'start' })
          if (itemId) {
            setTimeout(() => {
              document.getElementById(itemId)?.scrollIntoView({ block: 'center' })
            }, 140)
          }
          setTimeout(() => {
            restoringHashRef.current = false
          }, 700)
        })
      }
    }

    return () => {
      sections.forEach((section) => observer.unobserve(section))
      observer.disconnect()
    }
  }, [])

  const handleNavigate = (sectionId: SectionId) => {
    setActiveSection(sectionId)
    setActiveHashItemId(null)
    setMobileSidebarOpen(false)
    window.history.replaceState(null, '', `#${sectionId}`)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="portal-shell text-slate-200">
      <div className="mx-auto flex min-h-screen w-full max-w-[1560px] flex-col lg:flex-row">
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <div>
              <div className="font-mono text-sm font-bold tracking-[0.28em] text-white">NWFL</div>
              <p className="mt-1 text-sm text-slate-500">Dev portal</p>
            </div>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen((open) => !open)}
              className="rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-slate-200"
            >
              {mobileSidebarOpen ? 'Close' : 'Sections'}
            </button>
          </div>

          <section id="overview" className="mb-8 scroll-mt-24">
            <div className="mb-8 flex flex-col gap-3">
              <p className="section-label">Overview</p>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{project.name}</h1>
                <p className="mt-2 font-mono text-xs text-slate-500 sm:text-sm">{project.subtitle}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="card-surface rounded-2xl p-5">
                  <div className={`font-mono text-4xl font-bold ${metric.tone ? metricStyles[metric.tone] : ''}`}>
                    {metric.value}
                  </div>
                  <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
                    {metric.label}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">{metric.helper}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="card-surface rounded-2xl p-5">
                <div className="section-label">Project Info</div>
                <div className="mt-4 space-y-3">
                  {[
                    ['App', project.name],
                    ['Started', project.startedAt],
                    ['Platform', project.platform],
                    ['Package', project.packageName],
                    ['Stack Size', `${project.stack.length} primary technologies`],
                  ].map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col gap-1 border-b border-slate-800/90 pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="text-sm text-slate-500">{key}</span>
                      <span className="text-sm font-medium text-slate-200">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-surface rounded-2xl p-5">
                <div className="section-label">Current Phase</div>
                <div className="mt-4 text-xl font-semibold text-cyan-400">Backend Stabilisation</div>
                <p className="mt-1 text-sm text-slate-500">
                  Fix production-breaking bugs before shipping more public pages.
                </p>
                <div className="progress-track mt-5 h-2">
                  <div className="progress-fill bg-cyan-400" style={{ width: '35%' }} />
                </div>
                <p className="mt-3 text-xs text-slate-500">2 / 7 dependency blocks resolved</p>

                <div className="mt-6 grid gap-3">
                  {priorities.map((item) => (
                    <div key={item.title} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge status={item.status} />
                        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
                          {item.owner}
                        </span>
                      </div>
                      <div className="mt-3 text-sm font-semibold text-slate-200">{item.title}</div>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="roadmap" className="mb-8 scroll-mt-24">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="section-label">Roadmap</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Layer progress</h2>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs text-slate-400 md:flex">
                <Route size={14} />
                {LAYERS.length} layers · {FEATURES.length} features
              </div>
            </div>

            <div className="grid gap-4">
              {roadmap.map((phase) => (
                <RoadmapCard key={phase.id} phase={phase} activeItemId={activeHashItemId} onCopyLink={setActiveHashItemId} />
              ))}
            </div>
          </section>

          <section id="bugs" className="mb-8 scroll-mt-24">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="section-label">Bug Log</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Production issues</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Bugs tracked per feature. Severity and fix state are shown inline.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="card-surface rounded-xl px-4 py-3">
                  <div className="font-mono text-2xl font-bold text-cyan-400">{fixedBugCount}</div>
                  <div className="text-xs text-slate-500">Fixed</div>
                </div>
                <div className="card-surface rounded-xl px-4 py-3">
                  <div className="font-mono text-2xl font-bold text-emerald-400">{openBugCount}</div>
                  <div className="text-xs text-slate-500">Open</div>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {bugs.map((bug) => (
                <BugCard key={bug.id} bug={bug} isActive={activeHashItemId === bug.id} onCopyLink={setActiveHashItemId} />
              ))}
            </div>
          </section>

          <section id="logic" className="mb-8 scroll-mt-24">
            <div className="mb-5">
              <p className="section-label">Logic</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">How things actually work</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Annotated walkthroughs of non-obvious system behaviour — endpoints, flow, design decisions, and gotchas.
              </p>
            </div>
            <div className="grid gap-3">
              {LOGIC.map((entry) => (
                <LogicCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>

          <section id="plan" className="grid gap-6 scroll-mt-24 xl:grid-cols-[0.92fr_1.08fr]">
            <div>
              <p className="section-label">Recent Real Work</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Latest completed features</h2>
              <div className="mt-5 grid gap-4">
                {activeFeatures.map((feature) => (
                  <article key={feature.title} className="card-surface rounded-2xl p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge status={feature.status} />
                      <h3 className="text-base font-semibold text-slate-100">{feature.title}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{feature.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {feature.files.map((file) => (
                        <span
                          key={file}
                          className="rounded-md bg-slate-900 px-2.5 py-1 font-mono text-[11px] text-slate-400 ring-1 ring-slate-800"
                        >
                          {file}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <p className="section-label">Execution Plan</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Dependency order</h2>

              <div className="card-surface mt-5 rounded-2xl p-5">
                <div className="flex items-center gap-3 text-cyan-400">
                  <Layers3 size={18} />
                  <h3 className="text-base font-semibold">Stable before shiny</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Fix backend stability and admin operations first, then ship public pages, then add player stats and roles. Building on a shaky foundation creates ghost bugs.
                </p>
              </div>

              <div className="card-surface mt-4 rounded-2xl p-5">
                <div className="mb-4 flex items-center gap-3 text-slate-200">
                  <FolderCode size={18} />
                  <h3 className="text-base font-semibold">Ordered delivery</h3>
                </div>

                <div className="grid gap-4">
                  {dependencies.map((item, index) => (
                    <div
                      key={item.id}
                      id={`dep-${item.id}`}
                      className="group rounded-xl border border-transparent bg-slate-950/50 p-4 transition-[border-color,box-shadow] duration-300"
                      style={
                        activeHashItemId === `dep-${item.id}`
                          ? { borderColor: '#22D3EE', boxShadow: '0 0 0 1px rgba(34, 211, 238, 0.18)' }
                          : undefined
                      }
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-sm font-semibold text-cyan-400">{item.id}.</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-semibold text-slate-100">{item.title}</h4>
                            {index === 0 ? <CheckCircle2 size={14} className="text-emerald-400" /> : null}
                            {index === 1 ? <Clock3 size={14} className="text-amber-400" /> : null}
                            {index >= 2 ? <CircleDot size={14} className="text-slate-500" /> : null}
                            <CopyLink section="plan" itemId={`dep-${item.id}`} onCopy={setActiveHashItemId} />
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{item.note}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <div className="flex items-center gap-3 text-slate-200">
                  <AlertCircle size={18} className="text-amber-400" />
                  <h3 className="text-base font-semibold">Why this portal exists</h3>
                </div>
                <ul className="mt-3 grid gap-3 text-sm leading-6 text-slate-400">
                  <li className="flex gap-3">
                    <ArrowUpRight size={16} className="mt-1 shrink-0 text-cyan-400" />
                    The roadmap comes from the real feature inventory across frontend, backend, and admin.
                  </li>
                  <li className="flex gap-3">
                    <ArrowUpRight size={16} className="mt-1 shrink-0 text-cyan-400" />
                    The bug log is flattened into readable records so issues are not hidden in chat history.
                  </li>
                  <li className="flex gap-3">
                    <ArrowUpRight size={16} className="mt-1 shrink-0 text-cyan-400" />
                    The Logic section documents non-obvious flows so future work does not rediscover old gotchas.
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </main>

        <aside
          className={`${
            mobileSidebarOpen ? 'flex' : 'hidden'
          } flex-col border-b border-slate-800/80 bg-slate-950/85 px-4 py-5 backdrop-blur lg:sticky lg:top-0 lg:order-last lg:flex lg:h-screen lg:border-b-0 lg:border-l ${
            sidebarCollapsed ? 'lg:w-[72px] lg:px-0' : 'lg:w-[260px]'
          }`}
        >
          {sidebarCollapsed ? (
            <div className="flex flex-1 flex-col items-center py-2">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-800/60 bg-cyan-950/40 font-mono text-sm font-bold text-cyan-300 hover:border-cyan-600/80 transition"
                title="Expand sidebar"
              >
                N
              </button>

              <nav className="mt-6 flex flex-col items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      title={item.label}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                        isActive
                          ? 'bg-cyan-950/60 text-cyan-300 ring-1 ring-cyan-900/80'
                          : 'text-slate-500 hover:bg-slate-900/70 hover:text-slate-200'
                      }`}
                    >
                      <Icon size={18} />
                    </button>
                  )
                })}
              </nav>

              <div className="mt-auto">
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 transition"
                  aria-label="Expand sidebar"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mt-3 font-mono text-sm font-bold tracking-[0.28em] text-white">NWFL</div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Dev portal for progress, bugs, roadmap, and execution order.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(true)}
                  className="hidden rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-slate-300 lg:inline-flex"
                  aria-label="Collapse sidebar"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <nav className="mt-6 grid gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                        isActive
                          ? 'bg-cyan-950/60 text-cyan-300 ring-1 ring-cyan-900/80'
                          : 'text-slate-400 hover:bg-slate-900/70 hover:text-slate-200'
                      }`}
                    >
                      <Icon size={18} className="shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </nav>

              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="section-label">Stack</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.stack.map((item) => (
                    <span key={item} className="rounded-md bg-slate-800 px-2.5 py-1 font-mono text-[11px] text-slate-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}

export default App
