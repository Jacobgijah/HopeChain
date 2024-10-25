import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as hopechain_engine_idl } from '../declarations/hopechain-engine-backend/hopechain-engine-backend.did.js';
import { Principal } from '@dfinity/principal';

const agent = new HttpAgent({ host: "http://127.0.0.1:4943" });
agent.fetchRootKey(); 

const hopechain_engine_id = process.env.REACT_APP_HOPECHAIN_ENGINE_BACKEND_CANISTER_ID;

console.log("Canister ID:", hopechain_engine_id);

const hopechain_engine = Actor.createActor(hopechain_engine_idl, {
  agent,
  canisterId: hopechain_engine_id,
});

console.log("Available methods:", Object.keys(hopechain_engine));

// Convert the current user's identity to a Principal
// const getPrincipal = async () => {
//   const identity = agent.identity;
//   const principal = Principal.fromText(identity.getPrincipal().toText());
//   return principal;
// };

export const loginUser = async (principal) => {
  try {
    if (!principal) {
      throw new Error('User not authenticated');
    }

    // Ensure the principal is a valid Principal type
    const principalText = Principal.fromText(principal); // Convert the string to Principal
    
    const user = await hopechain_engine.registerUser(principalText);
    if (user) {
      console.log('User registered:', user);
      return user;
    } else {
      console.log('User already exists');
      return null;
    }
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};


export const getUser = async () => {
  try {
    const principal = localStorage.getItem('userPrincipal');
    if (!principal) {
      throw new Error('User not authenticated');
    }

    const user = await hopechain_engine.getUser(principal);
    console.log('User from getUser:', user);

    if (user) {
      return user;
    } else {
      console.log('User does not exist');
      return null;
    }
  } catch (error) {
    console.error('Error checking user:', error);
    throw error;
  }
};

export const getUserByPrincipal = async () => {
  try {
    // Retrieve the principal from local storage
    const principal = localStorage.getItem('userPrincipal');
    
    // Check if the principal exists
    if (!principal) {
      throw new Error('User not authenticated');
    }

    // Convert the string to a Principal type
    const principalText = Principal.fromText(principal);
    
    // Call the getUser function from the canister
    const user = await hopechain_engine.getUser(principalText);
    console.log('User from getUserByPrincipal:', user);

    if (user) {
      return user; // Return the user if found
    } else {
      console.log('User does not exist');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving user by principal:', error);
    throw error; // Re-throw the error for handling in the calling function
  }
};


// import { Actor, HttpAgent } from '@dfinity/agent';
// import { idlFactory as main_idl } from '../declarations/hopechain-engine-main/hopechain-engine-main.did.js';
// import { Principal } from '@dfinity/principal';

// const agent = new HttpAgent({ host: "http://127.0.0.1:4943" }); // Adjust for production if needed
// agent.fetchRootKey();  // Required in local development, remove in production

// const main_canister_id = process.env.REACT_APP_HOPECHAIN_ENGINE_BACKEND_CANISTER_ID;
// console.log("Main Canister ID:", main_canister_id);

// // Create the actor for Main canister
// const main_actor = Actor.createActor(main_idl, {
//   agent,
//   canisterId: main_canister_id,
// });

// console.log("Available methods in Main actor:", Object.keys(main_actor));

// // =================== USER FUNCTIONS ===================

// // Register or login user with Principal
// export const loginUser = async (principal) => {
//   try {
//     if (!principal) {
//       throw new Error('User not authenticated');
//     }
//     const principalText = Principal.fromText(principal);
//     const user = await main_actor.loginUser(principalText);
//     if (user) {
//       console.log('User logged in:', user);
//       return user;
//     } else {
//       console.log('User creation failed.');
//       return null;
//     }
//   } catch (error) {
//     console.error('Error logging in user:', error);
//     throw error;
//   }
// };

// // Fetch all users as Types.User objects
// export const getAllUsers = async () => {
//   try {
//     const users = await main_actor.getAllUsersTypes();
//     console.log('All users:', users);
//     return users;
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     throw error;
//   }
// };

// // =================== PRODUCT FUNCTIONS ===================

// // Add a product
// export const createProduct = async (userPrincipal, name, category, price, shortDesc, longDesc, isVisible, picture) => {
//   try {
//     const principal = Principal.fromText(userPrincipal);
//     const newProduct = await main_actor.createProduct(principal, name, category, price, shortDesc, longDesc, isVisible, picture);
//     console.log('Product created:', newProduct);
//     return newProduct;
//   } catch (error) {
//     console.error('Error creating product:', error);
//     throw error;
//   }
// };

// // Get all products
// export const getAllProducts = async () => {
//   try {
//     const products = await main_actor.getAllProductTypes();
//     console.log('All products:', products);
//     return products;
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     throw error;
//   }
// };

// // =================== CART FUNCTIONS ===================

// // Add a product to cart
// export const addToCart = async (userPrincipal, productID) => {
//   try {
//     const principal = Principal.fromText(userPrincipal);
//     const success = await main_actor.addToCart(principal, productID);
//     if (success) {
//       console.log('Product added to cart:', productID);
//     } else {
//       console.log('Failed to add product to cart:', productID);
//     }
//     return success;
//   } catch (error) {
//     console.error('Error adding to cart:', error);
//     throw error;
//   }
// };

// // Remove a product from cart
// export const removeFromCart = async (userPrincipal, productID) => {
//   try {
//     const principal = Principal.fromText(userPrincipal);
//     const success = await main_actor.removeFromCart(principal, productID);
//     if (success) {
//       console.log('Product removed from cart:', productID);
//     } else {
//       console.log('Failed to remove product from cart:', productID);
//     }
//     return success;
//   } catch (error) {
//     console.error('Error removing from cart:', error);
//     throw error;
//   }
// };

// // Check if a product is in cart
// export const isInCart = async (userPrincipal, productID) => {
//   try {
//     const principal = Principal.fromText(userPrincipal);
//     const isInCart = await main_actor.isInCart(principal, productID);
//     console.log('Is product in cart:', productID, isInCart);
//     return isInCart;
//   } catch (error) {
//     console.error('Error checking cart:', error);
//     throw error;
//   }
// };

// // =================== TRANSACTION FUNCTIONS ===================

// // Create a transaction (purchase)
// export const createTransaction = async (productID, buyerPrincipal, paidPrice) => {
//   try {
//     const principal = Principal.fromText(buyerPrincipal);
//     const transaction = await main_actor.createTransaction(productID, principal, paidPrice);
//     console.log('Transaction created:', transaction);
//     return transaction;
//   } catch (error) {
//     console.error('Error creating transaction:', error);
//     throw error;
//   }
// };

// // Get all transactions
// export const getAllTransactions = async () => {
//   try {
//     const transactions = await main_actor.getAllTransactionTypes();
//     console.log('All transactions:', transactions);
//     return transactions;
//   } catch (error) {
//     console.error('Error fetching transactions:', error);
//     throw error;
//   }
// };
