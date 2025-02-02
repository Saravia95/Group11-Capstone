import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { createCheckoutSession, fetchMembership, processMembershipPurchase } from '../utils/authUtils';
import { stripePromise } from '../config/stripe';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";

interface Subscription {
  start_date: string|null;
  renewal_date: string|null;
  membership_status: boolean;
  billing_rate: number;
}
const Subscription: React.FC = () => {
  const hasFetchedUser = useRef(false);
  const {isAuthenticated, user} = useAuthStore();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription>(
    {
      start_date: null,
      renewal_date: null,
      membership_status: false,
      billing_rate: 0
    }
  );
  const [clientSecret, setClientSecret] = useState(null);
 
/*
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
 
      try{
        if(isAuthenticated && user)
          {
            const startDate = new Date();
            const renewalDate = new Date(startDate);
            renewalDate.setMonth(startDate.getMonth() + 1);

            processMembershipPurchase(startDate.toISOString(), renewalDate.toISOString(), user.id, true, 15.99)
              .then((response) => {
                if (response.success) {
                  const data:Subscription = response.message;
                  console.log('Membership fetched', data);
                  setSubscription({
                    start_date: data.start_date,
                    renewal_date: data.renewal_date,
                    membership_status: data.membership_status,
                    billing_rate: data.billing_rate,
                  });
                }
              })
              .catch((error) => {
                console.error('Error purchasing membership', error);
              });
            }
      }catch{

      }
    
  };

*/

useEffect(() => {
  return () => {
    if(clientSecret !== null)
    {
      setClientSecret(null); // Clear the clientSecret when leaving
      console.log("Unmounting Checkout");

    }
  };
}, [location.pathname]); // Runs when the route changes


  useEffect(() => {
    if(isAuthenticated && user && clientSecret === null && hasFetchedUser.current === false)
    {
      hasFetchedUser.current = true;
      fetchMembership(user.id, user.email)
        .then((response) => {
          if (response.success) {
            const data:Subscription = response.message;
            console.log('Membership fetched', data);
            setSubscription({
              start_date: data.start_date,
              renewal_date: data.renewal_date,
              membership_status: data.membership_status,
              billing_rate: data.billing_rate,
            });
            if(data.membership_status === false)
            {
              
              createCheckoutSession().then((response) => {
                if (response) {
                    setClientSecret(response.message);
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
    <div className="container-sm p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <button 
        onClick={() => navigate('/settings')} 
        className="mb-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
      >
        Back
      </button>

     
   

      <h2 className={`text-2xl text-center font-bold mb-4 ${subscription.membership_status ? 'text-green-400' : 'text-red-400'}`}>
        Your Subscription is {subscription.membership_status ? 'Active' : 'Inactive'}
      </h2>
  
      {
       <EmbeddedCheckoutProvider
       key={clientSecret}
        stripe={stripePromise}
        options={{clientSecret}}
      >
        <EmbeddedCheckout key={clientSecret}/>
      </EmbeddedCheckoutProvider>
      }
      
      {/* {!subscription.membership_status && (
      <button 
        type="submit" 
        disabled={!isFormValid} 
        className={`mt-6 w-full px-4 py-2 rounded-lg text-white font-bold ${isFormValid ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 cursor-not-allowed'}`}
      >
        Pay Now
      </button>
      )} */}


      {subscription.membership_status && (
      <div className="w-full text-center bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-bold mb-2">Subscription Details</h3>
          <p className="text-gray-400">Billing Rate: <span className="text-white font-bold">{subscription.billing_rate}</span></p>
          <p className="text-gray-400">Start Date: <span className="text-white">{(subscription.start_date !== null ? subscription.start_date:"--/--/--")}</span></p>
          <p className="text-gray-400">Renewal Date: <span className="text-white">{(subscription.renewal_date !== null ? subscription.renewal_date:"--/--/--")}</span></p>
        </div>
)}
    </div>
  );
};

export default Subscription;
