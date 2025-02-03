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
      className="w-10 aspect-square p-1 mt-3 lg:mt-8 rounded-full text-center text-slate-950 text-2xl bg-slate-100 hover:bg-slate-300 cursor-pointer"
      onClick={handleBack}
    >
      &larr;
    </div>
  );
};

export default Back;
