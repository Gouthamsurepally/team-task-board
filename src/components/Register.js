import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required'),    
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

const Register = ({ onToggle }) => {
  const { register, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    const result = await register({
      name: values.name,
      email: values.email,
      password: values.password,
    });
    setSubmitting(false);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">Register for Task Board</h4>
            </div>
            <div className="card-body">
              <Formik
                initialValues={{
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <dl>
                      <dt><label htmlFor="name">Name</label></dt>
                      <dd>
                        <Field
                          type="text"
                          name="name"
                          id="name"
                          className="form-control"
                        />
                      </dd>
                      <dd><ErrorMessage name="name" component="span" className="text-danger" /></dd>

                      <dt><label htmlFor="email">Email</label></dt>
                      <dd>
                        <Field
                          type="email"
                          name="email"
                          id="email"
                          className="form-control"
                        />
                      </dd>
                      <dd><ErrorMessage name="email" component="span" className="text-danger" /></dd>

                      <dt><label htmlFor="password">Password</label></dt>
                      <dd>
                        <div className="position-relative">
                          <Field
                            type={showPassword ? "text" : "password"}
                            name="password"
                            id="password"
                            className="form-control pe-5"
                          />
                          <button
                            type="button"
                            className="btn position-absolute top-50 end-0 translate-middle-y pe-3 border-0 bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ zIndex: 10 }}
                          >
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                          </button>
                        </div>
                      </dd>
                      <dd><ErrorMessage name="password" component="span" className="text-danger" /></dd>

                      <dt><label htmlFor="confirmPassword">Confirm Password</label></dt>
                      <dd>
                        <div className="position-relative">
                          <Field
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            id="confirmPassword"
                            className="form-control pe-5"
                          />
                          <button
                            type="button"
                            className="btn position-absolute top-50 end-0 translate-middle-y pe-3 border-0 bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{ zIndex: 10 }}
                          >
                            <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                          </button>
                        </div>
                      </dd>
                      <dd><ErrorMessage name="confirmPassword" component="span" className="text-danger" /></dd>
                    </dl>
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={loading || isSubmitting}
                    >
                      {loading || isSubmitting ? 'Registering...' : 'Register'}
                    </button>
                  </Form>
                )}
              </Formik>
              <div className="text-center mt-3">
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={onToggle}
                >
                  Already have an account? Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;