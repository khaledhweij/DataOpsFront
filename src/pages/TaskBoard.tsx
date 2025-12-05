// pages/TaskBoard.tsx
import { useState, useEffect } from 'react';
import './TaskBoard.css';

interface Task {
    id: string;
    title: string;
    description: string;
    url?: string;
    createdAt: string;
    priority?: 'low' | 'medium' | 'high';
}

interface Column {
    id: string;
    title: string;
    color: string;
    tasks: Task[];
}

const DEFAULT_COLUMNS: Column[] = [
    { id: 'not-created', title: 'Not Created', color: '#6B7280', tasks: [] },
    { id: 'pending', title: 'Created but Pending', color: '#F59E0B', tasks: [] },
    { id: 'in-process', title: 'In Process', color: '#3B82F6', tasks: [] },
    { id: 'done', title: 'Done', color: '#10B981', tasks: [] },
];

export default function TaskBoard() {
    const [columns, setColumns] = useState<Column[]>(() => {
        const saved = localStorage.getItem('taskboard-columns');
        return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
    });

    const [showNewColumnModal, setShowNewColumnModal] = useState(false);
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showEditColumnModal, setShowEditColumnModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    const [selectedColumnId, setSelectedColumnId] = useState<string>('');
    const [editingColumnId, setEditingColumnId] = useState<string>('');
    const [editingTaskId, setEditingTaskId] = useState<string>('');
    const [editingTaskColumnId, setEditingTaskColumnId] = useState<string>('');

    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [newColumnColor, setNewColumnColor] = useState('#3B9FBD');
    const [editColumnTitle, setEditColumnTitle] = useState('');
    const [editColumnColor, setEditColumnColor] = useState('');

    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskUrl, setNewTaskUrl] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

    const [editTaskTitle, setEditTaskTitle] = useState('');
    const [editTaskDescription, setEditTaskDescription] = useState('');
    const [editTaskUrl, setEditTaskUrl] = useState('');
    const [editTaskPriority, setEditTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    useEffect(() => {
        localStorage.setItem('taskboard-columns', JSON.stringify(columns));
        setLastSaved(new Date());
    }, [columns]);

    const normalizeUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        return "https://" + url;
    };

    const showConfirmDialog = (message: string, action: () => void) => {
        setConfirmMessage(message);
        setConfirmAction(() => action);
        setShowConfirmModal(true);
    };

    const handleConfirm = () => {
        if (confirmAction) {
            confirmAction();
        }
        setShowConfirmModal(false);
        setConfirmAction(null);
    };

    const handleCancelConfirm = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
    };

    const addColumn = () => {
        if (!newColumnTitle.trim()) return;

        const newColumn: Column = {
            id: `col-${Date.now()}`,
            title: newColumnTitle,
            color: newColumnColor,
            tasks: [],
        };

        setColumns([...columns, newColumn]);
        setNewColumnTitle('');
        setNewColumnColor('#3B9FBD');
        setShowNewColumnModal(false);
    };

    const startEditColumn = (column: Column) => {
        setEditingColumnId(column.id);
        setEditColumnTitle(column.title);
        setEditColumnColor(column.color);
        setShowEditColumnModal(true);
    };

    const saveColumnEdit = () => {
        if (!editColumnTitle.trim()) return;

        setColumns(columns.map(col =>
            col.id === editingColumnId
                ? { ...col, title: editColumnTitle, color: editColumnColor }
                : col
        ));

        setShowEditColumnModal(false);
        setEditingColumnId('');
    };

    const cancelColumnEdit = () => {
        setShowEditColumnModal(false);
        setEditingColumnId('');
    };

    const deleteColumn = (columnId: string) => {
        const column = columns.find(c => c.id === columnId);
        const taskCount = column?.tasks.length || 0;
        const message = taskCount > 0
            ? `Delete "${column?.title}" and ${taskCount} task(s)?`
            : `Delete "${column?.title}"?`;

        showConfirmDialog(
            message,
            () => setColumns(columns.filter(col => col.id !== columnId))
        );
    };

    const addTask = () => {
        if (!newTaskTitle.trim() || !selectedColumnId) return;

        const newTask: Task = {
            id: `task-${Date.now()}`,
            title: newTaskTitle,
            description: newTaskDescription,
            url: newTaskUrl,
            createdAt: new Date().toISOString(),
            priority: newTaskPriority,
        };

        setColumns(columns.map(col =>
            col.id === selectedColumnId
                ? { ...col, tasks: [...col.tasks, newTask] }
                : col
        ));

        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskUrl('');
        setNewTaskPriority('medium');
        setShowNewTaskModal(false);
    };

    const startEditTask = (columnId: string, task: Task) => {
        setEditingTaskId(task.id);
        setEditingTaskColumnId(columnId);
        setEditTaskTitle(task.title);
        setEditTaskDescription(task.description);
        setEditTaskUrl(task.url || '');
        setEditTaskPriority(task.priority || 'medium');
        setShowEditTaskModal(true);
    };

    const saveTaskEdit = () => {
        if (!editTaskTitle.trim()) return;

        setColumns(columns.map(col =>
            col.id === editingTaskColumnId
                ? {
                    ...col,
                    tasks: col.tasks.map(task =>
                        task.id === editingTaskId
                            ? {
                                ...task,
                                title: editTaskTitle,
                                description: editTaskDescription,
                                url: editTaskUrl,
                                priority: editTaskPriority,
                            }
                            : task
                    ),
                }
                : col
        ));

        setShowEditTaskModal(false);
        setEditingTaskId('');
    };

    const cancelTaskEdit = () => {
        setShowEditTaskModal(false);
        setEditingTaskId('');
    };

    const deleteTask = (columnId: string, taskId: string) => {
        setColumns(columns.map(col =>
            col.id === columnId
                ? { ...col, tasks: col.tasks.filter(task => task.id !== taskId) }
                : col
        ));
    };

    const moveTask = (taskId: string, fromColumnId: string, toColumnId: string) => {
        const fromColumn = columns.find(col => col.id === fromColumnId);
        const task = fromColumn?.tasks.find(t => t.id === taskId);

        if (!task) return;

        setColumns(columns.map(col => {
            if (col.id === fromColumnId) {
                return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
            }
            if (col.id === toColumnId) {
                return { ...col, tasks: [...col.tasks, task] };
            }
            return col;
        }));
    };

    const resetBoard = () => {
        showConfirmDialog(
            'Reset board to default columns? This will delete all custom columns and tasks.',
            () => setColumns(DEFAULT_COLUMNS)
        );
    };

    const exportData = () => {
        const dataStr = JSON.stringify(columns, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `taskboard-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target?.result as string);
                if (Array.isArray(imported) && imported.every(col => col.id && col.title && col.tasks)) {
                    setColumns(imported);
                } else {
                    alert('✗ Invalid file format');
                }
            } catch (error) {
                alert('✗ Failed to import data');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div className="task-board">
            {/* Header */}
            <div className="board-header">
                <div>
                    <h1 className="board-title">Task Management</h1>
                    <p className="board-subtitle">
                        Organize your tasks and track progress
                        {lastSaved && (
                            <span className="last-saved"> • Saved {lastSaved.toLocaleTimeString()}</span>
                        )}
                    </p>
                </div>
                <div className="board-actions">
                    <button
                        className="btn btn-outline"
                        onClick={exportData}
                        title="Export board data"
                    >
                        <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                    </button>
                    <label className="btn btn-outline" title="Import board data">
                        <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Import
                        <input
                            type="file"
                            accept=".json"
                            style={{ display: 'none' }}
                            onChange={importData}
                        />
                    </label>
                    <button
                        className="btn btn-outline"
                        onClick={() => setShowNewColumnModal(true)}
                    >
                        <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Column
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={resetBoard}
                    >
                        Reset Board
                    </button>
                </div>
            </div>

            {/* Board Columns */}
            <div className="board-columns">
                {columns.map(column => (
                    <div key={column.id} className="board-column">
                        <div className="column-header" style={{ borderTopColor: column.color }}>
                            <div className="column-info">
                                <h3 className="column-title">{column.title}</h3>
                                <span className="task-count">{column.tasks.length}</span>
                            </div>
                            <div className="column-actions">
                                <button
                                    className="icon-btn"
                                    onClick={() => {
                                        setSelectedColumnId(column.id);
                                        setShowNewTaskModal(true);
                                    }}
                                    title="Add task"
                                >
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                                <button
                                    className="icon-btn"
                                    onClick={() => startEditColumn(column)}
                                    title="Edit column"
                                >
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                {!DEFAULT_COLUMNS.find(c => c.id === column.id) && (
                                    <button
                                        className="icon-btn"
                                        onClick={() => deleteColumn(column.id)}
                                        title="Delete column"
                                    >
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="column-tasks">
                            {column.tasks.length === 0 ? (
                                <div className="empty-column">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p>No tasks yet</p>
                                </div>
                            ) : (
                                column.tasks.map(task => (
                                    <div
                                        key={task.id}
                                        className={`task-card priority-${task.priority}`}
                                        onClick={() => startEditTask(column.id, task)}
                                    >
                                        <div className="task-header">
                                            <h4 className="task-title">{task.title}</h4>
                                            <button
                                                className="task-delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteTask(column.id, task.id);
                                                }}
                                            >
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        {task.description && (
                                            <p className="task-description">{task.description}</p>
                                        )}
                                        {task.url && (
                                            <a
                                                href={normalizeUrl(task.url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="task-url"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                {task.url.length > 30 ? task.url.substring(0, 30) + '...' : task.url}
                                            </a>
                                        )}
                                        <div className="task-footer">
                                            <span className={`priority-badge priority-${task.priority}`}>
                                                {task.priority}
                                            </span>
                                            <select
                                                className="move-select"
                                                value={column.id}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    moveTask(task.id, column.id, e.target.value);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <option value={column.id}>Move to...</option>
                                                {columns.filter(c => c.id !== column.id).map(c => (
                                                    <option key={c.id} value={c.id}>{c.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modals remain the same as before, adding new ones below */}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal-overlay" onClick={handleCancelConfirm}>
                    <div className="modal-box confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="modal-title">Confirm Action</h2>
                        <p className="confirm-message">{confirmMessage}</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={handleCancelConfirm}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleConfirm}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Column Modal */}
            {showNewColumnModal && (
                <div className="modal-overlay" onClick={() => setShowNewColumnModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Add New Column</h2>
                        <div className="form-group">
                            <label className="form-label">Column Title</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., Review, Testing"
                                value={newColumnTitle}
                                onChange={(e) => setNewColumnTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addColumn()}
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Column Color</label>
                            <div className="color-picker">
                                {['#3B9FBD', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280', '#3B82F6'].map(color => (
                                    <button
                                        key={color}
                                        className={`color-option ${newColumnColor === color ? 'active' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setNewColumnColor(color)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowNewColumnModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={addColumn}>
                                Add Column
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Column Modal */}
            {showEditColumnModal && (
                <div className="modal-overlay" onClick={cancelColumnEdit}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Edit Column</h2>
                        <div className="form-group">
                            <label className="form-label">Column Title</label>
                            <input
                                type="text"
                                className="input"
                                value={editColumnTitle}
                                onChange={(e) => setEditColumnTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && saveColumnEdit()}
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Column Color</label>
                            <div className="color-picker">
                                {['#3B9FBD', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280', '#3B82F6'].map(color => (
                                    <button
                                        key={color}
                                        className={`color-option ${editColumnColor === color ? 'active' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setEditColumnColor(color)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={cancelColumnEdit}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={saveColumnEdit}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Task Modal */}
            {showNewTaskModal && (
                <div className="modal-overlay" onClick={() => setShowNewTaskModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Add New Task</h2>
                        <div className="form-group">
                            <label className="form-label">Task Title</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Enter task title"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description (Optional)</label>
                            <textarea
                                className="textarea"
                                placeholder="Enter task description"
                                value={newTaskDescription}
                                onChange={(e) => setNewTaskDescription(e.target.value)}
                                style={{ minHeight: '100px' }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">URL (Optional)</label>
                            <input
                                type="url"
                                className="input"
                                placeholder="https://example.com"
                                value={newTaskUrl}
                                onChange={(e) => setNewTaskUrl(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select
                                className="input"
                                value={newTaskPriority}
                                onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowNewTaskModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={addTask}>
                                Add Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Task Modal */}
            {showEditTaskModal && (
                <div className="modal-overlay" onClick={cancelTaskEdit}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">Edit Task</h2>
                        <div className="form-group">
                            <label className="form-label">Task Title</label>
                            <input
                                type="text"
                                className="input"
                                value={editTaskTitle}
                                onChange={(e) => setEditTaskTitle(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description (Optional)</label>
                            <textarea
                                className="textarea"
                                placeholder="Enter task description"
                                value={editTaskDescription}
                                onChange={(e) => setEditTaskDescription(e.target.value)}
                                style={{ minHeight: '100px' }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">URL (Optional)</label>
                            <input
                                type="url"
                                className="input"
                                placeholder="https://example.com"
                                value={editTaskUrl}
                                onChange={(e) => setEditTaskUrl(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select
                                className="input"
                                value={editTaskPriority}
                                onChange={(e) => setEditTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={cancelTaskEdit}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={saveTaskEdit}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}