import React, { useState, useEffect } from 'react';
import './CSS/Charityprofile.css';
import { getTotalCharityAmount } from '../ic/productService'; // Import the service to get charity amount

const CharityProfile = () => {
  const organizationName = 'Charity Foundation';
  const foundationDescription = 'Charity Foundation is dedicated to provide support for children in Tanzania by providing quality education in underserved areas. They built the Seeds of Light School in Kizimkazi, Zanzibar, which is educating more than 100 children.';
  const [charityAmount, setCharityAmount] = useState(0);
  const donations = [
    { date: '2024-04-10', amount: 500 },
    { date: '2024-05-15', amount: 750 },
    { date: '2024-06-20', amount: 1250 },
    { date: '2024-07-25', amount: 1500 },
    { date: '2024-08-30', amount: 1000 },
  ];

  useEffect(() => {
    const fetchCharityAmount = async () => {
      try {
        const amountInIcp = await getTotalCharityAmount();
        setCharityAmount(amountInIcp);
      } catch (error) {
        console.error("Error fetching charity amount:", error);
      }
    };

    fetchCharityAmount();
  }, []);

  return (
    <div className="charity-profile">
      <div className="charity-header">
        <h2 className="charity-title">{organizationName}</h2>
        <p className="charity-description">{foundationDescription}</p>
      </div>
      <div className="charity-info">
        <p className="total-amount">Total Amount Received: <span>{charityAmount.toLocaleString()} ICP</span></p>
      </div>
      <table className="donations-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount ($)</th>
          </tr>
        </thead>
        <tbody>
          {donations.map((donation, index) => (
            <tr key={index}>
              <td>{donation.date}</td>
              <td>{donation.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CharityProfile;
