import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Currency = { 'icp' : null };
export interface Main {
  'addToCart' : ActorMethod<[Principal, bigint], boolean>,
  'addToUserCart' : ActorMethod<[Principal, Product], boolean>,
  'clearDB' : ActorMethod<[], undefined>,
  'clearUserCart' : ActorMethod<[Principal], boolean>,
  'convertProductToType' : ActorMethod<[Principal], Product>,
  'convertTransactionToType' : ActorMethod<[Principal], Transaction>,
  'convertUserToType' : ActorMethod<[Principal], User__1>,
  'createProduct' : ActorMethod<
    [Principal, string, string, Price, string, string, boolean, string],
    Principal
  >,
  'createTransaction' : ActorMethod<[bigint, Principal, Price], Principal>,
  'createUser' : ActorMethod<[Principal], Principal>,
  'editProduct' : ActorMethod<
    [bigint, Principal, string, string, Price, string, string, boolean],
    Result
  >,
  'getAllProductTypes' : ActorMethod<[], Array<Product>>,
  'getAllProductTypesFromObjectArray' : ActorMethod<
    [Array<Principal>],
    Array<Product>
  >,
  'getAllProducts' : ActorMethod<[], Array<Principal>>,
  'getAllTransactionTypes' : ActorMethod<[], Array<Transaction>>,
  'getAllTransactionTypesFromObjectArray' : ActorMethod<
    [Array<Principal>],
    Array<Transaction>
  >,
  'getAllTransactions' : ActorMethod<[], Array<Principal>>,
  'getAllUserPrincipals' : ActorMethod<[], Array<Principal>>,
  'getAllUsers' : ActorMethod<[], Array<Principal>>,
  'getAllUsersTypes' : ActorMethod<[], Array<User__1>>,
  'getAllUsersTypesFromObjectArray' : ActorMethod<
    [Array<Principal>],
    Array<User__1>
  >,
  'getProductById' : ActorMethod<[bigint], Result_1>,
  'getUserByPrincipal' : ActorMethod<[Principal], [] | [Principal]>,
  'getUserCartCount' : ActorMethod<[Principal], bigint>,
  'getUserCartProductTypes' : ActorMethod<[Principal], Array<Product>>,
  'isInCart' : ActorMethod<[Principal, bigint], boolean>,
  'loginUser' : ActorMethod<[Principal], [] | [Principal]>,
  'purchase' : ActorMethod<[Principal, bigint], Result>,
  'removeFromCart' : ActorMethod<[Principal, bigint], boolean>,
  'removeFromUserCart' : ActorMethod<[Principal, bigint], boolean>,
}
export interface Price { 'currency' : Currency, 'amount' : bigint }
export interface Product {
  'productLongDesc' : string,
  'productCategory' : string,
  'name' : string,
  'productShortDesc' : string,
  'productID' : bigint,
  'isSold' : boolean,
  'isVisible' : boolean,
  'sellerID' : Principal,
  'productPicture' : string,
  'productPrice' : Price,
}
export interface Product__1 {
  'getCategory' : ActorMethod<[], string>,
  'getIsSold' : ActorMethod<[], boolean>,
  'getIsVisible' : ActorMethod<[], boolean>,
  'getLongDesc' : ActorMethod<[], string>,
  'getName' : ActorMethod<[], string>,
  'getPicture' : ActorMethod<[], string>,
  'getPrice' : ActorMethod<[], Price>,
  'getProductID' : ActorMethod<[], bigint>,
  'getSellerID' : ActorMethod<[], Principal>,
  'getShortDesc' : ActorMethod<[], string>,
  'setCategory' : ActorMethod<[string], undefined>,
  'setIsVisible' : ActorMethod<[boolean], undefined>,
  'setLongDesc' : ActorMethod<[string], undefined>,
  'setName' : ActorMethod<[string], undefined>,
  'setPicture' : ActorMethod<[string], undefined>,
  'setPrice' : ActorMethod<[Price], undefined>,
  'setProductID' : ActorMethod<[bigint], undefined>,
  'setShortDesc' : ActorMethod<[string], undefined>,
  'updateStatus' : ActorMethod<[], undefined>,
}
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : Product__1 } |
  { 'err' : string };
export interface Transaction {
  'id' : bigint,
  'paidPrice' : Price,
  'productID' : bigint,
  'buyerID' : Principal,
}
export interface Transaction__1 {
  'getBuyerID' : ActorMethod<[], Principal>,
  'getID' : ActorMethod<[], bigint>,
  'getPaidPrice' : ActorMethod<[], Price>,
  'getProductID' : ActorMethod<[], bigint>,
  'setBuyerID' : ActorMethod<[Principal], undefined>,
  'setPaidPrice' : ActorMethod<[Price], undefined>,
  'setProductID' : ActorMethod<[bigint], undefined>,
}
export interface User {
  'addToCart' : ActorMethod<[Product], undefined>,
  'addToPurchases' : ActorMethod<[Transaction], undefined>,
  'addToSoldItems' : ActorMethod<[Transaction], undefined>,
  'addToWallet' : ActorMethod<[Price], undefined>,
  'clearCart' : ActorMethod<[], undefined>,
  'getBuyersCart' : ActorMethod<[], Array<Product>>,
  'getPrincipal' : ActorMethod<[], Principal>,
  'getPurchases' : ActorMethod<[], Array<Transaction>>,
  'getSellersStock' : ActorMethod<[], Array<Product>>,
  'getSoldItems' : ActorMethod<[], Array<Transaction>>,
  'getWallet' : ActorMethod<[], Array<Price>>,
  'listItem' : ActorMethod<[Product], undefined>,
  'removeFromCart' : ActorMethod<[bigint], undefined>,
  'setBuyersCart' : ActorMethod<[Array<Product>], undefined>,
  'setPrincipal' : ActorMethod<[Principal], undefined>,
  'setPurchases' : ActorMethod<[Array<Transaction>], undefined>,
  'setSellesStock' : ActorMethod<[Array<Product>], undefined>,
  'setSoldItems' : ActorMethod<[Array<Transaction>], undefined>,
  'setWallet' : ActorMethod<[Array<Price>], undefined>,
  'takeFromWallet' : ActorMethod<[Price], Result>,
}
export interface User__1 {
  'principal' : Principal,
  'soldItems' : Array<Transaction>,
  'buyersCart' : Array<Product>,
  'sellersStock' : Array<Product>,
  'purchases' : Array<Transaction>,
  'wallet' : Array<Price>,
}
export interface _SERVICE extends Main {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
