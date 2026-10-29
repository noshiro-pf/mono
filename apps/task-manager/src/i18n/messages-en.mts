/** The English text of the page, in the shape of the Japanese (`ja`). */

import type { Messages } from './messages.mjs';

export const en: Messages = {
  dateInputLocale: 'en-US',

  app: {
    title: 'Task Manager',
    description:
      'A task manager that shows what can be started now, from the dependencies between tasks and milestones',
    loading: 'Loading…',
  },

  common: {
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    confirmDelete: 'Delete',
    keep: 'Keep',
    deleteConfirmation: 'Confirm deletion',
    none: 'None',
    unchanged: 'Unchanged',
    remove: 'Remove',
    listSeparator: ', ',
    conditionSeparator: ', ',
    quoted: (text) => `“${text}”`,
    withNote: (text, note) => `${text} (${note})`,
  },

  nodeKinds: {
    task: 'Task',
    milestone: 'Milestone',
    group: 'Group',
  },

  fields: {
    title: 'Title',
    description: 'Description',
    status: 'Status',
    priority: 'Priority',
    dueDate: 'Due',
    estimate: 'Estimate',
    estimateHours: 'Estimate (hours)',
    progress: 'Progress',
    labels: 'Labels',
    group: 'Group',
    dependencies: 'Dependencies',
  },

  progress: {
    'not-started': 'Not started',
    'in-progress': 'In progress',
    'in-review': 'In review',
    done: 'Done',
  },

  displayStatus: {
    ready: 'Ready',
    blocked: 'Blocked',
    'in-progress': 'In progress',
    'in-review': 'In review',
    done: 'Done',
  },

  priority: {
    1: 'Highest',
    2: 'High',
    3: 'Medium',
    4: 'Low',
    5: 'Lowest',
  },

  dependencyType: {
    'finish-to-start': 'after finish',
    'start-to-start': 'after start',
  },

  duration: {
    days: (n) => `${n}d`,
    hours: (n) => `${n}h`,
    minutes: (n) => `${n}m`,
    separator: ' ',
  },

  header: {
    addTask: '+ Task',
    addMilestone: '+ Milestone',
    addGroup: '+ Group',
    export: 'Export',
    exportTitle: 'Export the project to a file',
    import: 'Import',
    importTitle: 'Import a project from a file',
    unreadableFile: (fileName) => `Could not read “${fileName}”.`,
    signedInAs: (name) => `Signed in as ${name}`,
    signOut: 'Sign out',
    signingOut: 'Signing out…',
    signedInFallback: 'Signed in',
  },

  signIn: {
    lead: 'Shows what can be started now, from the dependencies between tasks and milestones.',
    signIn: 'Sign in with Google',
    signingIn: 'Signing in…',
    failed: (reason) => `Could not sign in (${reason}).`,
    popupBlocked:
      'The pop-up was blocked. Allow pop-ups for this page and try again.',
    unauthorizedDomain:
      'Signing in from this domain is not allowed. Add it to the authorized domains in Firebase.',
    network: 'Could not reach the network. Check the connection and try again.',
  },

  unsentWrites: {
    message:
      'Not signed out: changes made offline have not been sent yet. Signing out now loses them.',
    discard: 'Discard changes and sign out',
    stay: 'Stay signed in',
  },

  views: {
    label: 'View',
    list: 'List',
    dag: 'DAG',
  },

  list: {
    tasks: 'Tasks',
    milestones: 'Milestones',
    hideDone: 'Hide done',
    sort: 'Sort',
    sortKeys: 'Sort keys',
    noSortKeys: 'No sort keys.',
    noTasks: 'No tasks to show. Add one with “+ Task”.',
    noMilestones: 'No milestones. Add one with “+ Milestone”.',
    priority: (label) => `Priority ${label}`,
    estimate: (estimate) => `Estimate ${estimate}`,
    overdue: 'Overdue',
    warningTitle: 'In progress with dependencies not met',
    warning: '⚠ Dependencies not met',
    unreached: '◇ Not reached',
    reached: '◆ Reached',
    awaitingCheck: 'Needs check',
    checked: 'Checked',
  },

  sort: {
    keys: {
      title: 'Title',
      dueDate: 'Due',
      priority: 'Priority',
      status: 'Status',
      depth: 'Dependency depth',
      createdAt: 'Created',
      updatedAt: 'Updated',
      estimate: 'Estimate',
    },
    orders: {
      asc: 'ascending',
      desc: 'descending',
    },
    ascending: 'Ascending ↑',
    descending: 'Descending ↓',
    addKey: 'Add a key',
    addKeyOption: '+ Add a key…',
    toggleOrder: (key, order) => `Switch the order of ${key} (now ${order})`,
    moveUp: (key) => `Move ${key} up`,
    moveDown: (key) => `Move ${key} down`,
    remove: (key) => `Remove ${key}`,
  },

  dag: {
    empty: 'No tasks or milestones yet.',
    layoutFailed: (reason) => `Could not lay out the graph (${reason}).`,
    layingOut: 'Laying out…',
    viewMode: 'View mode',
    viewModes: {
      dag: 'DAG',
      arc: 'Arc',
      tile: 'Tiles',
    },
    direction: 'Direction',
    right: 'Right',
    down: 'Down',
    arrange: 'Arrange',
    lasso: 'Lasso',
    lassoTitle:
      'Dragging on the background selects the nodes it encircles (so does dragging with Shift held)',
    rectangle: 'Rectangle',
    rectangleTitle:
      'Dragging on the background selects the nodes inside the rectangle drawn',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    actualSize: 'Actual size',
    fitAll: 'Fit all',
    descriptions: {
      dag: 'Dependency graph. Selecting a node opens its details. Nodes move by dragging or with the arrow keys. Dragging from the circle on a node’s edge to another node makes the node dropped on depend on it. A selected dependency arrow is deleted with the delete button or the Delete key. Drag the background to pan; scroll or pinch to zoom. Dragging the background with Shift held, or with “Lasso” on, selects the nodes encircled, to move or edit them together.',
      arc: 'Arc diagram. Tasks are listed top to bottom by title, each milestone above the tasks waiting for it, and dependencies are arcs on the right. Selecting a node opens its details. Drag to pan; scroll or pinch to zoom.',
      tile: 'Tasks are laid out by title from the top left, wrapping onto the next row. Dependencies are not shown. Selecting a task opens its details. Scroll with the wheel, by dragging, or with Page Up, Page Down, Home and End.',
    },
    deleteEdge: (dependent, source) =>
      `Delete the dependency of “${dependent}” on “${source}”`,
    group: (title) => `Group “${title}”`,
    selection: 'Selected nodes',
    selected: (count) => `${count} selected`,
    confirmDeleteSelected: (count) =>
      `Delete ${count} with their dependencies?`,
    bulkEdit: 'Edit together',
    clearSelection: 'Clear selection',
    compactTitle: (title, due, priority) =>
      `${title}\n${due}, priority ${priority}`,
    noDue: 'No due date',
    due: (when) => `Due ${when}`,
    overdue: (when) => `Overdue ${when}`,
    milestoneDate: (when) => `On ${when}`,
    taskLabel: (title) => `Task “${title}”`,
    milestoneLabel: (title) => `Milestone “${title}”`,
    statusPart: (status) => `Status: ${status}`,
    duePart: (when) => `Due: ${when}`,
    overduePart: 'Overdue',
    priorityPart: (priority) => `Priority: ${priority}`,
    warningPart: 'Started with dependencies not met',
    reachedPart: 'Reached',
    unreachedPart: 'Not reached',
    datePart: (when) => `Date: ${when}`,
    awaitingCheckPart: 'Awaiting check',
    partSeparator: ', ',
    edgeLabel: (from, to, how) =>
      `${from} → ${to}${how === '' ? '' : ` (${how})`}`,
  },

  settings: {
    title: 'Display settings',
    filtering: 'Filtered',
    filteringSuffix: ' (filtered)',
    groups: 'Groups',
    filter: 'Filter',
    noGroup: 'No group',
    noLabel: 'No label',
    filterEmptyHint: 'Create a group or label a task to filter by it here.',
    filterHint:
      'Shows what matches any of those chosen, or, with both groups and labels chosen, what matches both. Filtering by label shows only the milestones connected to the tasks left. Nodes directly connected to those shown are shown faded.',
    clearFilter: 'Clear the filter',
    showDone: 'Show done tasks and reached milestones',
    showDoneHint:
      'While off, done tasks, reached milestones and the dependency lines from them are not drawn. This is apart from “Hide done” in the list.',
    nodeSize: 'Nodes',
    nodeSizes: {
      compact: 'Compact',
      standard: 'Standard',
      large: 'Large',
    },
    nodeSizeHint:
      '“Compact” shows the title alone, on one line; the status and priority are in the colours, and in the description shown on hover. “Large” wraps the title onto up to three lines.',
    animation: 'Animation',
    animations: {
      auto: 'Auto',
      on: 'On',
      off: 'Off',
    },
    animationHint:
      'Animates nodes moving into place. “Auto” follows the device’s “Reduce motion”. In any setting, a move that runs slowly is cut short and the nodes put in place.',
    diagramSort: 'Order',
    diagramSortKeys: 'Order keys',
    noDiagramSortKeys: 'No keys: ordered by title, ascending.',
    diagramSortHint:
      'The order of both “Arc” and “Tiles”. Keys are compared from the top, each next one only when the ones above are equal.',
    language: 'Language',
    languageAuto: 'Same as browser',
    languageHint: 'Kept on this device. Switching reloads the page.',
  },

  nodeDialog: {
    newTask: 'New task',
    newMilestone: 'New milestone',
    startConditions: 'Start conditions (ready once all are met)',
    startConditionsHint:
      'To wait for a date or something outside, make a milestone and depend on it.',
    reachConditions: 'Reached when all of these are met',
    milestoneDate: 'Date (reached at this time)',
    requiresCheck: 'Needs a manual check (reached on “Check”)',
    unchecked: 'Not checked',
    check: 'Check',
    checkedAt: (when) => `Checked (${when})`,
    uncheck: 'Uncheck',
    unreached: '◇ Not reached',
    reachedAt: (when) => `◆ Reached (${when})`,
    waitingFor: (conditions) => `Waiting for: ${conditions}`,
    waitingForDate: (when) => `the date (${when})`,
    waitingForCheck: 'a manual check',
    waitingForDependencies: (count) => `dependencies (${count} not met)`,
    confirmDelete: 'Delete it with its dependencies?',
  },

  milestoneExplanation: {
    heading: 'What is a milestone?',
    what: 'Not work itself but a marker of when tasks can start (it takes no time). Once all its conditions below are met it is “reached”, and the tasks depending on it become ready.',
    date: 'Date: reached at that time (for example, before tasks to start on or after 10/9).',
    check:
      'Manual check: reached on “Check” (for example, a blocker outside, such as waiting for a reply).',
    dependency:
      'Dependencies: waits for tasks to finish or start, or other milestones to be reached (for example, “Implemented”, gathering several tasks’ completion).',
    none: 'With no conditions it is reached as soon as it is created. If its conditions stop being met later (a task it depends on is reopened, say), it goes back to not reached.',
  },

  dateField: {
    allDay: 'All day',
    clear: 'Clear',
    today: 'Today',
    pickDate: 'Pick a date (e.g. 2026/10/09)',
    pickDateTime: 'Pick a date and time (e.g. 2026/10/09 18:00)',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    month: 'Month',
    year: 'Year',
    hours: 'Hours',
    minutes: 'Minutes',
    increaseHours: 'One hour later',
    decreaseHours: 'One hour earlier',
    increaseMinutes: 'One minute later',
    decreaseMinutes: 'One minute earlier',
  },

  dependencies: {
    row: (index) => `Dependency ${index}`,
    none: 'No dependencies.',
    add: 'Add a dependency',
    showDone: 'Offer done tasks too',
    source: 'Depends on',
    choose: 'Choose one',
    missingSource: '(dependency not found)',
    type: 'Type',
    afterReached: 'once reached',
    noType: '―',
    lagDays: 'Days later',
    lagHours: 'Hours',
    removeRow: (name) => `Remove ${name}`,
    met: 'Met',
    unmet: 'Not met',
    option: (kind, title, done) => `${kind}: ${title}${done ? ' (done)' : ''}`,
    describe: (source, waitsFor, lag) =>
      `${source}, ${lag === '' ? '' : `${lag} `}${waitsFor}`,
    deletedTask: '(deleted task)',
    deletedMilestone: '(deleted milestone)',
    sourceMissing: 'The dependency was not found. Remove it.',
    alreadyDependsOn: (title) => `Already depends on ${title}.`,
    self: 'Cannot depend on itself.',
    cycle: (source, dependent) =>
      `${source} depends on ${dependent}, so this would make a cycle.`,
    lagNotNumber: 'Enter the delay as a number.',
    lagNegative: 'The delay cannot be negative.',
  },

  labels: {
    remove: (label) => `Remove the label “${label}”`,
    suggestions: (caption) => `Suggestions for ${caption}`,
  },

  drafts: {
    titleRequired: 'Enter a title.',
    invalidDue: 'The due date is not valid.',
    invalidEstimate: 'Enter the estimate as a number, 0 or more.',
    invalidDate: 'The date is not valid.',
  },

  bulkEdit: {
    title: 'Edit together',
    tasks: (count) => `${count} ${count === 1 ? 'task' : 'tasks'}`,
    milestones: (count) =>
      `${count} ${count === 1 ? 'milestone' : 'milestones'}`,
    lead: ': fields left “Unchanged” stay as they are.',
    milestonesHaveNoProgress: ' Milestones have no progress or labels.',
    addLabels: 'Labels to add',
    removeLabels: 'Labels to remove',
  },

  groups: {
    newGroup: 'New group',
    name: 'Group name',
    hint: 'In the DAG, dragging a node into the frame puts it in the group, and out of the frame takes it out.',
    confirmDelete: 'Delete the group? (Its nodes stay.)',
    nameRequired: 'Enter a group name.',
  },

  projectFile: {
    title: 'Import a project',
    replace: 'Replace',
    confirm: (fileName, tasks, milestones, groups) =>
      `The project is replaced with the contents of “${fileName}” (tasks ${tasks}, milestones ${milestones}, groups ${groups}). Every task, milestone and group now in it, and the DAG layout, is removed. The project is exported to a file first.`,
    refused: (fileName) => `“${fileName}” cannot be imported.`,
    importing:
      'Writing. Closing this lets the writing go on, but closing the page, reloading it or signing out before it finishes may leave the tasks and the rest from before in place.',
    stillLoading: 'Still loading. Wait a moment and try again.',
    partlyLoaded:
      'Part of the project could not be loaded, so the whole project cannot be handled. Reload the page.',
    exportFailed: 'Could not export the file.',
    exportWhileImporting:
      'An import is still being written. Export once it has finished.',
    languageWhileImporting:
      'The language cannot be switched while an import is being written, as switching reloads the page.',
    importWhileImporting:
      'The last import is still being written. Try again once it has finished.',
    importFailed: (fileName, backup) =>
      `Importing “${fileName}” failed part-way, and the project may be partly replaced. Importing “${backup}”, exported just before, restores it.`,
    notJson: 'Not readable as JSON.',
    notProjectFile: 'Not a project file exported by this app.',
    unknownVersion: (version, supported) =>
      `Format version ${version} cannot be read (this reads ${supported}).`,
    malformed: 'The project file is not in the right shape.',
    record: (kind, index) => `${kind} ${index}`,
    missingId: (place) => `${place}: has no id.`,
    unusableId: (place, id) =>
      `${place}: the id “${id}” cannot be used (an id cannot be empty, contain “/”, be “.” or “..”, start and end with “__”, or be over 1300 bytes).`,
    recordTooLarge: (place) => `${place}: too large (1 MB at most).`,
    layout: (error) => `DAG layout: ${error}`,
    tooManyPositions: (max) =>
      `DAG layout: too many positions (${max} at most).`,
    unusablePosition: (key) =>
      `DAG layout: the position of “${key}” cannot be saved.`,
    layoutTooLarge: 'DAG layout: too large (1 MB at most).',
    duplicateId: (kind, id, count) =>
      `${kind} id “${id}” appears ${count} times.`,
  },

  data: {
    loadFailed:
      'Could not load the data. Check the permissions or the connection.',
    layoutLoadFailed: 'Could not load the DAG layout.',
    groupsLoadFailed: 'Could not load the groups.',
    notSignedIn: (action) => `Could not ${action} (not signed in).`,
    failed: (action) => `Could not ${action}.`,
    saveTask: 'save the task',
    saveMilestone: 'save the milestone',
    delete: 'delete',
    saveGroup: 'save the group',
    deleteGroup: 'delete the group',
    changeGroup: 'change the group',
    saveAll: 'save the changes',
    saveLayout: 'save the DAG layout',
    dependencyRefused: (reason) => `Could not add the dependency (${reason}).`,
    refusals: {
      missing: 'the task or milestone was not found',
      self: 'it cannot depend on itself',
      duplicate: 'it already depends on it',
      cycle: 'it would make a cycle',
    },
  },
} as const;
