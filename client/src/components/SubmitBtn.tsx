import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

interface IButtonProps {
  disable: boolean;
  loading: boolean;
  actionText: string;
}

export const SubmitBtn: React.FC<IButtonProps> = ({ disable, loading, actionText }) => (
  <button className="button" disabled={disable || loading}>
    {loading ? (
      <span>
        <FontAwesomeIcon icon={faSpinner} spin />
        &nbsp; Loading...
      </span>
    ) : (
      actionText
    )}
  </button>
);
