import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Product {
  'id' : ProductID,
  'sellerPrincipal' : Principal,
  'inventory' : bigint,
  'productName' : string,
  'shortDescription' : string,
  'currency' : string,
  'category' : string,
  'price' : number,
  'productImage' : Uint8Array | number[],
  'longDescription' : string,
  'dateAdded' : string,
}
export type ProductID = bigint;
export interface User { 'id' : UserID, 'principal' : Principal }
export type UserID = bigint;
export interface _SERVICE {
  'addProduct' : ActorMethod<
    [
      Principal,
      string,
      string,
      string,
      number,
      string,
      string,
      Uint8Array | number[],
      bigint,
      string,
    ],
    ProductID
  >,
  'deposit' : ActorMethod<[number, string], number>,
  'getProducts' : ActorMethod<[], Array<Product>>,
  'getProductsBySeller' : ActorMethod<[Principal], Array<Product>>,
  'getTotalCharityAmount' : ActorMethod<[], number>,
  'getTotalPrice' : ActorMethod<[], number>,
  'getUser' : ActorMethod<[Principal], [] | [User]>,
  'registerUser' : ActorMethod<[Principal], [] | [User]>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
