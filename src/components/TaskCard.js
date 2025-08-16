import React from 'react';

const TaskCard = ({ task, onClick, onDragStart, users }) => {
  const getStatusBadge = (task) => {
    if (task.status === 'Done') {
      return { text: 'Completed', class: 'bg-success' };
    }

    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const timeDiff = dueDate - now;
    const hours24 = 24 * 60 * 60 * 1000;

    if (timeDiff < 0) {
      return { text: 'Overdue', class: 'bg-danger' };
    } else if (timeDiff <= hours24) {
      return { text: 'At Risk', class: 'bg-warning' };
    } else {
      return { text: 'On Track', class: 'bg-success' };
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-low';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const statusBadge = getStatusBadge(task);

  return (
    <div
      className={`task-card p-3 ${getPriorityClass(task.priority)}`}
      onClick={() => onClick(task)}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
    >
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h6 className="mb-0 text-truncate" style={{ maxWidth: '70%' }}>
          {task.title}
        </h6>
        <span className={`badge status-badge ${statusBadge.class}`}>
          {statusBadge.text}
        </span>
      </div>
      
      <div className="mb-2">
        <small className="text-muted">{task.description}</small>
      </div>
      
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <span className={`badge ${
            task.priority === 'High' ? 'bg-danger' :
            task.priority === 'Medium' ? 'bg-warning' : 'bg-secondary'
          }`}>
            {task.priority}
          </span>
        </div>
        <small className="text-muted">
          Due: {formatDate(task.dueDate)}
        </small>
      </div>
      
      <div className="mt-2">
        <small className="text-muted">
          Assigned: {task?.assigneeId?.name || 'Unassigned'}
        </small>
      </div>
    </div>
  );
};

export default TaskCard;