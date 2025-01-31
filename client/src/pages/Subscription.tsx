import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { fetchMembership, processMembershipPurchase } from '../utils/authUtils';


interface Subscription {
  start_date: string|null;
  renewal_date: string|null;
  membership_status: boolean;
  billing_rate: number;
}

const Subscription: React.FC = () => {

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
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', zip: '', cardNumber: '', expiryDate: '', cvv: '' });
  const [isFormValid, setIsFormValid] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateForm();
  };

  const validateForm = () => {
    const nameValid = form.name.trim().length > 0;
    const emailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email);
    const addressValid = form.address.trim().length > 0;
    const cityValid = form.city.trim().length > 0;
    const zipValid = /^\d{5}$/.test(form.zip);
    const cardValid = subscription.membership_status || /^\d{16}$/.test(form.cardNumber);
    const expiryValid = subscription.membership_status || /^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiryDate);
    const cvvValid = subscription.membership_status || /^\d{3,4}$/.test(form.cvv);
    setIsFormValid(nameValid && emailValid && addressValid && cityValid && zipValid && cardValid && expiryValid && cvvValid);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isFormValid){
      try{
        if(isAuthenticated && user)
          {
            const startDate = new Date();
            const renewalDate = new Date(startDate);
            renewalDate.setMonth(startDate.getMonth() + 1);

            processMembershipPurchase(startDate.toISOString(), renewalDate.toISOString(), user.id, true, /*Random Price: Needs a source -->*/15.99)
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
    }
  };



  useEffect(() => {
    if(isAuthenticated && user)
    {
      fetchMembership(user.id)
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

      <div className="flex flex-col md:flex-row gap-6">
        {!subscription.membership_status && (
        <form className="w-full md:w-1/2" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block font-medium">Name:</label>
            <input type="text" id="name" name="name" value={form.name} 
              onChange={handleInputChange} required 
              className="w-full p-2 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block font-medium">Email:</label>
            <input type="email" id="email" name="email" value={form.email} 
              onChange={handleInputChange} required 
              className="w-full p-2 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="address" className="block font-medium">Address:</label>
            <input type="text" id="address" name="address" value={form.address} 
              onChange={handleInputChange} required 
              className="w-full p-2 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="city" className="block font-medium">City:</label>
            <input type="text" id="city" name="city" value={form.city} 
              onChange={handleInputChange} required 
              className="w-full p-2 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-4">
            <label htmlFor="zip" className="block font-medium">ZIP Code:</label>
            <input type="text" id="zip" name="zip" value={form.zip} 
              onChange={handleInputChange} required pattern="\d{5}" 
              className="w-full p-2 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-500" />
          </div>
          
            <>
              <div className="mb-4">
                <label htmlFor="cardNumber" className="block font-medium">Card Number:</label>
                <input type="text" id="cardNumber" name="cardNumber" value={form.cardNumber} 
                  onChange={handleInputChange} required pattern="\d{16}" 
                  className="w-full p-2 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-4">
                <label htmlFor="expiryDate" className="block font-medium">Expiry Date (MM/YY):</label>
                <input type="text" id="expiryDate" name="expiryDate" value={form.expiryDate} 
                  onChange={handleInputChange} required pattern="(0[1-9]|1[0-2])\/\d{2}" 
                  className="w-full p-2 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mb-4">
                <label htmlFor="cvv" className="block font-medium">CVV:</label>
                <input type="text" id="cvv" name="cvv" value={form.cvv} 
                  onChange={handleInputChange} required pattern="\d{3,4}" 
                  className="w-full p-2 bg-gray-800 text-white rounded-md focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          
        </form>)}

        {!subscription.membership_status && (
        <div className="w-full md:w-1/2 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-bold mb-2">Subscription Details</h3>
          <p className="text-gray-400">Billing Rate: <span className="text-white font-bold">{subscription.billing_rate}</span></p>
          <p className="text-gray-400">Start Date: <span className="text-white">{(subscription.start_date !== null ? subscription.start_date:"--/--/--")}</span></p>
          <p className="text-gray-400">Renewal Date: <span className="text-white">{(subscription.renewal_date !== null ? subscription.renewal_date:"--/--/--")}</span></p>
        </div>
        )}
      </div>
      {!subscription.membership_status && (
      <button 
        type="submit" 
        disabled={!isFormValid} 
        className={`mt-6 w-full px-4 py-2 rounded-lg text-white font-bold ${isFormValid ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 cursor-not-allowed'}`}
      >
        Pay Now
      </button>
      )}
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
