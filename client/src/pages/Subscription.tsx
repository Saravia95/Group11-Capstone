import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { createCheckoutSession, fetchMembership, manageMembership } from '../utils/authUtils';
import { stripePromise } from '../config/stripe';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import Back from '../components/Back';
import { Helmet } from 'react-helmet-async';

interface Subscription {
  start_date: string | null;
  renewal_date: string | null;
  membership_status: boolean;
  billing_rate: number;
  stripe_subscription_status: string | null;
}
const Subscription: React.FC = () => {
  const hasFetchedUser = useRef(false);
  const { isAuthenticated, user } = useAuthStore();
  //const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription>({
    start_date: null,
    renewal_date: null,
    membership_status: false,
    billing_rate: 0,
    stripe_subscription_status: null,
  });
  const [clientSecret, setClientSecret] = useState(null);

  const onClickCreatePortalSession = () => {
    if (isAuthenticated && user && hasFetchedUser.current === true) {
      manageMembership(user.id, user.email)
        .then((response) => {
          if (response) {
            window.open(response.message, '_blank');
          }
        })
        .catch((error) => {
          console.error('Error fetching membership', error);
        });
    }
  };
  useEffect(() => {
    return () => {
      if (clientSecret !== null) {
        setClientSecret(null);
        hasFetchedUser.current = false;

        console.log('Unmounting Checkout');
      }
    };
  }, [location.pathname]); // Runs when the route changes

  useEffect(() => {
    if (isAuthenticated && user && clientSecret === null && hasFetchedUser.current === false) {
      hasFetchedUser.current = true;
      fetchMembership(user.id, user.email)
        .then((response) => {
          if (response.success) {
            const data: Subscription = response.message;
            console.log('Membership fetched: ', response.message);
            setSubscription({
              start_date: data.start_date,
              renewal_date: data.renewal_date,
              membership_status: data.membership_status,
              billing_rate: data.billing_rate,
              stripe_subscription_status: data.stripe_subscription_status,
            });
            if (
              data.membership_status === false &&
              data.stripe_subscription_status === 'inactive'
            ) {
              createCheckoutSession(user.id, user.email)
                .then((checkOutResponse) => {
                  if (checkOutResponse.success) {
                    setClientSecret(checkOutResponse.message);
                  }
                })
                .catch((error) => {
                  console.error('Error fetching membership', error);
                });
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching membership', error);
        });
    }
  }, []);

  return (
    <div className="container-sm rounded-lg bg-gray-900 p-6 text-white shadow-lg">
      <Helmet title="Subscription | JukeVibes" />
      <Back to="/settings" />
      {hasFetchedUser.current === true && (
        <h2
          className={`mb-4 text-center text-2xl font-bold ${subscription.membership_status ? 'text-green-400' : 'text-red-400'}`}
        >
          Your Membership is {subscription.membership_status ? 'Active' : 'Inactive'}
        </h2>
      )}
      {subscription.membership_status === false &&
        subscription.stripe_subscription_status !== 'active' &&
        clientSecret !== null && (
          <EmbeddedCheckoutProvider
            key={clientSecret}
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <EmbeddedCheckout key={clientSecret} />
          </EmbeddedCheckoutProvider>
        )}

      {subscription.stripe_subscription_status === 'active' && (
        <div className="w-full rounded-lg bg-gray-800 p-4 text-center">
          <h3 className="mb-2 text-lg font-bold">Subscription Details</h3>
          <p className="text-gray-400">
            Billing Rate: <span className="font-bold text-white">{subscription.billing_rate}</span>
          </p>
          <p className="text-gray-400">
            Start Period:{' '}
            <span className="text-white">
              {subscription.start_date !== null ? subscription.start_date : '--/--/--'}
            </span>
          </p>
          <p className="text-gray-400">
            End of Current Period:{' '}
            <span className="text-white">
              {subscription.renewal_date !== null ? subscription.renewal_date : '--/--/--'}
            </span>
          </p>
        </div>
      )}

      {subscription.stripe_subscription_status === 'active' && (
        <div className="mx-0 my-3 flex justify-center">
          <button
            className="w-full rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white shadow-md transition duration-200 hover:bg-blue-800"
            onClick={onClickCreatePortalSession}
          >
            Manage Subscription
          </button>
        </div>
      )}
      {/* THIS CANCEL BUTTON NEEDS TO REFLECT THE CANCELLED SUBSCRIPTION BUT ACTIVE UNTIL */}
      {/* {subscription.stripe_subscription_status === 'active' && (
        <div className="flex justify-center my-3 mx-0">
          <button
            className=" w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
            onClick={onClickCancelMembership}
          >
            Cancel Membership
          </button>
        </div>
      )} */}
    </div>
  );
};

export default Subscription;
