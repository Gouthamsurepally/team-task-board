import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // const handleSubmit = async (values, { setSubmitting }) => {
  //   try {
  //     setLoginError(''); // Clear previous errors
  //     const result = await login(values);
  //     if (!result.success) {
  //       setLoginError(result.error);
  //     }
  //   } catch (error) {
  //     setLoginError('An unexpected error occurred. Please try again.');
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoginError('');
      const result = await login(values);
      if (result && !result.success) {
        setLoginError(result.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100">
      <div className="row w-100 justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">Login to Task Board</h4>
            </div>
            <div className="card-body">
              {loginError && (
                <div className="alert alert-danger" role="alert">
                  {loginError}
                </div>
              )}
              <Formik
                initialValues={{
                  email: '',
                  password: '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={false}
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
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Logging in...
                        </>
                      ) : (
                        'Login'
                      )}
                    </button>
                  </Form>
                )}
              </Formik>
              <div className="text-center mt-3">
                <Link to="/register" className="btn btn-link">
                  Don't have an account? Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;