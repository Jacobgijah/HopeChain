import { createActor as HopechainEngineMain } from "../declarations/hopechain-engine-main";

// Retrieve canister ID and host from environment variables
const canisterIdBackEnd = process.env.REACT_APP_HOPECHAIN_ENGINE_BACKEND_CANISTER_ID;
const host = process.env.REACT_APP_HOST; 

// Create the actor instance for the backend canister
const actorBackend = HopechainEngineMain(canisterIdBackEnd, { 
  agentOptions: { host },
});

// The actor for use in other parts of the application
export { actorBackend };
