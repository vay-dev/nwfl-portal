// NWFL Dev Portal — source of truth for project state.
// Edit this file directly to update status, add bugs, or add logic entries.
// No generator — this is the hand-maintained project spec.

// ─────────────────────────────────────────────────────────────
// PROJECT META
// ─────────────────────────────────────────────────────────────

export const PROJECT = {
  name: 'NWFL Platform',
  tagline: 'Public website · Admin dashboard · Django API · Data pipeline',
  startedAt: '2024-10-01',
  platform: 'React 19 (web) + Django REST Framework',
  package: 'nwfl',
  stack: [
    'React 19',
    'Vite 8',
    'SCSS',
    'Django 6',
    'DRF',
    'PostgreSQL',
    'JWT',
    'gspread',
  ],
} as const

// ─────────────────────────────────────────────────────────────
// LAYERS (phases/modules)
// ─────────────────────────────────────────────────────────────

export const LAYERS = [
  {
    id: 'layer-backend',
    name: 'Backend Foundation',
    description: 'Django apps, models, API endpoints, JWT auth, deployment, and core business logic.',
    color: '#22c55e',
  },
  {
    id: 'layer-pipeline',
    name: 'Data Pipeline',
    description: 'Google Sheets sync, AI parsers, fuzzy team matching, standings recalculation.',
    color: '#3b82f6',
  },
  {
    id: 'layer-admin',
    name: 'Admin Dashboard',
    description: 'React 19 internal dashboard for match entry, team management, media, and user invitations.',
    color: '#8b5cf6',
  },
  {
    id: 'layer-public',
    name: 'Public Frontend',
    description: 'Fan-facing React website: home, teams, standings, fixtures, stats, analytics.',
    color: '#f59e0b',
  },
  {
    id: 'layer-stats',
    name: 'Player & Stats',
    description: 'Player database, match events, Golden Boot, cards, substitutions, and advanced analytics.',
    color: '#ec4899',
  },
  {
    id: 'layer-ops',
    name: 'Operations & Roles',
    description: 'Role-based access, match commissioner workflow, audit log, and admin-first data flow.',
    color: '#14b8a6',
  },
] as const

// ─────────────────────────────────────────────────────────────
// FEATURES
// ─────────────────────────────────────────────────────────────

