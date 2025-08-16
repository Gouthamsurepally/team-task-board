import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { commentAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters'),
  description: Yup.string()
    .required('Description is required'),
  priority: Yup.string()
    .oneOf(['Low', 'Medium', 'High'], 'Invalid priority')
    .required('Priority is required'),
  status: Yup.string()
    .oneOf(['Backlog', 'In Progress', 'Review', 'Done'], 'Invalid status')
    .required('Status is required'),
  assigneeId: Yup.string()
    .required('Please select an assignee')
    .test('not-empty', 'Please select an assignee', value => value && value.trim() !== ''),
  dueDate: Yup.date()
    .required('Due date is required')
    .min(new Date().toISOString().split('T')[0], 'Due date cannot be in the past'),
});

const TaskModal = ({ task, users, onSave, onDelete, onClose }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Helper function to extract assigneeId properly
  const getAssigneeId = (assigneeData) => {
    if (!assigneeData) return '';
    
    // If it's a string, clean it and return
    if (typeof assigneeData === 'string') {
      return assigneeData.replace(/"/g, '').trim();
    }
    
    // If it's an object, extract the _id and clean it
    if (typeof assigneeData === 'object' && assigneeData._id) {
      return assigneeData._id.replace(/"/g, '').trim();
    }
    
    return '';
  };

  useEffect(() => {
    if (task) {
      fetchComments();
    }
  }, [task]);

  const fetchComments = async () => {
    if (!task?._id) return;
    
    try {
      const response = await commentAPI.getComments(task._id);
      const commentsData = response.data.comments || [];
      
      // Debug logging to see what data we're getting
      console.log('Comments data received:', commentsData);
      console.log('Users data:', users);
      
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await onSave(values);
      toast.success(task ? 'Task updated successfully' : 'Task created successfully');
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !task?._id) return;

    try {
      await commentAPI.createComment(task._id, { body: newComment });
      setNewComment('');
      fetchComments();
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentAPI.deleteComment(commentId);
      fetchComments();
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  // const getUserName = (userId) => {
  //   if (!userId) return 'Unknown User';
    
  //   // Clean userId if it has extra quotes
  //   const cleanUserId = typeof userId === 'string' ? userId.replace(/"/g, '').trim() : userId;
    
  //   const foundUser = users.find(u => u._id === cleanUserId);
  //   if (foundUser) {
  //     // Return name if available, otherwise email prefix
  //     if (foundUser.name) {
  //       return foundUser.name.replace(/"/g, '').trim();
  //     }
  //     if (foundUser.email) {
  //       return foundUser.email.replace(/"/g, '').split('@')[0];
  //     }
  //   }
    
  //   return 'Unknown User';
  // };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {task ? 'Edit Task' : 'Create New Task'}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <Formik
              initialValues={{
                title: task?.title || '',
                description: task?.description || '',
                priority: task?.priority || 'Medium',
                status: task?.status || 'Backlog',
                assigneeId: getAssigneeId(task?.assigneeId),
                dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting }) => (
                <Form>
                  <dl>
                    <dt><label htmlFor="title">Title</label></dt>
                    <dd>
                      <Field
                        type="text"
                        name="title"
                        id="title"
                        className="form-control"
                      />
                    </dd>
                    <dd><ErrorMessage name="title" component="span" className="text-danger" /></dd>

                    <dt><label htmlFor="description">Description</label></dt>
                    <dd>
                      <Field
                        as="textarea"
                        name="description"
                        id="description"
                        className="form-control"
                        rows="3"
                      />
                    </dd>
                    <dd><ErrorMessage name="description" component="span" className="text-danger" /></dd>

                    <dt><label htmlFor="status">Status</label></dt>
                    <dd>
                      <Field
                        as="select"
                        name="status"
                        id="status"
                        className="form-select"
                      >
                        <option value="Backlog">Backlog</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Done">Done</option>
                      </Field>
                    </dd>
                    <dd><ErrorMessage name="status" component="span" className="text-danger" /></dd>

                    <dt><label htmlFor="priority">Priority</label></dt>
                    <dd>
                      <Field
                        as="select"
                        name="priority"
                        id="priority"
                        className="form-select"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </Field>
                    </dd>
                    <dd><ErrorMessage name="priority" component="span" className="text-danger" /></dd>

                    <dt><label htmlFor="assigneeId">Assignee</label></dt>
                    <dd>
                      <Field name="assigneeId">
                        {({ field, form, meta }) => (
                          <select
                            {...field}
                            id="assigneeId"
                            className={`form-select ${meta.touched && meta.error ? 'is-invalid' : ''}`}
                            value={field.value || ''}
                            onChange={(e) => {
                              const selectedValue = e.target.value;
                              form.setFieldValue('assigneeId', selectedValue);
                              form.setFieldTouched('assigneeId', true);
                            }}
                          >
                            <option value="">Select Assignee</option>
                            {users.map(user => (
                              <option key={user._id} value={user._id}>
                                {user.email.split('@')[0]}
                              </option>
                            ))}
                          </select>
                        )}
                      </Field>
                    </dd>
                    <dd><ErrorMessage name="assigneeId" component="span" className="text-danger" /></dd>

                    <dt><label htmlFor="dueDate">Due Date</label></dt>
                    <dd>
                      <Field
                        type="date"
                        name="dueDate"
                        id="dueDate"
                        className="form-control"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </dd>
                    <dd><ErrorMessage name="dueDate" component="span" className="text-danger" /></dd>
                  </dl>
                  
                  <div className="modal-footer">
                    <div className="d-flex justify-content-between w-100">
                      <div>
                        {task && (
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => onDelete(task._id)}
                          >
                            Delete Task
                          </button>
                        )}
                      </div>
                      <div>
                        <button
                          type="button"
                          className="btn btn-secondary me-2"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>

            {task && (
              <div className="mt-4">
                <h6>Comments</h6>
                <div className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {comments.length === 0 ? (
                    <p className="text-muted">No comments yet.</p>
                  ) : (
                    comments.map(comment => {
                      // Debug each comment
                      console.log('Rendering comment:', comment);
                      console.log('Author ID:', comment.authorId);
                      console.log('Created date:', comment.created || comment.createdAt);
                      
                      return (
                        <div key={comment._id || Math.random()} className="border-bottom pb-2 mb-2">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <strong className="text-primary">{comment?.authorId?.name || 'Unknown User'}</strong>
                              <small className="text-muted ms-2">
                                {formatDate(comment.created || comment.createdAt)}
                              </small>
                            </div>
                            {(comment.authorId === user._id || comment.authorId === user?._id) && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteComment(comment._id)}
                                title="Delete comment"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </div>
                          <p className="mb-0 mt-1 text-dark">{comment.body || 'No content'}</p>
                        </div>
                      );
                    })
                  )}
                </div>
                <form onSubmit={handleAddComment}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button type="submit" className="btn btn-outline-primary">
                      Add
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;