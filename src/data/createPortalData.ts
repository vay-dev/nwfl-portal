// Shared factory — derives portal view-models from any project data file.
// Used for both Pendu and Bistropulse.

export type Status = 'done' | 'in-progress' | 'planned' | 'blocked'
export type Severity = 'critical' | 'high' | 'medium' | 'low'
type RawStatus = 'done' | 'in-progress' | 'not-started' | 'blocked'

export interface ProjectMeta {
  name: string
  subtitle: string
  startedAt: string
  platform: string
  packageName: string
  stack: string[]
}

export interface Metric {
  label: string
  value: string
  tone?: 'cyan' | 'amber' | 'green' | 'slate'
  helper: string
}

export interface BugItem {
  id: string
  severity: Severity
  title: string
  detail: string
  feature: string
  status: 'fixed' | 'open'
  fixedAt?: string
}

export interface LayerFeature {
  id: string
  name: string
  status: RawStatus
  notes: string
  files: string[]
  completedAt: string | null
  bugCount: number
}

export interface RoadmapPhase {
  id: string
  name: string
  status: Status
  summary: string
  progress: number
  accent: string
  helper: string
  features: LayerFeature[]
}

export interface FeatureCard {
  title: string
  status: Status
  summary: string
  files: string[]
}

export interface PortalData {
  project: ProjectMeta
  metrics: Metric[]
  roadmap: RoadmapPhase[]
  bugs: BugItem[]
  activeFeatures: FeatureCard[]
}

function normalizeText(value: string): string {
  return value
    .replaceAll('â€"', '—')
    .replaceAll('\u00e2\u0086\u2019', '\u2192')
    .replaceAll('âœ•', '✕')
    .replaceAll('âœ"', '✓')
    .replaceAll('â±', '⏱')
    .replaceAll('Â·', '·')
    .replaceAll('â‚¦', '₦')
}

function normalizeStatus(status: RawStatus): Status {
  return status === 'not-started' ? 'planned' : status
}

export function createPortalData(
  PROJECT: { name: string; tagline: string; startedAt: string; platform: string; package: string; stack: readonly string[] },
  LAYERS: readonly { id: string; name: string; description: string; color: string }[],
  FEATURES: readonly {
    id: string
    layerId: string
    name: string
    status: string
    startedAt: string | null
    completedAt: string | null
    timeSpentHours: null
    notes: string
    files: readonly string[]
    bugs: readonly { id: string; severity: string; description: string; status: string; fixedAt?: string }[]
  }[],
): PortalData {
  const allFeatures = FEATURES.map((f) => ({
    ...f,
    status: f.status as RawStatus,
    name: normalizeText(f.name),
    notes: normalizeText(f.notes),
    files: f.files.map((file) => normalizeText(file)),
    bugs: f.bugs.map((bug) => ({ ...bug, description: normalizeText(bug.description) })),
  }))

  const project: ProjectMeta = {
    name: normalizeText(PROJECT.name),
    subtitle: normalizeText(PROJECT.tagline),
    startedAt: PROJECT.startedAt,
    platform: normalizeText(PROJECT.platform),
    packageName: normalizeText(PROJECT.package),
    stack: PROJECT.stack.map((s) => normalizeText(s)),
  }

  const allBugs = allFeatures.flatMap((f) =>
    f.bugs.map((bug) => ({
      id: bug.id,
      severity: bug.severity as Severity,
      title: bug.description.split('—')[0]?.trim() || bug.description.slice(0, 72),
      detail: bug.description,
      feature: f.name,
      status: bug.status as 'fixed' | 'open',
      fixedAt: bug.fixedAt ?? undefined,
    })),
  )

  const doneFeatures = allFeatures.filter((f) => f.status === 'done')
  const inProgressFeatures = allFeatures.filter((f) => f.status === 'in-progress')
  const plannedFeatures = allFeatures.filter((f) => f.status === 'not-started')
  const openBugs = allBugs.filter((b) => b.status === 'open')
  const fixedBugs = allBugs.filter((b) => b.status === 'fixed')

  const metrics: Metric[] = [
    {
      label: 'Features Done',
      value: String(doneFeatures.length),
      tone: 'cyan',
      helper: `${allFeatures.length} total tracked features`,
    },
    {
      label: 'In Progress',
      value: String(inProgressFeatures.length),
      tone: 'amber',
      helper: `${plannedFeatures.length} not started`,
    },
    {
      label: 'Phases',
      value: String(LAYERS.length),
      tone: 'slate',
      helper: `${LAYERS.length} layers tracked`,
    },
    {
      label: 'Bugs Fixed',
      value: String(fixedBugs.length),
      tone: 'green',
      helper: `${openBugs.length} currently open`,
    },
  ]

  const roadmap: RoadmapPhase[] = LAYERS.map((layer) => {
    const features = allFeatures.filter((f) => f.layerId === layer.id)
    const doneCount = features.filter((f) => f.status === 'done').length
    const progress = features.length === 0 ? 0 : Math.round((doneCount / features.length) * 100)
    const layerStatus: Status =
      features.some((f) => f.status === 'in-progress')
        ? 'in-progress'
        : progress === 100
          ? 'done'
          : doneCount === 0
            ? 'planned'
            : 'in-progress'

    return {
      id: layer.id,
      name: normalizeText(layer.name),
      status: layerStatus,
      summary: normalizeText(layer.description),
      progress,
      accent: layer.color,
      helper: `${doneCount} / ${features.length} features shipped`,
      features: features.map((f) => ({
        id: f.id,
        name: f.name,
        status: f.status,
        notes: f.notes,
        files: [...f.files],
        completedAt: f.completedAt,
        bugCount: f.bugs.length,
      })),
    }
  })

  const bugs: BugItem[] = [...allBugs].sort((a, b) => {
    const aDate = a.fixedAt ?? ''
    const bDate = b.fixedAt ?? ''
    return bDate.localeCompare(aDate) || b.id.localeCompare(a.id)
  })

  const activeFeatures: FeatureCard[] = [...doneFeatures]
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
    .slice(0, 3)
    .map((f) => ({
      title: f.name,
      status: normalizeStatus(f.status),
      summary: f.notes,
      files: f.files.slice(0, 4),
    }))

  return { project, metrics, roadmap, bugs, activeFeatures }
}
