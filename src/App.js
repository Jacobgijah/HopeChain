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
import { actorBackend } from './backendImports/api'; // Import the Motoko backend actor
import { Principal } from "@dfinity/principal"; // Import Principal to convert


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPrincipal, setUserPrincipal] = useState(localStorage.getItem('userPrincipal') || '');
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false); 
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [logoutMessage, setLogoutMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      const authClient = await AuthClient.create();
      if (await authClient.isAuthenticated()) {
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal().toText();
        setIsAuthenticated(true);
        setUserPrincipal(principal);
        localStorage.setItem('userPrincipal', principal);

        // Call the backend to store or verify the user
        await loginOrCreateUser(principal); // Call the backend
      } else {
        localStorage.removeItem('userPrincipal');
      }
      setLoading(false);
    };
    checkAuthentication();
  }, []);

  const loginOrCreateUser = async (principal) => {
    try {
      // Convert the principalText (string) to a Principal type
      const principalText = Principal.fromText(principal);

      // Call Motoko backend's loginUser function
      const user = await actorBackend.loginUser(principalText);
      
      console.log("Logged in or created user:", user);
      setSuccessMessage('User authenticated and stored in backend.');
    } catch (error) {
      console.error("Backend user login/creation error:", error);
      if (error.message) {
        setErrorMessage(`Failed to authenticate user with backend: ${error.message}`);
      } else {
        setErrorMessage('Failed to authenticate user with backend due to unknown error.');
      }
    }
  };

  const handleLogin = async () => {
    const authClient = await AuthClient.create();
    setLoginLoading(true);
    try {
      await authClient.login({
        identityProvider: 'https://identity.ic0.app/#authorize',
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal().toText();
          setIsAuthenticated(true);
          setUserPrincipal(principal);
          localStorage.setItem('userPrincipal', principal);
          
          // Store or login the user in the backend after authentication
          await loginOrCreateUser(principal);
          setSuccessMessage('Successfully logged in!');
          navigate('/');
        },
      });
    } catch (error) {
      setErrorMessage('Failed to authenticate. Please try again.');
      console.error('Authentication error:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
    setIsAuthenticated(false);
    setUserPrincipal('');
    localStorage.removeItem('userPrincipal');
    setLogoutMessage('Successfully logged out!');
    navigate('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ProductProvider userPrincipal={userPrincipal}>
      <div>
        <Navbar
          isAuthenticated={isAuthenticated}
          userName={userPrincipal}
          onLogout={handleLogout}
        />
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        {logoutMessage && <div className="logout-message">{logoutMessage}</div>}
        {loginLoading && <div className="loading-spinner"></div>}
        <Routes>
          <Route path='/' element={<Shop />} />
          <Route path='/mens' element={<ShopCategory banner={men_banner} category="Designs" />} />
          <Route path='/womens' element={<ShopCategory banner={women_banner} category="Textiles" />} />
          <Route path='/kids' element={<ShopCategory banner={kid_banner} category="Kitchenware" />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/charity" element={<CharityProfile />} />
          <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
          <Route path='/cart' element={<Cart userPrincipal={userPrincipal} />} />
          <Route path='/login' element={<Login onLogin={handleLogin} errorMessage={errorMessage} />} />
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
