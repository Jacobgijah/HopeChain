import React, { useState } from 'react';
import './CSS/LoginSignup.css';
import { getUser } from '../ic/ic-service'; // Service to interact with the Motoko backend
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    setName(event.target.value);
  };

  const validateName = (name) => {
    // Check if the name is not empty and contains only letters and spaces
    const nameRegex = /^[A-Za-z\s]+$/;
    return name.trim().length > 0 && nameRegex.test(name);
  };

  const handleSubmit = async () => {
    if (validateName(name)) {
      try {
        const user = await getUser(name); // Fetch the user from the backend by name
        if (user) { // If user exists
          onLogin(name); // Proceed with the login process
          navigate('/'); // Redirect to the home page
        } else {
          setError(`${name} does not exist! Please sign up first.`); // Display error if user does not exist
        }
      } catch (error) {
        console.error('An error occurred while checking the user:', error); // Log the error for debugging
        setError('An error occurred while checking the user. Please try again later.'); // Display a user-friendly error message
      }
    } else {
      setError('Please enter a valid full name (letters only).'); // Display validation error
    }
  };

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>Log In</h1>
        <div className="loginsignup-fields">
          <input 
            type="text" 
            placeholder='Your Full Name' 
            value={name}
            onChange={handleInputChange}
          />
        </div>
        <button onClick={handleSubmit}>
          Continue
        </button>
        {error && <p className="loginsignup-error">{error}</p>} {/* Display error message */}
        <p className="loginsignup-login">
          Don't have an account? <Link to='/signup'><span>Create here</span></Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
