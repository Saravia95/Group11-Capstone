import React, { useState } from 'react';
import { useNavigate } from 'react-router';

const OwnerLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const navigateToListenerLogin = () => {
        navigate('/listener-login');
    };


    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // Handle login logic here
        console.log('Email:', email);
        console.log('Password:', password);

        navigate('/owner-main');
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            <button type="submit" onClick={navigateToListenerLogin} style={{ padding: '10px 20px', fontSize: '16px', marginLeft: '10px' }}>
                    I am a listener
                </button>
        </div>
    );
};

export default OwnerLogin;