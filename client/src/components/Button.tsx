import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

interface IButtonProps {
  disable?: boolean;
  loading?: boolean;
  actionText: string;
}

export const Button: React.FC<IButtonProps> = ({
  disable = false,
  loading = false,
  actionText,
}) => (
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
