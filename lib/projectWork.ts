'use client'

/**
 * PROJECT WORK — data layer
 * ============================================================================
 * A project/task execution system for internal teams, living inside the
 * employee portal's To-Do List.
 *
 * WHY SEPARATE COLLECTIONS (and not the existing `tasks` collection):
 * `tasks` is subscribed with an unfiltered `onSnapshot(collection(db,'tasks'))`
 * in employeePortalContext, so every task in the company reaches every client.
 * Adding project tasks there would make them appear inside the existing Tasks
 * page — a regression. These live in their own collections instead, and the
 * existing Tasks module is left completely untouched.
 *
 * AUTHORIZATION: every mutation here re-checks the caller's role. That is a
 * convenience/UX layer only — the real enforcement is in firestore.rules,
 * because a client can always call Firestore directly.
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Timestamp,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebaseConfig'
import { isAdminOrSubAdmin } from './employeePortalContext'

// ============================================================================
// COLLECTIONS
// ============================================================================

export const PROJECTS_COLLECTION = 'projects'
export const PROJECT_TASKS_COLLECTION = 'projectTasks'
export const PROJECT_TASK_EVENTS_COLLECTION = 'projectTaskEvents'

// ============================================================================
// STATUS MODEL
// ============================================================================

export const PROJECT_TASK_STATUSES = [
  'NOT_STARTED',
  'AVAILABLE',
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED_AWAITING_CONFIRMATION',
  'CHANGES_REQUESTED',
  'CONFIRMED',
  'BLOCKED',
  'CANCELLED',
] as const

export type ProjectTaskStatus = (typeof PROJECT_TASK_STATUSES)[number]

/** Human labels + the portal's existing colour vocabulary. */
export const STATUS_META: Record<
  ProjectTaskStatus,
  { label: string; short: string; tone: 'neutral' | 'info' | 'warning' | 'success' | 'danger' }
> = {
  NOT_STARTED: { label: 'Not Started', short: 'Not Started', tone: 'neutral' },
  AVAILABLE: { label: 'Available to Claim', short: 'Available', tone: 'info' },
  ASSIGNED: { label: 'Assigned', short: 'Assigned', tone: 'info' },
  IN_PROGRESS: { label: 'In Progress', short: 'In Progress', tone: 'info' },
  COMPLETED_AWAITING_CONFIRMATION: {
    label: 'Completed — Awaiting Confirmation',
    short: 'Awaiting Confirmation',
    tone: 'warning',
  },
  CHANGES_REQUESTED: { label: 'Changes Requested', short: 'Changes Requested', tone: 'danger' },
  CONFIRMED: { label: 'Confirmed', short: 'Confirmed', tone: 'success' },
  BLOCKED: { label: 'Blocked', short: 'Blocked', tone: 'danger' },
  CANCELLED: { label: 'Cancelled', short: 'Cancelled', tone: 'neutral' },
}

/**
 * Allowed transitions, split by who may perform them.
 *
 * The single most important rule in this system: an employee can never reach
 * CONFIRMED. Submitting only ever gets them to
 * COMPLETED_AWAITING_CONFIRMATION — management moves it the last step.
 */
export const EMPLOYEE_TRANSITIONS: Partial<Record<ProjectTaskStatus, ProjectTaskStatus[]>> = {
  AVAILABLE: ['ASSIGNED'], // via claim
  ASSIGNED: ['IN_PROGRESS', 'BLOCKED'],
  IN_PROGRESS: ['COMPLETED_AWAITING_CONFIRMATION', 'BLOCKED'],
  CHANGES_REQUESTED: ['IN_PROGRESS'],
  BLOCKED: ['IN_PROGRESS'],
}

