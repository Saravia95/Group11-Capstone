import React from 'react';
import { useNavigate } from 'react-router';

interface IBackProps {
  to: string;
}

const Back: React.FC<IBackProps> = ({ to }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(to);
  };

  return (
    <div
      className="laptop:mt-8 mt-3 aspect-square w-10 cursor-pointer rounded-full bg-[var(--primary)] p-1 text-center text-2xl text-[var(--on-primary)] hover:bg-[var(--primary)]/80"
      onClick={handleBack}
    >
      &larr;
    </div>
  );
};

export default Back;
