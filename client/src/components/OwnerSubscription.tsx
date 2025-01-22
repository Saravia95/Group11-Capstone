import React, { useState } from 'react';

const OwnerSubscription: React.FC = () => {
    const [isActive, setIsActive] = useState(false);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // Handle form submission logic here
        console.log('Form submitted');
    };

    return (
        <div>
            {isActive ? (
                <div>
                    <h2>Your Subscription is Active</h2>
                    <p>Thank you for subscribing!</p>
                </div>
            ) : (
                <div>
                    <h2>Your Subscription is Inactive</h2>
                    <p>The subscription price is $9.99 per month.</p>
                    <p>Subscribe now to enjoy premium features and benefits.</p>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name">Name:</label>
                            <input type="text" id="name" name="name" required />
                        </div>
                        <div>
                            <label htmlFor="email">Email:</label>
                            <input type="email" id="email" name="email" required />
                        </div>
                        <div>
                            <label htmlFor="cardNumber">Card Number:</label>
                            <input type="text" id="cardNumber" name="cardNumber" required />
                        </div>
                        <div>
                            <label htmlFor="expiryDate">Expiry Date:</label>
                            <input type="text" id="expiryDate" name="expiryDate" required />
                        </div>
                        <div>
                            <label htmlFor="cvv">CVV:</label>
                            <input type="text" id="cvv" name="cvv" required />
                        </div>
                        <button type="submit">Submit</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default OwnerSubscription;