export const MANAGER_TRANSITIONS: Partial<Record<ProjectTaskStatus, ProjectTaskStatus[]>> = {
  NOT_STARTED: ['AVAILABLE', 'ASSIGNED', 'CANCELLED', 'BLOCKED'],
  AVAILABLE: ['ASSIGNED', 'NOT_STARTED', 'CANCELLED', 'BLOCKED'],
  ASSIGNED: ['IN_PROGRESS', 'AVAILABLE', 'NOT_STARTED', 'CANCELLED', 'BLOCKED'],
  IN_PROGRESS: ['COMPLETED_AWAITING_CONFIRMATION', 'ASSIGNED', 'CANCELLED', 'BLOCKED'],
  COMPLETED_AWAITING_CONFIRMATION: ['CONFIRMED', 'CHANGES_REQUESTED', 'CANCELLED'],
  CHANGES_REQUESTED: ['IN_PROGRESS', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS'], // reopen
  BLOCKED: ['IN_PROGRESS', 'ASSIGNED', 'AVAILABLE', 'CANCELLED'],
  CANCELLED: ['NOT_STARTED'],
}

export function canTransition(
  from: ProjectTaskStatus,
  to: ProjectTaskStatus,
  isManager: boolean
): boolean {
  const map = isManager ? MANAGER_TRANSITIONS : EMPLOYEE_TRANSITIONS
  return (map[from] ?? []).includes(to)
}

/** Statuses that count as "done" for progress maths. Only CONFIRMED counts. */
export const PROGRESS_DONE_STATUSES: ProjectTaskStatus[] = ['CONFIRMED']
/** Statuses excluded from the denominator (cancelled work isn't outstanding). */
export const PROGRESS_EXCLUDED_STATUSES: ProjectTaskStatus[] = ['CANCELLED']

// ============================================================================
// PRIORITY — reuses the existing portal vocabulary rather than inventing P0..P3
// ============================================================================

export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export const PRIORITY_META: Record<TaskPriority, { label: string; rank: number }> = {
  urgent: { label: 'Urgent', rank: 0 },
  high: { label: 'High', rank: 1 },
  medium: { label: 'Medium', rank: 2 },
  low: { label: 'Low', rank: 3 },
}

// ============================================================================
// TYPES
// ============================================================================

export interface Project {
  id?: string
  name: string
  description: string
  status: 'active' | 'archived'
  createdBy: string
  createdByName: string
  createdAt: Timestamp
  updatedAt: Timestamp
  archivedAt?: Timestamp | null
}

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface ProjectTask {
  id?: string
  projectId: string
  projectName: string // denormalised so lists render without an extra read

  title: string
  description: string
  priority: TaskPriority
  status: ProjectTaskStatus

  /** Employee ID. Empty when the task is unclaimed/role-pooled. */
  assignedTo?: string | null
  assignedToName?: string | null
  /** Department/team the task belongs to, e.g. "Web Development". */
  assignedRole?: string | null
  /** When true and status is AVAILABLE, matching employees may claim it. */
  allowClaiming: boolean

  dueDate?: string | null
  checklist?: ChecklistItem[]
  referenceUrl?: string | null
  blockedReason?: string | null

  createdBy: string
  createdByName: string
  createdAt: Timestamp
  updatedAt: Timestamp

  selectedBy?: string | null
  selectedByName?: string | null
  selectedAt?: Timestamp | null

  completedBy?: string | null
  completedByName?: string | null
  completedAt?: Timestamp | null
  submissionNote?: string | null

  confirmedBy?: string | null
  confirmedByName?: string | null
  confirmedAt?: Timestamp | null

  /** Feedback from a manager when sending work back. */
  reviewComment?: string | null
  /** Increments each time the employee resubmits after changes. */
  submissionCount?: number
}

export type ProjectTaskAction =
  | 'created'
  | 'updated'
  | 'assigned'
  | 'reassigned'
  | 'claimed'
  | 'started'
  | 'submitted'
  | 'confirmed'
  | 'changes_requested'
  | 'reopened'
  | 'blocked'
  | 'unblocked'
  | 'cancelled'
  | 'restored'

export interface ProjectTaskEvent {
  id?: string
  taskId: string
  projectId: string
  action: ProjectTaskAction
  actorId: string
  actorName: string
  at: Timestamp
  fromStatus?: ProjectTaskStatus | null
  toStatus?: ProjectTaskStatus | null
  note?: string | null
}

/** Minimal actor shape — avoids importing the whole EmployeeProfile. */
export interface Actor {
  employeeId: string
  name: string
  role?: string
  department?: string
}

// ============================================================================
// PERMISSIONS (UX layer — firestore.rules is the real gate)
// ============================================================================

export const canManageProjects = (actor?: Actor | null): boolean =>
  !!actor && isAdminOrSubAdmin(actor.role)

export const canConfirmTask = (actor?: Actor | null): boolean =>
  !!actor && isAdminOrSubAdmin(actor.role)

/** Is this actor the person the task is assigned to? */
export const isTaskOwner = (task: ProjectTask, actor?: Actor | null): boolean =>
  !!actor && !!task.assignedTo && task.assignedTo === actor.employeeId

/** May this actor claim this task right now? */
export function canClaimTask(task: ProjectTask, actor?: Actor | null): boolean {
  if (!actor) return false
  if (task.status !== 'AVAILABLE' || !task.allowClaiming) return false
  if (task.assignedTo) return false
  // Role-pooled tasks are only claimable by that team (managers bypass).
  if (task.assignedRole && !isAdminOrSubAdmin(actor.role)) {
    return (actor.department || '').toLowerCase() === task.assignedRole.toLowerCase()
  }
  return true
}

/** Can the actor see this task at all? */
export function canViewTask(task: ProjectTask, actor?: Actor | null): boolean {
  if (!actor) return false
  if (isAdminOrSubAdmin(actor.role)) return true
  if (task.assignedTo === actor.employeeId) return true
  if (task.status === 'AVAILABLE' && task.allowClaiming) return canClaimTask(task, actor)
  return false
}

// ============================================================================
// AUDIT
// ============================================================================

async function recordEvent(
  taskId: string,
  projectId: string,
  action: ProjectTaskAction,
  actor: Actor,
  extra: { fromStatus?: ProjectTaskStatus | null; toStatus?: ProjectTaskStatus | null; note?: string | null } = {}
): Promise<void> {
  try {
    await addDoc(collection(db, PROJECT_TASK_EVENTS_COLLECTION), {
      taskId,
      projectId,
      action,
      actorId: actor.employeeId,
      actorName: actor.name,
      at: serverTimestamp(),
      fromStatus: extra.fromStatus ?? null,
      toStatus: extra.toStatus ?? null,
      note: extra.note ?? null,
    })
  } catch (err) {
    // An audit write failing must not roll back the user's action, but it is
    // worth surfacing — a silent gap in the trail is worse than a noisy log.
    console.error('[projectWork] failed to record audit event:', action, err)
  }
}

export function subscribeTaskEvents(
  taskId: string,
  cb: (events: ProjectTaskEvent[]) => void,
  max = 50
): Unsubscribe {
  const q = query(
    collection(db, PROJECT_TASK_EVENTS_COLLECTION),
    where('taskId', '==', taskId),
    orderBy('at', 'desc'),
    limit(max)
  )
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ProjectTaskEvent[]),
    (err) => {
      console.error('[projectWork] task events listener error:', err)
      cb([])
    }
  )
}

