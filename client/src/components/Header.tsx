import { faGear, faMagnifyingGlass, faMusic } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link } from 'react-router';

export const Header: React.FC = () => {
  return (
    <>
      <header className="header">
        <div className="w-full max-w-screen flex justify-between items-center">
          <div className="font-medium">
            <FontAwesomeIcon icon={faMusic} /> JukeVibes
          </div>
          <div className="flex items-center">
            <span>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
            {/* Owner */}
            <Link to="/owner-settings" className="ml-5">
              <FontAwesomeIcon icon={faGear} />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};
