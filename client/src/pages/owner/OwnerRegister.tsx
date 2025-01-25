import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import axiosInstance from '../../axiosInstance';

const OwnerRegister: React.FC = () => {
  const navigate = useNavigate();

  const navigateToOwnerLogin = () => {
    navigate('/owner-login');
  };

  const [formData, setFormData] = useState({
    displayName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add form submission logic here

    try {
      if (formData.password !== formData.confirmPassword) {
        console.log('Password and Confirm Password do not match');
        return;
      }

      axiosInstance
        .post('/auth/register-user', {
          displayName: formData.displayName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        })
        .then((response) => {
          console.log(response);
          navigateToOwnerLogin();
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h2>Owner Registration</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="displayName">Display Name:</label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>

      <button onClick={navigateToOwnerLogin}>Login</button>
    </div>
  );
};

export default OwnerRegister;