// ============================================================================
// PROJECTS
// ============================================================================

export function subscribeProjects(
  cb: (projects: Project[]) => void,
  opts: { includeArchived?: boolean } = {}
): Unsubscribe {
  const constraints: QueryConstraint[] = []
  if (!opts.includeArchived) constraints.push(where('status', '==', 'active'))
  constraints.push(orderBy('createdAt', 'desc'))

  return onSnapshot(
    query(collection(db, PROJECTS_COLLECTION), ...constraints),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Project[]),
    (err) => {
      console.error('[projectWork] projects listener error:', err)
      cb([])
    }
  )
}

export async function createProject(
  input: { name: string; description?: string },
  actor: Actor
): Promise<string> {
  if (!canManageProjects(actor)) throw new Error('Unauthorized: only Admin/Co-Admin can create projects')
  const name = input.name.trim()
  if (!name) throw new Error('Project name is required')

  const ref = await addDoc(collection(db, PROJECTS_COLLECTION), {
    name,
    description: (input.description || '').trim(),
    status: 'active',
    createdBy: actor.employeeId,
    createdByName: actor.name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    archivedAt: null,
  })
  return ref.id
}

export async function updateProject(
  projectId: string,
  updates: Partial<Pick<Project, 'name' | 'description'>>,
  actor: Actor
): Promise<void> {
  if (!canManageProjects(actor)) throw new Error('Unauthorized: only Admin/Co-Admin can edit projects')
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() }
  if (updates.name !== undefined) {
    const n = updates.name.trim()
    if (!n) throw new Error('Project name cannot be empty')
    payload.name = n
  }
  if (updates.description !== undefined) payload.description = updates.description.trim()
  await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), payload)
}

