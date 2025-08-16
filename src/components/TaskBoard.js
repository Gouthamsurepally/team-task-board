import React, { useState, useEffect } from 'react';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import { taskAPI, authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    assignee: 'all',
    priority: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const { user, logout } = useAuth();

  const columns = [
    { id: 'Backlog', title: 'Backlog', color: '#6c757d' },
    { id: 'In Progress', title: 'In Progress', color: '#0d6efd' },
    { id: 'Review', title: 'Review', color: '#fd7e14' },
    { id: 'Done', title: 'Done', color: '#198754' }
  ];

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async (filterParams = filters) => {
    try {
      setLoading(true);
      console.log('Fetching tasks with filters:', filterParams);
      const response = await taskAPI.getTasks(filterParams);
      setTasks(response.data.tasks || []);
      console.log('Tasks received from API:', response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await authAPI.getUsers();
      const usersData = response.data.users || [];
      console.log('Users fetched:', usersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowModal(true);
  };

  const handleTaskSave = async (taskData) => {
    try {
      if (selectedTask) {
        await taskAPI.updateTask(selectedTask._id, taskData);
      } else {
        await taskAPI.createTask(taskData);
      }
      fetchTasks(); // This will use current filters
      setShowModal(false);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      fetchTasks(); // This will use current filters
      setShowModal(false);
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnStatus);
  };

  const handleDragLeave = (e) => {
    // Only clear drag over if we're leaving the column container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e, columnStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedTask && draggedTask.status !== columnStatus) {
      try {
        await taskAPI.moveTask(draggedTask._id, columnStatus);
        fetchTasks(); // This will use current filters
        toast.success(`Task moved to ${columnStatus}`);
      } catch (error) {
        console.error('Error moving task:', error);
        toast.error('Failed to move task');
      }
    }
    setDraggedTask(null);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchTasks(newFilters);
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col">
          <div className="app-header">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-0 text-white">
                  <i className="bi bi-kanban-fill me-2"></i>
                  Task Board
                </h2>
                <small className="text-white-50">Manage your team's workflow</small>
              </div>
              <div className="d-flex gap-3 align-items-center">
                <button
                  className="btn btn-light"
                  onClick={handleCreateTask}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Create Task
                </button>
                <div className="dropdown">
                  <button
                    className="btn btn-outline-light dropdown-toggle d-flex align-items-center"
                    type="button"
                    data-bs-toggle="dropdown"
                    style={{ border: 'none', background: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <div className="d-flex align-items-center">
                      <div 
                        className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2"
                        style={{ width: '32px', height: '32px' }}
                      >
                        <i className="bi bi-person-fill text-primary"></i>
                      </div>
                      <span className="text-white">{user?.email?.split('@')[0] || 'User'}</span>
                    </div>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <div className="dropdown-item-text">
                        <small className="text-muted">{user?.email}</small>
                      </div>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={logout}>
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-8">
          <div className="d-flex gap-3 align-items-center">
            <div className="input-group">
              <span className="input-group-text bg-white border-0">
                <i className="bi bi-people-fill text-muted"></i>
              </span>
              <select
                className="form-select border-0"
                value={filters.assignee}
                onChange={(e) => handleFilterChange({ ...filters, assignee: e.target.value })}
                style={{ background: 'rgba(255, 255, 255, 0.9)' }}
              >
                <option value="all">All Assignees</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.email.split('@')[0]}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-white border-0">
                <i className="bi bi-flag-fill text-muted"></i>
              </span>
              <select
                className="form-select border-0"
                value={filters.priority}
                onChange={(e) => handleFilterChange({ ...filters, priority: e.target.value })}
                style={{ background: 'rgba(255, 255, 255, 0.9)' }}
              >
                <option value="all">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            {/* Filter status indicator */}
            {(filters.assignee !== 'all' || filters.priority !== 'all') && (
              <div className="d-flex align-items-center">
                <small className="text-white-50 me-2">
                  <i className="bi bi-funnel-fill me-1"></i>
                  Filters active
                </small>
                <button
                  className="btn btn-sm btn-outline-light"
                  onClick={() => handleFilterChange({ assignee: 'all', priority: 'all' })}
                  style={{ fontSize: '0.75rem' }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        {columns.map(column => (
          <div key={column.id} className="col-md-3">
            <div
              className={`board-column ${dragOverColumn === column.id ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="column-header" style={{ color: column.color }}>
                {column.title} ({getTasksByStatus(column.id).length})
              </div>
              <div className="tasks-container">
                {getTasksByStatus(column.id).map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onClick={handleTaskClick}
                    onDragStart={handleDragStart}
                    users={users}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <TaskModal
          task={selectedTask}
          users={users}
          onSave={handleTaskSave}
          onDelete={handleTaskDelete}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default TaskBoard;