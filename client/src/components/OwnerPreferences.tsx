import React, { useState } from 'react';
import { useNavigate } from 'react-router';

const OwnerPreferences: React.FC = () => {
    const navigate = useNavigate();
    const navigateToOwnerSettings = () => {
      
        navigate('/owner-settings');
    };
    const [preferences, setPreferences] = useState({
        emailNotifications: false,
        smsNotifications: false,
        darkMode: false,
    });

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setPreferences({
            ...preferences,
            [name]: checked,
        });
    };

    return (
        <div>
            <button onClick={navigateToOwnerSettings}>Back</button>

            <h1>Owner Preferences</h1>
            <form>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            name="emailNotifications"
                            checked={preferences.emailNotifications}
                            onChange={handleChange}
                        />
                        Email Notifications
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            name="smsNotifications"
                            checked={preferences.smsNotifications}
                            onChange={handleChange}
                        />
                        SMS Notifications
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            name="darkMode"
                            checked={preferences.darkMode}
                            onChange={handleChange}
                        />
                        Dark Mode
                    </label>
                </div>
            </form>
        </div>
    );
};

export default OwnerPreferences;