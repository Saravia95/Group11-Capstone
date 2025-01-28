import { faGear, faMagnifyingGlass, faMusic } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link } from 'react-router';
import { useAuthStore } from '../stores/authStore';

export const Header: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <header className="header">
        <div className="w-full max-w-screen flex justify-between items-center">
          <Link to="/main" className="font-medium">
            <FontAwesomeIcon icon={faMusic} /> JukeVibes
          </Link>
          <div className="flex items-center">
            <Link to="/search">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </Link>
            {isAuthenticated && (
              <Link to="/owner-settings" className="ml-5">
                <FontAwesomeIcon icon={faGear} />
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
