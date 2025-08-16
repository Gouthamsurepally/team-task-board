import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login = ({ onToggle }) => {
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    const result = await login(values);
    setSubmitting(false);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">Login to Task Board</h4>
            </div>
            <div className="card-body">
              <Formik
                initialValues={{
                  email: '',
                  password: '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <dl>
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
                    </dl>
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={loading || isSubmitting}
                    >
                      {loading || isSubmitting ? 'Logging in...' : 'Login'}
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
                  Don't have an account? Register
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;