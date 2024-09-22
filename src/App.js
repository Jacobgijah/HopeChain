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
  const [userPrincipal, setUserPrincipal] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      const authClient = await AuthClient.create();
      if (await authClient.isAuthenticated()) {
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal().toText();
        setIsAuthenticated(true);
        setUserPrincipal(principal);
      }
    };
    checkAuthentication();
  }, []);

  const handleLogin = async () => {
    const authClient = await AuthClient.create();
    authClient.login({
      identityProvider: 'https://identity.ic0.app/#authorize',
      onSuccess: () => {
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal().toText();
        setIsAuthenticated(true);
        setUserPrincipal(principal);
        localStorage.setItem('userPrincipal', principal);
        navigate('/'); // Redirect to the home page
      },
    });
  };

  const handleLogout = async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
    setIsAuthenticated(false);
    setUserPrincipal('');
    localStorage.removeItem('userPrincipal');
    navigate('/login'); // Redirect to the login page
  };

  return (
    <ProductProvider>
      <div>
        <Navbar
          isAuthenticated={isAuthenticated}
          userName={userPrincipal}
          onLogout={handleLogout}
        />
        <Routes>
          <Route path='/' element={<Shop />} />
          <Route path='/mens' element={<ShopCategory banner={men_banner} category="Designs" />} />
          <Route path='/womens' element={<ShopCategory banner={women_banner} category="Textiles" />} />
          <Route path='/kids' element={<ShopCategory banner={kid_banner} category="Kitchenware" />} />
          <Route path="/product/:productId" element={<Product />} /> 
          <Route path="/charity" element={<CharityProfile />} /> 
          <Route path="/privacyPolicy" element={<PrivacyPolicy />} /> 
          <Route path='/cart' element={<Cart />} />
          <Route path='/login' element={<Login onLogin={handleLogin} />} />
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
