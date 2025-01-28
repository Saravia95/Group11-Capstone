import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/Button';

interface IPreferencesForm {
  emailNotifications: boolean;
  smsNotifications: boolean;
  darkMode: boolean;
  autoApprove: boolean;
}

const OwnerPreferences: React.FC = () => {
  const { register, getValues, handleSubmit } = useForm<IPreferencesForm>();
  // TODO: Create preferences database and fetch the user's preferences

  const handleSave = () => {
    const { emailNotifications, smsNotifications, darkMode, autoApprove } = getValues();
    console.log(emailNotifications, smsNotifications, darkMode, autoApprove);
  };

  return (
    <div className="container-sm">
      {/* <button onClick={navigateToOwnerSettings}>Back</button> */}
      <h2 className="title">Preferences</h2>
      <form className="list" onSubmit={handleSubmit(handleSave)}>
        <div className="list-item">
          <label className="inline-flex items-center cursor-pointer justify-between w-full">
            <input {...register('emailNotifications')} type="checkbox" className="sr-only peer" />
            <span className="me-3 font-medium text-gray-300">Email Notifications</span>
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <div className="list-item">
          <label className="inline-flex items-center cursor-pointer justify-between w-full">
            <input {...register('smsNotifications')} type="checkbox" className="sr-only peer" />
            <span className="me-3 font-medium text-gray-300">SMS Notifications</span>
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <div className="list-item">
          <label className="inline-flex items-center cursor-pointer justify-between w-full">
            <input {...register('darkMode')} type="checkbox" className="sr-only peer" />
            <span className="me-3 font-medium text-gray-300">Dark Mode</span>
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <div className="list-item">
          <label className="inline-flex items-center cursor-pointer justify-between w-full">
            <input {...register('autoApprove')} type="checkbox" className="sr-only peer" />
            <span className="me-3 font-medium text-gray-300">Set all requests to auto-approve</span>
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <Button actionText="Save" />
      </form>
    </div>
  );
};

export default OwnerPreferences;