export const FEATURES = [
  // ── LAYER 0 — Backend Foundation ────────────────────────────
  {
    id: 'f-jwt-auth',
    layerId: 'layer-backend',
    name: 'JWT Authentication',
    status: 'done',
    startedAt: '2024-10-15',
    completedAt: '2024-11-01',
    timeSpentHours: null,
    notes: 'POST /api/auth/login/ and /api/auth/refresh/ using djangorestframework-simplejwt. Access token 8h, refresh 7d. PublicTokenObtainPairView allows login even with stale tokens.',
    files: [
      'core/urls.py',
      'core/auth_views.py',
      'nwfl-admin/src/lib/api.ts',
    ],
    bugs: [
      {
        id: 'b-auth-001',
        severity: 'critical',
        description: 'Logout calls RefreshToken.blacklist() but rest_framework_simplejwt.token_blacklist is not in INSTALLED_APPS and has no migration. This will crash in production.',
        status: 'open',
      },
    ],
  },
  {
    id: 'f-team-model',
    layerId: 'layer-backend',
    name: 'Team Model & API',
    status: 'done',
    startedAt: '2024-10-01',
    completedAt: '2024-10-20',
    timeSpentHours: null,
    notes: 'Team model with name, short_name, slug, city, state, group, founded, manager, logo, titles, bio. DRF CRUD endpoint at /api/teams/.',
    files: [
      'teams/models.py',
      'teams/serializers.py',
      'teams/views.py',
    ],
    bugs: [],
  },
  {
    id: 'f-match-model',
    layerId: 'layer-backend',
    name: 'Match & Goal Models',
    status: 'done',
    startedAt: '2024-10-01',
    completedAt: '2025-06-01',
    timeSpentHours: null,
    notes: 'Match model with home/away teams, season, matchday, date, kick_off, venue, status, full-time and half-time scores, notes. Goal model with scorer_name, minute, side, penalty, own-goal.',
    files: [
      'matches/models.py',
      'matches/serializers.py',
      'matches/views.py',
    ],
    bugs: [],
  },
  {
    id: 'f-standing-model',
    layerId: 'layer-backend',
    name: 'Standing Model (Multi-Season)',
    status: 'done',
    startedAt: '2025-05-01',
    completedAt: '2025-06-01',
    timeSpentHours: null,
    notes: 'Changed from OneToOneField to ForeignKey with unique_together=[team, season]. Auto-recalculates on Match save via post_save signal. Supports 2021/22, 2023/24, 2024/25, 2025/26.',
    files: [
      'standings/models.py',
      'matches/signals.py',
      'standings/management/commands/recalculate_standings.py',
    ],
    bugs: [],
  },
  {
    id: 'f-analytics-models',
    layerId: 'layer-backend',
    name: 'Analytics Models',
    status: 'in-progress',
    startedAt: '2025-04-01',
    completedAt: null,
    timeSpentHours: null,
    notes: 'TeamMatchStat and TeamSeasonStat models exist with possession, shots, cards, etc., but only goals-related fields are populated. Cards and advanced stats are schema-only.',
    files: [
      'analytics/models.py',
      'analytics/views.py',
      'analytics/management/commands/compute_season_stats.py',
    ],
    bugs: [
      {
        id: 'b-analytics-001',
        severity: 'critical',
        description: 'compute_season_stats aggregates all completed matches regardless of season, then labels the output with --season. TeamSeasonStatViewSet has no ?season filter.',
        status: 'open',
      },
      {
        id: 'b-analytics-002',
        severity: 'medium',
        description: 'TeamMatchStatViewSet filters by team slug and matchday but not by season.',
        status: 'open',
      },
    ],
  },
  {
    id: 'f-deployment',
    layerId: 'layer-backend',
    name: 'Deployment & CI/CD',
    status: 'done',
    startedAt: '2024-11-01',
    completedAt: '2024-12-01',
    timeSpentHours: null,
    notes: 'GitHub Actions deploys main branch to EC2. Runs migrate, collectstatic, reloads nginx and systemd nwfl-api service. Gunicorn with 4 workers. nginx client_max_body_size 20M.',
    files: [
      '.github/workflows/deploy.yml',
      'nwfl-api.service',
      'nginx/nwfl-api.conf',
    ],
    bugs: [],
  },

  // ── LAYER 1 — Data Pipeline ─────────────────────────────────
  {
    id: 'f-sheet-sync',
    layerId: 'layer-pipeline',
    name: 'Google Sheets Results Sync',
    status: 'done',
    startedAt: '2024-11-01',
    completedAt: '2025-05-15',
    timeSpentHours: null,
    notes: 'sync_from_sheet command reads results worksheet via gspread. Parses FTHG/FTAG/HTHG/HTAG, goals, remarks, notes, season per row. Fuzzy team matching strips suffixes. Calls recalculate_standings after sync.',
    files: [
      'matches/management/commands/sync_from_sheet.py',
      'matches/management/commands/import_from_sheet.py',
    ],
    bugs: [
      {
        id: 'b-pipeline-001',
        severity: 'high',
        description: 'sync_from_sheet API wrapper hardcodes /home/ubuntu/nwfl-backend paths and Python interpreter. Breaks on non-EC2 environments.',
        status: 'open',
      },
    ],
  },
  {
    id: 'f-fixtures-sync',
    layerId: 'layer-pipeline',
    name: 'Google Sheets Fixtures Sync',
    status: 'done',
    startedAt: '2025-03-01',
    completedAt: '2025-05-15',
    timeSpentHours: null,
    notes: 'Fixtures mode reads fixtures worksheet and creates UPCOMING matches with null scores. Will not overwrite completed matches.',
    files: [
      'matches/management/commands/sync_from_sheet.py',
    ],
    bugs: [],
  },
  {
    id: 'f-ai-match-parser',
    layerId: 'layer-pipeline',
    name: 'AI Match Parser',
    status: 'done',
    startedAt: '2025-02-01',
    completedAt: '2025-04-01',
    timeSpentHours: null,
    notes: 'OpenRouter/Anthropic parser extracts match details from free-form text. Used in admin MatchForm and dedicated parser endpoints.',
    files: [
      'etl/services/ai_parser.py',
      'nwfl-admin/src/components/domain/AIParserBox.tsx',
    ],
    bugs: [],
  },
  {
    id: 'f-ai-whatsapp-parser',
    layerId: 'layer-pipeline',
    name: 'AI WhatsApp Parser',
    status: 'done',
    startedAt: '2025-04-01',
    completedAt: '2025-05-01',
    timeSpentHours: null,
    notes: 'parse_whatsapp extracts multiple matches from a chat export. Admin has approve/skip UI. Backend parser exists but endpoint is not registered in urls.py.',
    files: [
      'etl/services/ai_parser.py',
      'nwfl-admin/src/pages/WhatsAppParser/index.tsx',
      'core/urls.py',
    ],
    bugs: [
      {
        id: 'b-pipeline-002',
        severity: 'critical',
        description: 'Admin calls POST /api/internal/parse-whatsapp/ but the endpoint is not registered in core/urls.py.',
        status: 'open',
      },
    ],
  },
  {
    id: 'f-ai-team-parser',
    layerId: 'layer-pipeline',
    name: 'AI Team Parser & Researcher',
    status: 'done',
    startedAt: '2025-05-01',
    completedAt: '2025-06-01',
    timeSpentHours: null,
    notes: 'parse_team extracts team profiles from text or image. Playwright researcher can search the web for missing team info. Admin has checkTeams/researchTeams flow.',
    files: [
      'etl/services/ai_parser.py',
      'etl/services/playwright_researcher.py',
      'nwfl-admin/src/components/domain/TeamAIParser.tsx',
    ],
    bugs: [],
  },
  {
    id: 'f-ai-standings-parser',
    layerId: 'layer-pipeline',
    name: 'AI Standings Parser',
    status: 'done',
    startedAt: '2025-05-01',
    completedAt: '2025-06-01',
    timeSpentHours: null,
    notes: 'parse_standings reads standings tables from text or image. Admin updates existing standing rows after review.',
    files: [
      'etl/services/ai_parser.py',
      'nwfl-admin/src/components/domain/StandingsAIParser.tsx',
    ],
    bugs: [],
  },
  {
    id: 'f-auto-standings',
    layerId: 'layer-pipeline',
    name: 'Auto Standings Recalculation',
    status: 'done',
    startedAt: '2025-05-01',
    completedAt: '2025-06-01',
    timeSpentHours: null,
    notes: 'post_save signal on Match recalculates all standings for the match season when a result is saved. recalculate_standings command also supports --season.',
    files: [
      'matches/signals.py',
      'standings/management/commands/recalculate_standings.py',
    ],
    bugs: [],
  },

  // ── LAYER 2 — Admin Dashboard ───────────────────────────────
  {
    id: 'f-admin-auth',
    layerId: 'layer-admin',
    name: 'Admin Authentication',
    status: 'done',
    startedAt: '2025-01-01',
    completedAt: '2025-02-01',
    timeSpentHours: null,
    notes: 'JWT login, silent refresh on 401, route guard, logout. Invitations flow for superadmin/staff onboarding.',
    files: [
      'nwfl-admin/src/lib/api.ts',
      'nwfl-admin/src/hooks/useAuth.tsx',
      'nwfl-admin/src/pages/Login/index.tsx',
    ],
    bugs: [],
  },
  {
    id: 'f-admin-matches',
    layerId: 'layer-admin',
    name: 'Match Management',
    status: 'done',
    startedAt: '2025-02-01',
    completedAt: '2025-05-01',
    timeSpentHours: null,
    notes: 'Match list with season/status/matchday/group filters. Entry Desk table view and Results card view. Add/edit modal with full MatchForm including half-time scores and AI parser box.',
    files: [
      'nwfl-admin/src/pages/Matches/index.tsx',
      'nwfl-admin/src/components/domain/MatchForm.tsx',
    ],
    bugs: [],
  },
  {
    id: 'f-admin-teams',
    layerId: 'layer-admin',
    name: 'Team Management',
    status: 'in-progress',
    startedAt: '2025-03-01',
    completedAt: null,
    timeSpentHours: null,
    notes: 'Grouped team grid with edit modal and AI import. TeamForm supports logo upload via FormData. There is no manual "Create Team" button; adding a new team currently requires a backend shell command.',
    files: [
      'nwfl-admin/src/pages/Teams/index.tsx',
      'nwfl-admin/src/components/domain/TeamForm.tsx',
    ],
    bugs: [
      {
        id: 'b-admin-001',
        severity: 'high',
        description: 'Teams page has no manual Create Team button. TeamForm is edit-only. Adding Pelican Stars required backend shell.',
        status: 'open',
      },
    ],
  },
  {
    id: 'f-admin-standings',
    layerId: 'layer-admin',
    name: 'Standings View & Edit',
    status: 'in-progress',
    startedAt: '2025-04-01',
    completedAt: null,
    timeSpentHours: null,
    notes: 'Editable standings table with Group A/B coloring, inline number inputs, derived GD, and batch Save. Header hardcodes "Season 2024/25" even though API supports ?season=.',
    files: [
      'nwfl-admin/src/pages/Standings/index.tsx',
      'nwfl-admin/src/components/domain/StandingsTable.tsx',
    ],
    bugs: [
      {
        id: 'b-admin-002',
        severity: 'high',
        description: 'Standings page has no season selector. Header hardcodes 2024/25.',
        status: 'open',
      },
    ],
  },
  {
    id: 'f-admin-media',
    layerId: 'layer-admin',
    name: 'Media Library',
    status: 'done',
    startedAt: '2025-05-01',
    completedAt: '2025-06-01',
    timeSpentHours: null,
    notes: 'Drag/drop/folder upload, SHA-256 duplicate detection, AI tag suggestions, search by tags, preview, edit tags, delete. Missing logos page suggests media images for teams.',
    files: [
      'nwfl-admin/src/pages/MediaLibrary/index.tsx',
      'nwfl-admin/src/pages/MissingLogos/index.tsx',
    ],
    bugs: [],
  },
  {
    id: 'f-admin-sync',
    layerId: 'layer-admin',
    name: 'Sheet Sync Page',
    status: 'done',
    startedAt: '2025-05-01',
    completedAt: '2025-06-01',
    timeSpentHours: null,
    notes: 'Buttons to sync results or fixtures from Google Sheets. Polls /api/internal/sync-status/ for live log output.',
    files: [
      'nwfl-admin/src/pages/Sync/index.tsx',
    ],
    bugs: [
      {
        id: 'b-admin-003',
        severity: 'medium',
        description: 'Sync polling stops only when status.log includes "Done." — brittle string matching.',
        status: 'open',
      },
    ],
  },
  {
    id: 'f-admin-invitations',
    layerId: 'layer-admin',
    name: 'Invitations',
    status: 'done',
    startedAt: '2025-05-01',
    completedAt: '2025-06-01',
    timeSpentHours: null,
    notes: 'Superadmin can send/revoke email invitations. AcceptInvite page creates user and auto-logs in.',
    files: [
      'nwfl-admin/src/pages/Invitations/index.tsx',
      'nwfl-admin/src/pages/AcceptInvite/index.tsx',
    ],
    bugs: [],
  },

  // ── LAYER 3 — Public Frontend ───────────────────────────────
  {
    id: 'f-public-home',
    layerId: 'layer-public',
    name: 'Home Page',
    status: 'done',
    startedAt: '2024-10-01',
    completedAt: '2025-03-01',
    timeSpentHours: null,
    notes: 'Hero with match carousel, news section, rising stars, league section with fixtures/standings. News and players are still mocked.',
    files: [
      'src/pages/Home/Home.jsx',
      'src/components/Hero/Hero.jsx',
      'src/components/NewsSection/NewsSection.jsx',
      'src/components/RisingStars/RisingStars.jsx',
    ],
    bugs: [
      {
        id: 'b-public-001',
        severity: 'medium',
        description: 'Hero title says "We are recruiting" with "Apply Now" CTA. Wrong messaging for an NWFL league site.',
        status: 'open',
      },
      {
        id: 'b-public-002',
        severity: 'medium',
        description: 'NewsSection links to /news-log which does not exist in App.jsx.',
        status: 'open',
      },
    ],
  },
  {
    id: 'f-public-teams',
    layerId: 'layer-public',
    name: 'Teams & Team Detail',
    status: 'done',
    startedAt: '2024-11-01',
    completedAt: '2025-04-01',
    timeSpentHours: null,
    notes: 'Filterable team grid with inline panel. TeamDetail shows hero, about, honours. Both fetch from /api/teams/.',
    files: [
      'src/pages/Teams/Teams.jsx',
      'src/pages/Teams/TeamDetail.jsx',
    ],
    bugs: [
      {
        id: 'b-public-003',
        severity: 'high',
        description: 'TeamDetail calls fetchTeams() without a season argument. Standings and next-match data merged inside fetchTeams use the backend default season, not the user-selected season.',
        status: 'open',
      },
    ],
  },
  {
    id: 'f-public-analytics',
    layerId: 'layer-public',
    name: 'Analytics Page',
    status: 'done',
    startedAt: '2025-03-01',
    completedAt: '2025-05-01',
    timeSpentHours: null,
    notes: 'Charts for goal difference, clean sheets, and average goals scored/conceded using Recharts.',
    files: [
      'src/pages/Analytics/Analytics.jsx',
    ],
    bugs: [
      {
        id: 'b-public-004',
        severity: 'high',
        description: 'Analytics calls fetchStandings() without a season and hardcodes "2024/25" subtitle.',
        status: 'open',
      },
    ],
  },
  {
    id: 'f-public-match-center',
    layerId: 'layer-public',
    name: 'Match Center',
    status: 'planned',
    startedAt: null,
    completedAt: null,
    timeSpentHours: null,
    notes: 'Placeholder route exists (/match-center renders ComingSoon). This should become the primary fixtures/results browsing page with filters by season, matchday, group, and status.',
    files: [
      'src/pages/ComingSoon/ComingSoon.jsx',
    ],
    bugs: [],
  },
  {
    id: 'f-public-stats',
    layerId: 'layer-public',
    name: 'Stats Page',
    status: 'planned',
    startedAt: null,
    completedAt: null,
    timeSpentHours: null,
    notes: 'Placeholder route exists (/stats renders one-line placeholder). Needs player stats, top scorers, cards, etc. Requires Player model.',
    files: [
      'src/pages/Stats/Stats.jsx',
    ],
    bugs: [],
  },
  {
    id: 'f-public-news',
    layerId: 'layer-public',
    name: 'News Section',
    status: 'planned',
    startedAt: null,
    completedAt: null,
    timeSpentHours: null,
    notes: 'Placeholder route exists. Home page already has a mocked NewsSection. Could be static at first, then a simple CMS later.',
    files: [
      'src/pages/ComingSoon/ComingSoon.jsx',
      'src/data/mockNews.js',
    ],
    bugs: [],
  },
  {
    id: 'f-public-media',
    layerId: 'layer-public',
    name: 'Media Channel',
    status: 'planned',
    startedAt: null,
    completedAt: null,
    timeSpentHours: null,
    notes: 'Placeholder route exists. Could pull tagged images from the admin media library API.',
    files: [
      'src/pages/ComingSoon/ComingSoon.jsx',
    ],
    bugs: [],
  },
  {
    id: 'f-public-about',
    layerId: 'layer-public',
    name: 'About Page',
    status: 'planned',
    startedAt: null,
    completedAt: null,
    timeSpentHours: null,
    notes: 'Placeholder route exists. Static league/about content.',
    files: [
      'src/pages/ComingSoon/ComingSoon.jsx',
    ],
    bugs: [],
  },

  // ── LAYER 4 — Player & Stats ────────────────────────────────
  {
    id: 'f-player-model',
    layerId: 'layer-stats',
    name: 'Player Database',
    status: 'planned',
    startedAt: null,
    completedAt: null,
    timeSpentHours: null,
    notes: 'No Player model exists. Goals are stored with scorer_name string only. To track Golden Boot, cards, and lineups, a Player model linked to Team is required.',
    files: [],
    bugs: [],
  },
  {
    id: 'f-match-events',
    layerId: 'layer-stats',
    name: 'Match Events (Goals, Cards, Substitutions)',
    status: 'planned',
    startedAt: null,
    completedAt: null,
    timeSpentHours: null,
    notes: 'Goal model exists but only tracks name, minute, side, penalty, own-goal. Need event types (yellow/red card, substitution), player FK, and timeline rendering.',
    files: [
      'matches/models.py',
    ],
    bugs: [],
  },
  {
    id: 'f-top-scorers',
    layerId: 'layer-stats',
    name: 'Top Scorers / Golden Boot',
    status: 'planned',
    startedAt: null,
    completedAt: null,
    timeSpentHours: null,
    notes: 'Blocked by Player model. Once goals link to Player, aggregate per season and expose /api/stats/top-scorers/.',
    files: [],
    bugs: [],
  },

  // ── LAYER 5 — Operations & Roles ────────────────────────────
  {
    id: 'f-rbac',
    layerId: 'layer-ops',
    name: 'Role-Based Access Control',
    status: 'planned',
    startedAt: null,
    completedAt: null,
    timeSpentHours: null,
    notes: 'Only superadmin/staff roles exist. Need Match Commissioner, Content Editor, Read-only roles with fine-grained permissions.',
    files: [
      'invitations/models.py',
    ],
    bugs: [],
  },
  {
    id: 'f-commissioner-workflow',
    layerId: 'layer-ops',
    name: 'Match Commissioner Workflow',
    status: 'in-progress',
    startedAt: '2025-05-01',
    completedAt: null,
    timeSpentHours: null,
    notes: 'AI parsers extract data; human approves before it becomes official. Need explicit "publish" state on Match so drafts do not appear on public site.',
    files: [
      'nwfl-admin/src/pages/WhatsAppParser/index.tsx',
      'nwfl-admin/src/components/domain/MatchesAIParser.tsx',
    ],
    bugs: [],
  },
  {
    id: 'f-audit-log',
    layerId: 'layer-ops',
    name: 'Audit Log',
    status: 'planned',
    startedAt: null,
    completedAt: null,
    timeSpentHours: null,
    notes: 'Track who created/updated matches, standings, teams, and when. Required for an official league system.',
    files: [],
    bugs: [],
  },
] as const