export async function setProjectArchived(
  projectId: string,
  archived: boolean,
  actor: Actor
): Promise<void> {
  if (!canManageProjects(actor)) throw new Error('Unauthorized: only Admin/Co-Admin can archive projects')
  await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), {
    status: archived ? 'archived' : 'active',
    archivedAt: archived ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  })
}

// ============================================================================
// TASK QUERIES
// ============================================================================

/**
 * Managers see everything (optionally scoped to one project). Employees get
 * two narrow queries instead of the whole collection: their own tasks, plus
 * the claimable pool for their team.
 */
export function subscribeProjectTasks(
  actor: Actor,
  cb: (tasks: ProjectTask[]) => void,
  opts: { projectId?: string } = {}
): Unsubscribe {
  const col = collection(db, PROJECT_TASKS_COLLECTION)
  const manager = isAdminOrSubAdmin(actor.role)

  const onErr = (err: unknown) => {
    console.error('[projectWork] tasks listener error:', err)
    cb([])
  }

  if (manager) {
    const constraints: QueryConstraint[] = []
    if (opts.projectId) constraints.push(where('projectId', '==', opts.projectId))
    constraints.push(orderBy('createdAt', 'desc'))
    return onSnapshot(
      query(col, ...constraints),
      (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ProjectTask[]),
      onErr
    )
  }

  // Employee: merge "mine" + "claimable by my team" from two listeners.
  let mine: ProjectTask[] = []
  let claimable: ProjectTask[] = []
  const emit = () => {
    const seen = new Map<string, ProjectTask>()
    for (const t of [...mine, ...claimable]) if (t.id) seen.set(t.id, t)
    cb(Array.from(seen.values()))
  }

  const unsubMine = onSnapshot(
    query(col, where('assignedTo', '==', actor.employeeId)),
    (snap) => {
      mine = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ProjectTask[]
      if (opts.projectId) mine = mine.filter((t) => t.projectId === opts.projectId)
      emit()
    },
    onErr
  )

  const unsubPool = onSnapshot(
    query(col, where('status', '==', 'AVAILABLE'), where('allowClaiming', '==', true)),
    (snap) => {
      claimable = (snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ProjectTask[]).filter((t) =>
        canClaimTask(t, actor)
      )
      if (opts.projectId) claimable = claimable.filter((t) => t.projectId === opts.projectId)
      emit()
    },
    onErr
  )

  return () => {
    unsubMine()
    unsubPool()
  }
}

// ============================================================================
// TASK MUTATIONS
// ============================================================================

