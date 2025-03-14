import React from 'react';

interface IFormErrorProps {
  errorMessage: string;
}

export const FormErrorMsg: React.FC<IFormErrorProps> = ({ errorMessage }) => (
  <span className="text-warning-light dark:text-warning-dark body-2 text-center">
    {errorMessage}
  </span>
);