// ─────────────────────────────────────────────────────────────
// LOGIC — human-readable technical explanations
// ─────────────────────────────────────────────────────────────

export interface LogicEntry {
  id: string
  title: string
  category: string
  summary: string
  endpoints: string[]
  flow: string[]
  decisions: string[]
  gotchas: string[]
}

export const LOGIC: LogicEntry[] = [
  {
    id: 'logic-season-handling',
    title: 'How Seasons Work',
    category: 'Data Model',
    summary: 'Every Match and Standing belongs to a season string like "2024/25". The API filters by ?season= and the admin/public frontend must pass the selected season to every relevant call.',
    endpoints: [
      'GET /api/matches/?season=2024/25',
      'GET /api/standings/?season=2024/25',
      'GET /api/matches/seasons/',
    ],
    flow: [
      '1. Admin or public frontend loads the list of distinct seasons from /api/matches/seasons/.',
      '2. Default season is set to the newest season in the list.',
      '3. Every standings, matches, and analytics call includes ?season= to avoid returning all 557 matches.',
      '4. Match post_save signal recalculates standings only for the match\'s own season.',
    ],
    decisions: [
      'Season is a CharField, not a separate model — seasons are cheap to create and filter.',
      'Standing has unique_together=[team, season] so a team can have one row per season.',
    ],
    gotchas: [
      'TeamDetail and Analytics currently ignore season — they always use the backend default.',
      'compute_season_stats currently aggregates all seasons; this must be fixed before per-season stats are trustworthy.',
    ],
  },
  {
    id: 'logic-sheet-sync',
    title: 'How Google Sheets Sync Works',
    category: 'Data Pipeline',
    summary: 'Results and fixtures are imported from a shared Google Sheet using gspread. Fuzzy team matching maps sheet names to DB teams. After results sync, standings are recalculated automatically.',
    endpoints: [
      'POST /api/internal/sync-sheet/',
      'management command: python manage.py sync_from_sheet --season 2024/25',
      'management command: python manage.py import_from_sheet <path.html> --wipe-existing',
    ],
    flow: [
      '1. Admin clicks "Sync Results" or "Sync Fixtures" in /sync.',
      '2. Backend runs sync_from_sheet with GOOGLE_SHEETS_CREDENTIALS.',
      '3. For each row, the script strips team suffixes (FC, Ladies, etc.) and matches against Team name/short_name/slug.',
      '4. Goals are parsed from "PlayerName (45, 67)" strings and created as Goal records.',
      '5. If results mode, recalculate_standings is called for the season.',
      '6. Sync log is written to sync.log and polled by the admin UI.',
    ],
    decisions: [
      'Sheet is the primary data entry tool today, but the long-term target is admin-first entry with sheet sync as a backup.',
      'Fixtures sync will not overwrite already-completed matches.',
    ],
    gotchas: [
      'The API wrapper hardcodes /home/ubuntu/nwfl-backend paths; it only works on the EC2 deploy.',
      'Unknown team names cause rows to be skipped. A dry-run shows these before writing.',
    ],
  },
  {
    id: 'logic-standings-recalc',
    title: 'How Standings Are Recalculated',
    category: 'Business Logic',
    summary: 'Standings are derived from completed Match records per season. A post_save signal triggers recalculation, and a management command can rebuild them on demand.',
    endpoints: [
      'signal: matches/signals.py',
      'command: python manage.py recalculate_standings --season 2024/25',
    ],
    flow: [
      '1. When a Match with status=FT and non-null scores is saved, the signal fires.',
      '2. The signal schedules recalculation via transaction.on_commit.',
      '3. recalculate_standings aggregates all FT matches for that season.',
      '4. For each team, it computes played, won, drawn, lost, gf, ga, points.',
      '5. Standing rows are created or updated with unique_together=[team, season].',
    ],
    decisions: [
      'Standings are stored, not computed on every API request, to keep the frontend fast.',
      'The Standing model previously used OneToOneField which blocked multi-season data. It was migrated to ForeignKey + unique_together.',
    ],
    gotchas: [
      'Standing.Meta.ordering does not separate Group A/B; callers must filter by team__group.',
      'Form property queries last 5 matches and may return fewer than 5 if history is short.',
    ],
  },
  {
    id: 'logic-ai-parser-flow',
    title: 'How AI Parsers Feed the Dashboard',
    category: 'Operations',
    summary: 'AI parsers are "drafters". They extract structured data from unstructured text or images, but a human must review and approve before the data becomes official.',
    endpoints: [
      'POST /api/internal/parse-match/',
      'POST /api/internal/parse-whatsapp/',
      'POST /api/internal/parse-matches-bulk/',
      'POST /api/internal/parse-team/',
      'POST /api/internal/parse-standings/',
    ],
    flow: [
      '1. User pastes text or uploads an image to an AI parser UI.',
      '2. Backend calls OpenRouter/Anthropic and returns structured JSON.',
      '3. Admin UI maps team names to DB teams via fuzzy matching or research.',
      '4. User reviews each extracted record and clicks Approve or Skip.',
      '5. Approved records are POSTed/PATCHed to the normal CRUD endpoints.',
      '6. Match approvals trigger standings recalculation.',
    ],
    decisions: [
      'AI is never allowed to write directly to the database without approval.',
      'Vision fallback modal gives copy-paste prompts for ChatGPT/Gemini/Grok when the backend AI is unavailable.',
    ],
    gotchas: [
      '/api/internal/parse-whatsapp/ is implemented but not registered in urls.py.',
      'AI can hallucinate team names; the UnmatchedTeamCard flow exists to resolve these.',
    ],
  },
  {
    id: 'logic-media-upload',
    title: 'How Media Library Deduplication Works',
    category: 'Media',
    summary: 'Uploaded images are deduplicated by SHA-256 file hash. Tags are AI-suggested and editable. Images can be searched by tags and assigned to teams as logos.',
    endpoints: [
      'POST /api/media/images/',
      'GET /api/media/images/',
      'GET /api/media/images/search-by-tags/?tags=...',
      'GET /api/internal/teams-missing-logos/',
    ],
    flow: [
      '1. Admin drags images into the Media Library page.',
      '2. Client computes SHA-256 and checks against existing file_hash values.',
      '3. New images are uploaded; duplicates are flagged.',
      '4. AI suggests tags for each image.',
      '5. Images are tagged and searchable.',
      '6. Missing Logos page suggests images for teams without logos.',
    ],
    decisions: [
      'Deduplication happens at upload time to avoid storage bloat.',
      'Tags are stored as JSON array; search is simple substring matching on the backend.',
    ],
    gotchas: [
      'Large uploads were previously blocked by nginx client_max_body_size; now set to 20M.',
      'AI tag suggestion depends on the same vision model; it falls back gracefully if unavailable.',
    ],
  },
  {
    id: 'logic-jwt-auth',
    title: 'How Admin Authentication Works',
    category: 'Auth',
    summary: 'The admin dashboard uses JWT access/refresh tokens stored in localStorage. Silent refresh on 401 keeps sessions alive. Logout blacklists the refresh token.',
    endpoints: [
      'POST /api/auth/login/',
      'POST /api/auth/refresh/',
      'GET /api/auth/me/',
      'POST /api/auth/logout/',
    ],
    flow: [
      '1. User logs in with username/password.',
      '2. Backend returns access + refresh tokens.',
      '3. Tokens are stored in localStorage.',
      '4. Every API request attaches Authorization: Bearer {access}.',
      '5. On 401, the request is retried once after refreshing the access token.',
      '6. If refresh fails, tokens are cleared and user is redirected to /login.',
    ],
    decisions: [
      'Tokens are stored in localStorage because the admin is a SPA on a trusted subdomain.',
      'PublicTokenObtainPairView is configured so stale tokens do not block re-login.',
    ],
    gotchas: [
      'Logout will crash until token_blacklist is added to INSTALLED_APPS and migrated.',
      'No password reset flow exists yet.',
    ],
  },
] as const

