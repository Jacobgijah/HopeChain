import React, { createContext, useState, useEffect } from 'react';
import { actorBackend } from '../backendImports/api';

export const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => { // Accept userPrincipal as a prop
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await actorBackend.getAllProductTypes(); // Pass the user's principal
        setAllProducts(products);
      } catch (error) {
        setProductError(error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ allProducts, loadingProducts, productError }}>
      {children}
    </ProductContext.Provider>
  );
};
