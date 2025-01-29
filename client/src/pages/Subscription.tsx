import React, { useState } from 'react';
import { useNavigate } from 'react-router';

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(true);
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
    const cardValid = isActive || /^\d{16}$/.test(form.cardNumber);
    const expiryValid = isActive || /^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiryDate);
    const cvvValid = isActive || /^\d{3,4}$/.test(form.cvv);
    setIsFormValid(nameValid && emailValid && addressValid && cityValid && zipValid && cardValid && expiryValid && cvvValid);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isFormValid) console.log('Form submitted', form);
  };


  return (
    <div className="container-sm p-6 bg-gray-900 text-white rounded-lg shadow-lg">
 
     

      <button 
        onClick={() => navigate('/settings')} 
        className="mb-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
      >
        Back
      </button>

      //DEVELOPMENT ONLY BUTTONS
      <button 
        onClick={() =>  setIsActive((prev) => !prev)} 
        className="mb-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
      >
        Toggle Subscription State
      </button>
      <button 
        onClick={() =>  setIsFormValid((prev) => !prev)} 
        className="mb-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
      >
        Toggle Valid Form State
      </button>
      //----------------------- DEVELOPMENT ONLY BUTTONS ^^^^

      <h2 className={`text-2xl font-bold mb-4 ${isActive ? 'text-green-400' : 'text-red-400'}`}>
        Your Subscription is {isActive ? 'Active' : 'Inactive'}
      </h2>

      <div className="flex flex-col md:flex-row gap-6">
        {!isActive && (
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

        {!isActive && (
        <div className="w-full md:w-1/2 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-bold mb-2">Subscription Details</h3>
          <p className="text-gray-400">Subscription Price: <span className="text-white font-bold">$9.99/month</span></p>
        </div>
        )}
      </div>
      {!isActive && (
      <button 
        type="submit" 
        disabled={!isFormValid} 
        className={`mt-6 w-full px-4 py-2 rounded-lg text-white font-bold ${isFormValid ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 cursor-not-allowed'}`}
      >
        Pay Now
      </button>
      )}
{isActive && (
      <div className="w-full text-center bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-bold mb-2">Subscription Details</h3>
          <p className="text-gray-400">Subscription Price: <span className="text-white font-bold">$9.99/month</span></p>
          {<p className="text-gray-400">Next Billing Date: <span className="text-white">01/10/2025</span></p>}
        </div>
)}
    </div>
  );
};

export default Subscription;
