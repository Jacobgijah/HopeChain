import React, { useState } from 'react';
import './CSS/LoginSignup.css';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ onLogin }) => {
  // eslint-disable-next-line
  const navigate = useNavigate();
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const handleLogin = () => {
    onLogin(); // Trigger the Internet Identity login
  };

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>Log In</h1>
        <button
          onClick={handleLogin}
          style={{
            opacity: isChecked ? 1 : 0.5,
            cursor: isChecked ? 'pointer' : 'not-allowed'
          }}
          disabled={!isChecked}
        >
          Continue with Internet Identity
        </button>
        <p className="loginsignup-login">
        <input
            type="checkbox"
            name=''
            id=''
            onChange={handleCheckboxChange}
          />
          By continuing, I agree to the terms of use & 
          <Link to="/PrivacyPolicy" style={{ textDecoration: 'underline' }}> Privacy Policy. </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
