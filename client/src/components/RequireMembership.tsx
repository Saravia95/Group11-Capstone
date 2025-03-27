import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { fetchMembership } from '../utils/authUtils';
import { useAuthStore } from '../stores/authStore';
import { Role } from '../types/auth';

const RequireMembership: React.FC = () => {
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const checkMembershipStatus = async () => {
      try {
        if (isAuthenticated && user) {
          const membership = await fetchMembership(user.id, user.email);

          setIsMember(membership.message.membership_status);

          if (!membership.message.membership_status) {
            setShowPrompt(true);
          } else {
            setShowPrompt(false);
          }
        }
      } catch (error) {
        console.error('Error checking membership status:', error);
        setShowPrompt(true);
      }
    };

    checkMembershipStatus();
  }, []);

  if (isMember === null) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">Membership Required</h2>
            <p className="mb-6 text-gray-600">
              {user?.role === Role.ADMIN ? (
                <span>You need to purchase a membership to access this app.</span>
              ) : (
                <span>This app has not yet been set up. Please, check back later.</span>
              )}
            </p>
            <div className="flex justify-end gap-4">
              <button className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                <Link to="/subscription">Purchase Membership</Link>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RequireMembership;
