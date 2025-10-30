'use client';
import React, { useState } from 'react';

import { LoginForm } from './components/login-form';
import { ForgotPassword } from './components/forgot-password';

const Login = () => {
  const [forgotPassword, setForgotPassword] = useState(false);

  const handleForgotPassword = () => {
    setForgotPassword(true);
  }

  const handleBack = () => {
    setForgotPassword(false);
  }

  return (
    <div>
      {forgotPassword ? <ForgotPassword onBack={handleBack} /> : <LoginForm onForgotPassword={handleForgotPassword} />}
    </div>
  )
}

export default Login;
