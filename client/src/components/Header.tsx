import { faGear, faMagnifyingGlass, faMusic } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link } from 'react-router';
import { Role } from '../types/auth';
import { useAuthStore } from '../stores/authStore';

export const Header: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <>
      <header className="header">
        <div className="body-1 flex w-full max-w-screen items-center justify-between">
          <Link to="/main">
            <FontAwesomeIcon icon={faMusic} /> JukeVibes
          </Link>
          <div className="flex items-center">
            <Link to="/search">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </Link>
            {user?.role === Role.ADMIN && (
              <Link to="/settings" className="ml-5">
                <FontAwesomeIcon icon={faGear} />
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
