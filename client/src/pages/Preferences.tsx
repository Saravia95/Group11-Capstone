import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../components/Button';
import { Toggle } from '../components/Toggle';
import Back from '../components/Back';

interface IPreferencesForm {
  emailNotifications: boolean;
  smsNotifications: boolean;
  darkMode: boolean;
  autoApprove: boolean;
}

const Preferences: React.FC = () => {
  const { register, getValues, handleSubmit } = useForm<IPreferencesForm>();
  // TODO: Create preferences database and fetch the user's preferences

  const handleSave = () => {
    const { emailNotifications, smsNotifications, darkMode, autoApprove } = getValues();
    console.log(emailNotifications, smsNotifications, darkMode, autoApprove);
  };

  return (
    <div className="container-sm">
      <Back to="/settings" />
      <h2 className="title">Preferences</h2>
      <form className="list" onSubmit={handleSubmit(handleSave)}>
        <div className="list-item">
          <label className="inline-flex items-center cursor-pointer justify-between w-full">
            <input {...register('emailNotifications')} type="checkbox" className="sr-only peer" />
            <span className="me-3 font-medium text-gray-300">Email Notifications</span>
            <Toggle />
          </label>
        </div>
        <div className="list-item">
          <label className="inline-flex items-center cursor-pointer justify-between w-full">
            <input {...register('smsNotifications')} type="checkbox" className="sr-only peer" />
            <span className="me-3 font-medium text-gray-300">SMS Notifications</span>
            <Toggle />
          </label>
        </div>
        <div className="list-item">
          <label className="inline-flex items-center cursor-pointer justify-between w-full">
            <input {...register('darkMode')} type="checkbox" className="sr-only peer" />
            <span className="me-3 font-medium text-gray-300">Dark Mode</span>
            <Toggle />
          </label>
        </div>
        <div className="list-item">
          <label className="inline-flex items-center cursor-pointer justify-between w-full">
            <input {...register('autoApprove')} type="checkbox" className="sr-only peer" />
            <span className="me-3 font-medium text-gray-300">Set all requests to auto-approve</span>
            <Toggle />
          </label>
        </div>

        <Button actionText="Save" />
      </form>
    </div>
  );
};

export default Preferences;