export interface CreateTaskInput {
  projectId: string
  projectName: string
  title: string
  description?: string
  priority?: TaskPriority
  assignedTo?: string | null
  assignedToName?: string | null
  assignedRole?: string | null
  allowClaiming?: boolean
  dueDate?: string | null
  checklist?: ChecklistItem[]
  referenceUrl?: string | null
  initialStatus?: Extract<ProjectTaskStatus, 'NOT_STARTED' | 'AVAILABLE' | 'ASSIGNED'>
}

export async function createProjectTask(input: CreateTaskInput, actor: Actor): Promise<string> {
  if (!canManageProjects(actor)) throw new Error('Unauthorized: only Admin/Co-Admin can create tasks')

  const title = input.title.trim()
  if (!title) throw new Error('Task title is required')
  if (!input.projectId) throw new Error('A project is required')

  const assignedTo = input.assignedTo || null
  // Keep status honest with the assignment: an assigned task is ASSIGNED,
  // an unassigned claimable one is AVAILABLE.
  let status: ProjectTaskStatus = input.initialStatus || (assignedTo ? 'ASSIGNED' : 'NOT_STARTED')
  if (assignedTo) status = 'ASSIGNED'
  else if (status === 'ASSIGNED') status = 'NOT_STARTED'

  const ref = await addDoc(collection(db, PROJECT_TASKS_COLLECTION), {
    projectId: input.projectId,
    projectName: input.projectName,
    title,
    description: (input.description || '').trim(),
    priority: input.priority || 'medium',
    status,
    assignedTo,
    assignedToName: input.assignedToName || null,
    assignedRole: input.assignedRole || null,
    allowClaiming: input.allowClaiming ?? !assignedTo,
    dueDate: input.dueDate || null,
    checklist: input.checklist || [],
    referenceUrl: input.referenceUrl || null,
    blockedReason: null,
    createdBy: actor.employeeId,
    createdByName: actor.name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    selectedBy: null,
    selectedByName: null,
    selectedAt: null,
    completedBy: null,
    completedByName: null,
    completedAt: null,
    submissionNote: null,
    confirmedBy: null,
    confirmedByName: null,
    confirmedAt: null,
    reviewComment: null,
    submissionCount: 0,
  })

  await recordEvent(ref.id, input.projectId, 'created', actor, { toStatus: status })
  if (assignedTo) {
    await recordEvent(ref.id, input.projectId, 'assigned', actor, {
      toStatus: status,
      note: `Assigned to ${input.assignedToName || assignedTo}`,
    })
  }
  return ref.id
}

export async function updateProjectTask(
  taskId: string,
  updates: Partial<
    Pick<
      ProjectTask,
      | 'title'
      | 'description'
      | 'priority'
      | 'dueDate'
      | 'assignedRole'
      | 'allowClaiming'
      | 'checklist'
      | 'referenceUrl'
    >
  >,
  actor: Actor
): Promise<void> {
  if (!canManageProjects(actor)) throw new Error('Unauthorized: only Admin/Co-Admin can edit tasks')
  const payload: Record<string, unknown> = { ...updates, updatedAt: serverTimestamp() }
  if (typeof updates.title === 'string') {
    const t = updates.title.trim()
    if (!t) throw new Error('Task title cannot be empty')
    payload.title = t
  }
  const snap = await getDoc(doc(db, PROJECT_TASKS_COLLECTION, taskId))
  await updateDoc(doc(db, PROJECT_TASKS_COLLECTION, taskId), payload)
  await recordEvent(taskId, (snap.data() as ProjectTask | undefined)?.projectId || '', 'updated', actor)
}

