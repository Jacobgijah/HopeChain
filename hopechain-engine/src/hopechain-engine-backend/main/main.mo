import Debug "mo:base/Debug";
import Buffer "mo:base/Buffer";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";

import Types "../commons/Types";
import Product "Product";
import Transaction "Transaction";
import User "User";

actor class Main() {
  stable var usersArray : [User.User] = [];
  stable var productsArray : [Product.Product] = [];
  stable var productIDNum : Nat = 0;
  stable var transactionsArray : [Transaction.Transaction] = [];
  stable var transactionIDNum : Nat = 0;

  var userBuffer = Buffer.fromArray<User.User>(usersArray);
  var productBuffer = Buffer.fromArray<Product.Product>(productsArray);
  var transactionBuffer = Buffer.fromArray<Transaction.Transaction>(transactionsArray);
  private var inCarts : Buffer.Buffer<(Principal, Nat)> = Buffer.Buffer<(Principal, Nat)>(0);

  // Managing Cart
  public func addToCart(userID : Principal, productID : Nat) : async Bool {
    if (not Buffer.contains(inCarts, (userID, productID), func (a : (Principal, Nat), b : (Principal, Nat)) : Bool {a.0 == b.0 and a.1 == b.1})) {
      inCarts.add((userID, productID));
      Debug.print("Added to cart: " # debug_show ((userID, productID)));
      return true;
    };
    Debug.print("Product already in cart: " # debug_show ((userID, productID)));
    return false;
  };

  public func removeFromCart(userID : Principal, productID : Nat) : async Bool {
    let beforeSize = inCarts.size();
    inCarts.filterEntries(
      func(index : Nat, item : (Principal, Nat)) : Bool {
        not (item.0 == userID and item.1 == productID);
      }
    );
    let removed = inCarts.size() < beforeSize;
    Debug.print("Removed from cart: " # debug_show ((userID, productID)) # " Success: " # debug_show (removed));
    return removed;
  };

  public func isInCart(userID : Principal, productID : Nat) : async Bool {
    Buffer.contains(inCarts, (userID, productID), func(a : (Principal, Nat), b : (Principal, Nat)) : Bool { a.0 == b.0 and a.1 == b.1});
  };

  // User-Related Methods (User Creation & Login)
  public func createUser(identity : Principal) : async User.User {
    Debug.print("Creating new user with Principal: " # Principal.toText(identity)); // Debug Principal

    // Create new user if no user found
    let newUser = await User.User(
      identity,       // Principal
      [],             // Empty cart
      [],             // Empty stock
      [],             // Empty purchases
      [],             // Empty sold items
      [{ currency = #icp; amount = 1000000000000 }] // Default wallet
    );

    Debug.print("New user created with Principal: " # Principal.toText(await newUser.getPrincipal()));
    await updateUserArray(newUser);
    Debug.print("User added to usersArray: " # Principal.toText(identity));
    return newUser;
  };

  public func loginUser(identity : Principal) : async ?User.User {
    Debug.print("loginUser called with Principal: " # Principal.toText(identity)); // Debug Principal

    for (user in usersArray.vals()) {
      let userPrincipal = await user.getPrincipal();
      Debug.print("Checking user with Principal: " # Principal.toText(userPrincipal)); // Debug each user
      if (identity == userPrincipal) {
        Debug.print("User found with matching Principal: " # Principal.toText(userPrincipal));
        return ?user; // User already exists, return it
      };
    };

    Debug.print("No matching user found, creating new user...");
    let newUser = await createUser(identity);
    Debug.print("New user created with Principal: " # Principal.toText(identity));
    return ?newUser; // Return the newly created user
  };

  private func updateUserArray(user : User.User) : async () {
    userBuffer.add(user);
    usersArray := Buffer.toArray<User.User>(userBuffer);
  };

  public query func getAllUsers() : async [User.User] {
    return usersArray;
  };

  public func getAllUsersTypesFromObjectArray(userObjList : [User.User]) : async [Types.User] {
    let typeBuffer = Buffer.Buffer<Types.User>(0);
    for (user in userObjList.vals()) {
      typeBuffer.add(await (convertUserToType(user)));
    };
    return Buffer.toArray(typeBuffer);
  };

  public func getAllUsersTypes() : async [Types.User] {
    return await (getAllUsersTypesFromObjectArray(await getAllUsers()));
  };

  public func convertUserToType(user: User.User) : async Types.User {
    return {
      principal = await user.getPrincipal();
      buyersCart = await user.getBuyersCart();
      sellersStock = await user.getSellersStock();
      purchases = await user.getPurchases();
      soldItems = await user.getSoldItems();
      wallet = await user.getWallet();
    };
  };

  // Product-Related Methods
  public func createProduct(
    user : Principal,  
    name : Text,
    category : Text,
    price : Types.Price,
    shortDesc : Text,
    longDesc : Text,
    isVisible : Bool,
    picture : Text
  ) : async Product.Product {
    var product = await Product.Product(
      user,          // Assign the Principal as the seller's ID
      name,          // Product name
      category,      // Product category
      price,         // Product price
      shortDesc,     // Short description
      longDesc,      // Long description
      isVisible,     // Product visibility
      picture,       // Product picture
      productIDNum   // Unique product ID
    );

    productIDNum := productIDNum + 1;
    await updateProductArray(product);  // Add the product to the product array
    return product;
  };

  private func updateProductArray(product : Product.Product) : async () {
    productBuffer.add(product);
    productsArray := Buffer.toArray<Product.Product>(productBuffer);
  };

  public query func getAllProducts() : async [Product.Product] {
    return productsArray;
  };

  public func getAllProductTypesFromObjectArray(productObjList : [Product.Product]) : async [Types.Product] {
    let typeBuffer = Buffer.Buffer<Types.Product>(0);
    for (product in productObjList.vals()) {
      typeBuffer.add(await (convertProductToType(product)));
    };
    return Buffer.toArray(typeBuffer);
  };

  public func getAllProductTypes() : async [Types.Product] {
    return await (getAllProductTypesFromObjectArray(await getAllProducts()));
  };

  public func convertProductToType(product : Product.Product) : async Types.Product {
    return {
      sellerID = await product.getSellerID();
      name = await product.getName();
      productPrice = await product.getPrice();
      productShortDesc = await product.getShortDesc();
      productLongDesc = await product.getLongDesc();
      isSold = await product.getIsSold();
      isVisible = await product.getIsVisible();
      productID = await product.getProductID();
      productCategory = await product.getCategory();
      productPicture = await product.getPicture();
    };
  };

  public func editProduct(
    productID : Nat,
    sellerID : Principal,
    newName : Text,
    newCategory : Text,
    newPrice : Types.Price,
    newShortDesc : Text,
    newLongDesc : Text,
    newIsVisible : Bool
  ) : async Result.Result<(), Text> {
    for (product in productsArray.vals()) {
      let prod = await convertProductToType(product);
      if (prod.productID == productID and prod.sellerID == sellerID) {
        await product.setName(newName);
        await product.setCategory(newCategory);
        await product.setPrice(newPrice);
        await product.setShortDesc(newShortDesc);
        await product.setLongDesc(newLongDesc);
        await product.setIsVisible(newIsVisible);
        return #ok(());
      };
    };
    return #err("Product not found or user is not the seller");
  };

  // Transaction Methods
  public func createTransaction(
    productID : Nat,
    buyerID : Principal,
    paidPrice : Types.Price
  ) : async Transaction.Transaction {
    var transaction = await Transaction.Transaction(transactionIDNum, productID, buyerID, paidPrice);
    transactionIDNum := transactionIDNum + 1;
    await updateTransactionArray(transaction);
    return transaction;
  };

  private func updateTransactionArray(transaction : Transaction.Transaction) : async () {
    transactionBuffer.add(transaction);
    transactionsArray := Buffer.toArray<Transaction.Transaction>(transactionBuffer);
  };

  public query func getAllTransactions() : async [Transaction.Transaction] {
    return transactionsArray;
  };

  public func convertTransactionToType(transaction : Transaction.Transaction) : async Types.Transaction {
    return {
      id = await transaction.getID();
      productID = await transaction.getProductID();
      buyerID = await transaction.getBuyerID();
      paidPrice = await transaction.getPaidPrice();
    };
  };

  public func getAllTransactionTypes() : async [Types.Transaction] {
    let typeBuffer = Buffer.Buffer<Types.Transaction>(0);
    for (transaction in transactionsArray.vals()) {
      typeBuffer.add(await (convertTransactionToType(transaction)));
    };
    return Buffer.toArray(typeBuffer);
  };
};