// ─────────────────────────────────────────────────────────────
// PRIORITIES — current execution order
// ─────────────────────────────────────────────────────────────

export interface PriorityItem {
  title: string
  status: 'done' | 'in-progress' | 'planned' | 'blocked'
  owner: string
  detail: string
}

export const priorities: PriorityItem[] = [
  {
    title: 'Fix production-breaking backend bugs',
    status: 'in-progress',
    owner: 'backend',
    detail: 'Logout crash, missing WhatsApp endpoint, and season-aware analytics must be fixed before any public launch.',
  },
  {
    title: 'Close admin operational gaps',
    status: 'in-progress',
    owner: 'admin',
    detail: 'Add season selector to standings, manual team creation, and remove fake notifications.',
  },
  {
    title: 'Ship Match Center on public frontend',
    status: 'planned',
    owner: 'frontend',
    detail: 'Highest-value public page that can be built entirely from existing match data.',
  },
  {
    title: 'Make all public pages season-aware',
    status: 'planned',
    owner: 'frontend',
    detail: 'TeamDetail and Analytics currently ignore the selected season.',
  },
]

// ─────────────────────────────────────────────────────────────
// DEPENDENCIES — ordered delivery
// ─────────────────────────────────────────────────────────────

export interface DependencyItem {
  id: string
  title: string
  note: string
}

