import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';


import { idlFactory as hopechain_engine_idl } from '../declarations/hopechain-engine-backend/hopechain-engine-backend.did.js';

const agent = new HttpAgent({ host: "http://127.0.0.1:4943" });
agent.fetchRootKey();

const hopechain_engine_id = process.env.REACT_APP_HOPECHAIN_ENGINE_BACKEND_CANISTER_ID;


if (!hopechain_engine_id) {
  throw new Error("REACT_APP_HOPECHAIN_ENGINE_BACKEND_CANISTER_ID is not defined");
}

const product_actor = Actor.createActor(hopechain_engine_idl, {
  agent,
  canisterId: hopechain_engine_id,
});


// Function to convert a base64 string to a Uint8Array
const base64ToUint8Array = (base64) => {
  const binaryString = window.atob(base64.split(',')[1]); // Decode base64 string
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i); // Convert to byte
  }
  
  return bytes;
};

// Function to add a product
export const addProduct = async (newProduct) => {
  try {
    console.log("New Product:", newProduct); // Log the new product object
    
    const sellerPrincipalString = newProduct.sellerName; // Use sellerName
    console.log("Seller Principal String:", sellerPrincipalString);

    if (!sellerPrincipalString) {
      throw new Error("Seller principal is undefined");
    }

    // Convert sellerPrincipal to Principal type
    const sellerPrincipal = Principal.fromText(sellerPrincipalString);
    
    // Destructure product details from newProduct
    const { productName, shortDescription, longDescription, price, currency, category, productImage, inventory, dateAdded } = newProduct;

    // Convert price and inventory to correct types
    const numericPrice = parseFloat(price); // Convert price to float
    const numericInventory = parseInt(inventory, 10); // Convert inventory to integer

    if (isNaN(numericPrice)) {
      throw new Error(`Invalid price value: ${price}`);
    }
    
    if (isNaN(numericInventory)) {
      throw new Error(`Invalid inventory value: ${inventory}`);
    }

    // Convert productImage to Uint8Array
    const productImageBytes = base64ToUint8Array(productImage);

    // Call the Motoko method
    return await product_actor.addProduct(
      sellerPrincipal,
      productName,
      shortDescription,
      longDescription,
      numericPrice, // Use numericPrice
      currency,
      category,
      productImageBytes, // Use the converted Uint8Array
      numericInventory, // Use numericInventory
      dateAdded
    );
  } catch (error) {
    console.error("Error adding product:", error);
    throw error; // Rethrow the error for the caller to handle
  }
};


export const getProducts = async (loggedInSellerPrincipal) => {
  try {
    const products = await product_actor.getProducts();

    // Filter out products posted by the logged-in seller
    const filteredProducts = products.filter(product => product.sellerPrincipal !== loggedInSellerPrincipal);

    // Convert Uint8Array back to a Base64 string for each product's image
    const productsWithImages = await Promise.all(filteredProducts.map(async (product) => {
      const productImageBase64 = await convertUint8ArrayToBase64(product.productImage);

      return {
        ...product,
        productImage: productImageBase64
      };
    }));

    return productsWithImages;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};


export const getProductsBySeller = async (sellerPrincipal) => {
  try {
    // Convert sellerPrincipal string to a Principal object
    const sellerPrincipalObject = Principal.fromText(sellerPrincipal);

    // Call the backend actor with the Principal object
    const products = await product_actor.getProductsBySeller(sellerPrincipalObject);
    
    // Convert Uint8Array back to Base64 string for each product's image
    const productsWithImages = await Promise.all(products.map(async (product) => {
      const productImageBase64 = await convertUint8ArrayToBase64(product.productImage);
      
      return {
        ...product,
        productImage: productImageBase64
      };
    }));

    return productsWithImages;
  } catch (error) {
    console.error('Error fetching products by seller:', error);
    throw error;
  }
};

// Helper function to convert Uint8Array to Base64
const convertUint8ArrayToBase64 = (uint8Array) => {
  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([uint8Array], { type: 'image/jpeg' }); // Adjust MIME type based on your image format
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result); // This will be the base64 encoded string
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      reject(error);
    }
  });
};

export const deposit = async (amount, currency) => {
  try {
    console.log("Amount passed to deposit:", parseFloat(amount));
    console.log("Currency passed to deposit:", currency);
    
    const remainingBalance = await product_actor.deposit(parseFloat(amount), currency);
    return remainingBalance;
  } catch (error) {
    console.error('Error during deposit:', error);
    throw error;
  }
};


export const getTotalCharityAmount = async () => {
  try {
    const totalCharityAmount = await product_actor.getTotalCharityAmount();
    console.log("Total Charity Amount:", totalCharityAmount);
    return totalCharityAmount;
  } catch (error) {
    console.error('Error fetching total charity amount:', error);
    throw error;
  }
};

export const getTotalPrice = async () => {
  try {
    const totalPrice = await product_actor.getTotalPrice();
    console.log("Total Price:", totalPrice);
    return totalPrice;
  } catch (error) {
    console.error('Error fetching total price:', error);
    throw error;
  }
};