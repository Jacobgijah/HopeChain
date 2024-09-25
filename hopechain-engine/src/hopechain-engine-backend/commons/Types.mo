import Nat "mo:base/Nat";
import Principal "mo:base/Principal";

module Types {
  public type Timestamp = Nat64;

  public type Currency = {
    #icp;
  };

  public type Price = {
    currency : Currency;
    amount : Nat;
  };

  //User Object Types
  public type Product = {
    sellerID : Principal;
    name : Text;
    productPrice : Types.Price;
    productShortDesc : Text;
    productLongDesc : Text;
    isSold : Bool;
    isVisible : Bool;
    productID : Nat;
    productCategory : Text;
    productPicture : Text;
  };

  public type Transaction = {
    id : Nat;
    productID : Nat;
    buyerID : Principal;
    paidPrice : Types.Price;
  };

  public type User = {
    principal : Principal;
    buyersCart : [Product];
    sellersStock : [Product];
    purchases : [Transaction];
    soldItems : [Transaction];
    wallet : [Types.Price];
  };

};