export const dependencies: DependencyItem[] = [
  {
    id: '01',
    title: 'Backend stability',
    note: 'Fix logout crash, register WhatsApp endpoint, and make analytics season-aware. Without this, the admin and public frontend cannot trust the data.',
  },
  {
    id: '02',
    title: 'Admin operational completeness',
    note: 'Season selector on standings, manual team creation, and reliable sync status. These unblock daily league operations without shell commands.',
  },
  {
    id: '03',
    title: 'Public Match Center',
    note: 'Ship a real fixtures/results page. Uses existing API; high fan value.',
  },
  {
    id: '04',
    title: 'Season-aware public frontend',
    note: 'Apply useSeason hook to TeamDetail, Analytics, and any new pages.',
  },
  {
    id: '05',
    title: 'Player model and stats',
    note: 'Introduce Player, link Goal to Player, build Golden Boot and cards leaderboards. This unlocks the /stats page.',
  },
  {
    id: '06',
    title: 'Role-based access control',
    note: 'Add Match Commissioner and Content Editor roles. Move from superadmin/staff to fine-grained permissions.',
  },
  {
    id: '07',
    title: 'Audit log and publish states',
    note: 'Track who changed what. Add a published/draft state for matches so AI/parser drafts do not appear publicly.',
  },
]