/** Assign or reassign. Managers only. */
export async function assignProjectTask(
  taskId: string,
  assignee: { employeeId: string; name: string } | null,
  actor: Actor
): Promise<void> {
  if (!canManageProjects(actor)) throw new Error('Unauthorized: only Admin/Co-Admin can assign tasks')

  const ref = doc(db, PROJECT_TASKS_COLLECTION, taskId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Task not found')
  const task = snap.data() as ProjectTask
  const had = !!task.assignedTo

  const nextStatus: ProjectTaskStatus = assignee
    ? task.status === 'NOT_STARTED' || task.status === 'AVAILABLE'
      ? 'ASSIGNED'
      : task.status
    : 'AVAILABLE'

  await updateDoc(ref, {
    assignedTo: assignee?.employeeId ?? null,
    assignedToName: assignee?.name ?? null,
    status: nextStatus,
    allowClaiming: assignee ? false : true,
    updatedAt: serverTimestamp(),
  })

  await recordEvent(taskId, task.projectId, had ? 'reassigned' : 'assigned', actor, {
    fromStatus: task.status,
    toStatus: nextStatus,
    note: assignee ? `Assigned to ${assignee.name}` : 'Returned to the available pool',
  })
}

/**
 * Claim an available task.
 *
 * Runs in a transaction that re-reads the document: if another employee won
 * the race, the status/assignee will already have changed and we abort rather
 * than overwrite them. Two simultaneous clicks cannot both succeed.
 */
export async function claimProjectTask(taskId: string, actor: Actor): Promise<void> {
  const ref = doc(db, PROJECT_TASKS_COLLECTION, taskId)

  const claimed = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists()) throw new Error('Task not found')
    const task = snap.data() as ProjectTask

    if (task.assignedTo) throw new Error('This task has already been taken')
    if (task.status !== 'AVAILABLE' || !task.allowClaiming) {
      throw new Error('This task is no longer available')
    }
    if (!canClaimTask(task, actor)) throw new Error('This task is not available to your team')

    tx.update(ref, {
      assignedTo: actor.employeeId,
      assignedToName: actor.name,
      status: 'ASSIGNED' as ProjectTaskStatus,
      allowClaiming: false,
      selectedBy: actor.employeeId,
      selectedByName: actor.name,
      selectedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return task
  })

  await recordEvent(taskId, claimed.projectId, 'claimed', actor, {
    fromStatus: 'AVAILABLE',
    toStatus: 'ASSIGNED',
    note: `Claimed by ${actor.name}`,
  })
}

