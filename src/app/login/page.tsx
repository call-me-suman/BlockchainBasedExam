'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password123') {
      router.push('/admin');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <h1>Admin Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
      </form>

      <style jsx>{`
        .login-container {
          max-width: 400px;
          margin: 100px auto;
          padding: 2rem;
          background: #f4f4f4;
          border-radius: 10px;
          text-align: center;
        }

        input {
          display: block;
          width: 100%;
          margin: 10px 0;
          padding: 0.8rem;
          border-radius: 5px;
          border: 1px solid #ccc;
        }

        button {
          padding: 0.8rem 1.5rem;
          background: #1a2980;
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .error {
          color: red;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
