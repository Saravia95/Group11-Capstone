import React, { useState } from 'react';
import { useNavigate } from 'react-router';

const ListenerLogin: React.FC = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // Add your code validation logic here
       // navigate('/listener');
    };


    const navigateToOwnerLogin = () => {
        navigate('/owner-login');
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'auto' }}>
            <form onSubmit={handleSubmit} style={{ textAlign: 'center' }}>
                <h1>Enter Code</h1>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter your code"
                    style={{ padding: '10px', fontSize: '16px' }}
                />
                <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', marginLeft: '10px' }}>
                    Submit
                </button>
            </form>
            <button type="submit" onClick={navigateToOwnerLogin} style={{ padding: '10px 20px', fontSize: '16px', marginLeft: '10px' }}>
                    I am an owner
            </button>
        </div>
    );
};

export default ListenerLogin;