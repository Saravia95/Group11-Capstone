import React from 'react';

interface IFormErrorProps {
  errorMessage: string;
}

export const FormErrorMsg: React.FC<IFormErrorProps> = ({ errorMessage }) => (
  <span className="text-red-500 font-medium text-center">{errorMessage}</span>
);
