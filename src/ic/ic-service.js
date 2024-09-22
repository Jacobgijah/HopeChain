import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as hopechain_engine_idl } from '../declarations/hopechain-engine-backend/hopechain-engine-backend.did.js';
// import { Principal } from '@dfinity/principal';

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

export const registerUser = async () => {
  try {
    const principal = localStorage.getItem('userPrincipal');
    if (!principal) {
      throw new Error('User not authenticated');
    }

    const user = await hopechain_engine.registerUser(principal);
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
