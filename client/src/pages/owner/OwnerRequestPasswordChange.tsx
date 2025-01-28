import React, { useState } from 'react';
import { requestPasswordReset } from '../../utils/authUtils';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router';
const OwnerRequestPasswordChange: React.FC = () => {
    const navigate = useNavigate();
    const [emailInput, setEmail] = useState('');
    const { isAuthenticated, user } = useAuthStore();
    const [ isRequestSent, setIsRequestSent] = useState(false);   

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    const navigateToOwnerLogin = () => {
        
        navigate('/owner-login');
    }

    const handleRequestPasswordReset = () => {
    

        const email = isAuthenticated &&  user ? user.email : emailInput;

        requestPasswordReset(email).then((result) => {
            if (!result.success) {
                alert('Error resetting password');
            }else{
                setIsRequestSent(true);
            }
            console.log('Password reset email sent');
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
            
            <h2>Reset Password</h2>

            {isRequestSent &&
                <div>

                <h3>Password Reset Email Sent Successfully.</h3>
                <button onClick={navigateToOwnerLogin}>Log In</button>

                </div>
            }

            { !isRequestSent &&
            <div>

            
            { !isAuthenticated ? <input
                type="email"
                placeholder="Enter your email"
                value={emailInput}
                onChange={handleEmailChange}
                style={{ padding: '10px', marginBottom: '20px', width: '300px' }}/>
                : 
               <p>{user?.email}</p>
            }


            {
            !isAuthenticated ?
            <button onClick={handleRequestPasswordReset} style={{ padding: '10px 20px' }}>
                Enter email to reset password
            </button>
            : 
            <button onClick={handleRequestPasswordReset} style={{ padding: '10px 20px' }}>
                Click to send reset password email
            </button>
            }

            </div>
        }
        </div>
    );
};

export default OwnerRequestPasswordChange;