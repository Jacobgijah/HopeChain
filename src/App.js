import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Shop from './Pages/Shop';
import ShopCategory from './Pages/ShopCategory';
import Product from './Pages/Product';
import Cart from './Pages/Cart';
import LoginSignup from './Pages/LoginSignup';
import Login from './Pages/Login';
import Seller from './Pages/Seller';
import SellerProfile from './Pages/SellerProfile';
import Footer from './Components/Footer/Footer';
import men_banner from './Components/Assets/banner_mens.png';
import women_banner from './Components/Assets/banner_women.png';
import kid_banner from './Components/Assets/banner_kids.png';
import CharityProfile from './Pages/CharityProfile';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import { ProductProvider } from './Context/ProductContext';
import { AuthClient } from '@dfinity/auth-client';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPrincipal, setUserPrincipal] = useState(localStorage.getItem('userPrincipal') || '');
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false); // State for login loading
  const [errorMessage, setErrorMessage] = useState(''); // State for error messages
  const [successMessage, setSuccessMessage] = useState(''); // State for success messages
  const [logoutMessage, setLogoutMessage] = useState(''); // State for logout messages
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      const authClient = await AuthClient.create();
      if (await authClient.isAuthenticated()) {
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal().toText();
        setIsAuthenticated(true);
        setUserPrincipal(principal);
        localStorage.setItem('userPrincipal', principal); // Store in localStorage
      } else {
        localStorage.removeItem('userPrincipal'); // Clear if not authenticated
      }
      setLoading(false); // Stop loading after check
    };
    checkAuthentication();
  }, []);

  const handleLogin = async () => {
    const authClient = await AuthClient.create();
    setLoginLoading(true); // Start loading
    try {
      await authClient.login({
        identityProvider: 'https://identity.ic0.app/#authorize',
        onSuccess: () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal().toText();
          setIsAuthenticated(true);
          setUserPrincipal(principal);
          localStorage.setItem('userPrincipal', principal); // Store in localStorage
          setSuccessMessage('Successfully logged in!'); // Set success message
          setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
          navigate('/'); // Redirect to the home page
        },
      });
    } catch (error) {
      setErrorMessage('Failed to authenticate. Please try again.'); // Set error message
      console.error('Authentication error:', error); // Log error for debugging
    } finally {
      setLoginLoading(false); // Stop loading
    }
  };

  const handleLogout = async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
    setIsAuthenticated(false);
    setUserPrincipal('');
    localStorage.removeItem('userPrincipal');
    setLogoutMessage('Successfully logged out!'); // Set logout message
    setTimeout(() => setLogoutMessage(''), 3000); // Clear message after 3 seconds
    navigate('/login'); // Redirect to the login page
  };

  if (loading) {
    return <div>Loading...</div>; // Display loading state during authentication check
  }

  return (
    <ProductProvider userPrincipal={userPrincipal}> {/* Pass the userPrincipal */}
      <div>
        <Navbar
          isAuthenticated={isAuthenticated}
          userName={userPrincipal}
          onLogout={handleLogout}
        />
        {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Display error message */}
        {successMessage && <div className="success-message">{successMessage}</div>} {/* Display success message */}
        {logoutMessage && <div className="logout-message">{logoutMessage}</div>} {/* Display logout message */}
        {loginLoading && <div className="loading-spinner"></div>} {/* Show spinner while logging in */}
        <Routes>
          <Route path='/' element={<Shop />} />
          <Route path='/mens' element={<ShopCategory banner={men_banner} category="Designs" />} />
          <Route path='/womens' element={<ShopCategory banner={women_banner} category="Textiles" />} />
          <Route path='/kids' element={<ShopCategory banner={kid_banner} category="Kitchenware" />} />
          <Route path="/product/:productId" element={<Product />} /> 
          <Route path="/charity" element={<CharityProfile />} /> 
          <Route path="/privacyPolicy" element={<PrivacyPolicy />} /> 
          <Route path='/cart' element={<Cart userPrincipal={userPrincipal} />} />
          <Route path='/login' element={<Login onLogin={handleLogin} errorMessage={errorMessage} />} /> {/* Pass errorMessage */}
          <Route path='/signup' element={<LoginSignup />} />
          <Route path='/seller' element={<Seller userName={userPrincipal} />} />
          <Route path='/sellerProfile' element={<SellerProfile userName={userPrincipal} />} />
        </Routes>
        <Footer />
      </div>
    </ProductProvider>
  );
}

export default App;