/** Employee starts / re-starts work. */
export async function startProjectTask(taskId: string, actor: Actor): Promise<void> {
  const ref = doc(db, PROJECT_TASKS_COLLECTION, taskId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Task not found')
  const task = snap.data() as ProjectTask

  const manager = isAdminOrSubAdmin(actor.role)
  if (!manager && !isTaskOwner(task, actor)) throw new Error('This task is not assigned to you')
  if (!canTransition(task.status, 'IN_PROGRESS', manager)) {
    throw new Error(`Cannot start a task that is ${STATUS_META[task.status].label}`)
  }

  await updateDoc(ref, { status: 'IN_PROGRESS', blockedReason: null, updatedAt: serverTimestamp() })
  await recordEvent(taskId, task.projectId, 'started', actor, {
    fromStatus: task.status,
    toStatus: 'IN_PROGRESS',
  })
}

/**
 * Employee submits finished work.
 *
 * This is the furthest an employee can move a task — it lands in
 * COMPLETED_AWAITING_CONFIRMATION, never CONFIRMED.
 */
export async function submitProjectTask(
  taskId: string,
  note: string | null,
  actor: Actor
): Promise<void> {
  const ref = doc(db, PROJECT_TASKS_COLLECTION, taskId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Task not found')
  const task = snap.data() as ProjectTask

  const manager = isAdminOrSubAdmin(actor.role)
  if (!manager && !isTaskOwner(task, actor)) throw new Error('This task is not assigned to you')
  if (!canTransition(task.status, 'COMPLETED_AWAITING_CONFIRMATION', manager)) {
    throw new Error(`Cannot submit a task that is ${STATUS_META[task.status].label}`)
  }

  await updateDoc(ref, {
    status: 'COMPLETED_AWAITING_CONFIRMATION',
    completedBy: actor.employeeId,
    completedByName: actor.name,
    completedAt: serverTimestamp(),
    submissionNote: note?.trim() || null,
    // Clear any previous review so stale feedback isn't shown against new work.
    reviewComment: null,
    submissionCount: (task.submissionCount || 0) + 1,
    updatedAt: serverTimestamp(),
  })

  await recordEvent(taskId, task.projectId, 'submitted', actor, {
    fromStatus: task.status,
    toStatus: 'COMPLETED_AWAITING_CONFIRMATION',
    note: note?.trim() || null,
  })
}

/** Manager confirms. The only path into CONFIRMED. */
export async function confirmProjectTask(
  taskId: string,
  actor: Actor,
  note?: string | null
): Promise<void> {
  if (!canConfirmTask(actor)) throw new Error('Unauthorized: only Admin/Co-Admin can confirm tasks')

  const ref = doc(db, PROJECT_TASKS_COLLECTION, taskId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Task not found')
  const task = snap.data() as ProjectTask

  if (!canTransition(task.status, 'CONFIRMED', true)) {
    throw new Error(`Cannot confirm a task that is ${STATUS_META[task.status].label}`)
  }

  await updateDoc(ref, {
    status: 'CONFIRMED',
    confirmedBy: actor.employeeId,
    confirmedByName: actor.name,
    confirmedAt: serverTimestamp(),
    reviewComment: note?.trim() || null,
    updatedAt: serverTimestamp(),
  })

  await recordEvent(taskId, task.projectId, 'confirmed', actor, {
    fromStatus: task.status,
    toStatus: 'CONFIRMED',
    note: note?.trim() || null,
  })
}

/** Manager sends work back with feedback. */
export async function requestChangesOnTask(
  taskId: string,
  reason: string,
  actor: Actor
): Promise<void> {
  if (!canConfirmTask(actor)) throw new Error('Unauthorized: only Admin/Co-Admin can review tasks')
  const comment = reason.trim()
  if (!comment) throw new Error('Please say what needs changing')

  const ref = doc(db, PROJECT_TASKS_COLLECTION, taskId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Task not found')
  const task = snap.data() as ProjectTask

  if (!canTransition(task.status, 'CHANGES_REQUESTED', true)) {
    throw new Error(`Cannot request changes on a task that is ${STATUS_META[task.status].label}`)
  }

  await updateDoc(ref, {
    status: 'CHANGES_REQUESTED',
    reviewComment: comment,
    confirmedBy: null,
    confirmedByName: null,
    confirmedAt: null,
    updatedAt: serverTimestamp(),
  })

  await recordEvent(taskId, task.projectId, 'changes_requested', actor, {
    fromStatus: task.status,
    toStatus: 'CHANGES_REQUESTED',
    note: comment,
  })
}

/** Manager reopens a confirmed task. */
export async function reopenProjectTask(taskId: string, actor: Actor, note?: string): Promise<void> {
  if (!canManageProjects(actor)) throw new Error('Unauthorized: only Admin/Co-Admin can reopen tasks')

  const ref = doc(db, PROJECT_TASKS_COLLECTION, taskId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Task not found')
  const task = snap.data() as ProjectTask

  await updateDoc(ref, {
    status: 'IN_PROGRESS',
    confirmedBy: null,
    confirmedByName: null,
    confirmedAt: null,
    reviewComment: note?.trim() || null,
    updatedAt: serverTimestamp(),
  })

  await recordEvent(taskId, task.projectId, 'reopened', actor, {
    fromStatus: task.status,
    toStatus: 'IN_PROGRESS',
    note: note?.trim() || null,
  })
}

/** Mark blocked / unblock. Owner or manager. */
export async function setTaskBlocked(
  taskId: string,
  blocked: boolean,
  reason: string | null,
  actor: Actor
): Promise<void> {
  const ref = doc(db, PROJECT_TASKS_COLLECTION, taskId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Task not found')
  const task = snap.data() as ProjectTask

  const manager = isAdminOrSubAdmin(actor.role)
  if (!manager && !isTaskOwner(task, actor)) throw new Error('This task is not assigned to you')

  if (blocked) {
    const why = (reason || '').trim()
    if (!why) throw new Error('Please describe what is blocking this task')
    await updateDoc(ref, { status: 'BLOCKED', blockedReason: why, updatedAt: serverTimestamp() })
    await recordEvent(taskId, task.projectId, 'blocked', actor, {
      fromStatus: task.status,
      toStatus: 'BLOCKED',
      note: why,
    })
  } else {
    await updateDoc(ref, { status: 'IN_PROGRESS', blockedReason: null, updatedAt: serverTimestamp() })
    await recordEvent(taskId, task.projectId, 'unblocked', actor, {
      fromStatus: task.status,
      toStatus: 'IN_PROGRESS',
    })
  }
}

/** Manager cancels / restores. Nothing is hard-deleted — the trail must survive. */
export async function setTaskCancelled(
  taskId: string,
  cancelled: boolean,
  actor: Actor,
  reason?: string
): Promise<void> {
  if (!canManageProjects(actor)) throw new Error('Unauthorized: only Admin/Co-Admin can cancel tasks')

  const ref = doc(db, PROJECT_TASKS_COLLECTION, taskId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Task not found')
  const task = snap.data() as ProjectTask

  const to: ProjectTaskStatus = cancelled ? 'CANCELLED' : 'NOT_STARTED'
  await updateDoc(ref, { status: to, updatedAt: serverTimestamp() })
  await recordEvent(taskId, task.projectId, cancelled ? 'cancelled' : 'restored', actor, {
    fromStatus: task.status,
    toStatus: to,
    note: reason?.trim() || null,
  })
}

/** Employee ticks a checklist item on their own task. */
export async function toggleChecklistItem(
  taskId: string,
  itemId: string,
  done: boolean,
  actor: Actor
): Promise<void> {
  const ref = doc(db, PROJECT_TASKS_COLLECTION, taskId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Task not found')
  const task = snap.data() as ProjectTask

  if (!isAdminOrSubAdmin(actor.role) && !isTaskOwner(task, actor)) {
    throw new Error('This task is not assigned to you')
  }

  const checklist = (task.checklist || []).map((it) => (it.id === itemId ? { ...it, done } : it))
  await updateDoc(ref, { checklist, updatedAt: serverTimestamp() })
}

// ============================================================================
// PROGRESS — always derived from task data, never user-entered
// ============================================================================

export interface ProjectProgress {
  total: number
  counted: number
  confirmed: number
  byStatus: Record<ProjectTaskStatus, number>
  percent: number
}

export function computeProgress(tasks: ProjectTask[]): ProjectProgress {
  const byStatus = PROJECT_TASK_STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: 0 }),
    {} as Record<ProjectTaskStatus, number>
  )
  for (const t of tasks) if (byStatus[t.status] !== undefined) byStatus[t.status] += 1

  const counted = tasks.filter((t) => !PROGRESS_EXCLUDED_STATUSES.includes(t.status)).length
  const confirmed = tasks.filter((t) => PROGRESS_DONE_STATUSES.includes(t.status)).length

  return {
    total: tasks.length,
    counted,
    confirmed,
    byStatus,
    percent: counted === 0 ? 0 : Math.round((confirmed / counted) * 100),
  }
}

export function sortTasks(tasks: ProjectTask[]): ProjectTask[] {
  return [...tasks].sort((a, b) => {
    const pa = PRIORITY_META[a.priority]?.rank ?? 9
    const pb = PRIORITY_META[b.priority]?.rank ?? 9
    if (pa !== pb) return pa - pb
    const ta = a.createdAt?.toMillis?.() ?? 0
    const tb = b.createdAt?.toMillis?.() ?? 0
    return tb - ta
  })
}
