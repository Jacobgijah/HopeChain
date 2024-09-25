import Debug "mo:base/Debug";
import Buffer "mo:base/Buffer";
import Cycles "mo:base/ExperimentalCycles";
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

  public func addToCart(userID : Principal, productID : Nat) : async Bool {
    if (not Buffer.contains(inCarts, (userID, productID), func (a : (Principal, Nat), b : (Principal, Nat)) : Bool {a.0 == b.0 and a.1 == b.1})) {
      inCarts.add((userID, productID));
      Debug.print("Added to cart: "# debug_show ((userID, productID)));
      return true;
    };
    Debug.print("Product already in cart: "# debug_show ((userID, productID)));
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

  // come back to refactor this method to compute principal
  public func getAllUserPrincipals() : async [Principal] {
    let principalBuffer = Buffer.Buffer<Principal>(0);
    for (index in usersArray.vals()) {
        let principal = await index.getPrincipal(); // Assuming getPrincipal() returns a Principal
        principalBuffer.add(principal);
    };
    return Buffer.toArray(principalBuffer);
  };

  // private func numberOfSplits(str : Text, delimiter : Text) : async Nat {
  //   var count : Nat = 0;
  //   for (c in str.chars()) {
  //     if (Text.equal(Text.fromChar(c), delimiter)) {
  //       count += 1;
  //     };
  //   };
  //   return count;
  // };

  public func createUser<system>(identity : Principal) : async User.User {
    // Check if the user already exists using the principal
    for (user in usersArray.vals()) {
        let userPrincipal = await user.getPrincipal(); // Await the principal value
        if (userPrincipal == identity) { // Now compare the unwrapped principal
            Debug.print("User with principal " # Principal.toText(identity) # " already exists.");
            return user; // Return the existing user
        };
    };

    // If no user found, create a new user
    let newUser = await User.User(
      identity,
      [],
      [],
      [],
      [],
      [
        { currency = #icp; amount = 1000000000000 }, // Initialize with default wallet balance
      ],
    );

    await updateUserArray(newUser);
    Debug.print("Created new user with principal " # Principal.toText(identity));
    return newUser;
  };


  private func updateUserArray(user : User.User) : async () {
    userBuffer.add(user);
    usersArray := Buffer.toArray<User.User>(userBuffer);
  };

  public func loginUser(identity : Principal) : async ?User.User {
    // Iterate over usersArray and check the principal for each user
    for (user in usersArray.vals()) {
        let userPrincipal = await user.getPrincipal();
        if (identity == userPrincipal) {
            return ?user; // Return the existing user if the principal matches
        };
    };
    
    // If no user is found, create a new one
    let newUser = await createUser(identity); // Await the result of createUser first
    return ?newUser; // Wrap the new user in an optional before returning
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

  public func createProduct<system>(
    user : Principal,  // Use Principal instead of Text for the user
    name : Text,
    category : Text,
    price : Types.Price,
    shortDesc : Text,
    longDesc : Text,
    isVisible : Bool,
    picture : Text
) : async Product.Product {
    splitCycles<system>();

    // Create the product with the seller's Principal instead of name
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

  public func editProduct(
    productID : Nat,
    sellerID : Principal,
    newName : Text,
    newCategory : Text,
    newPrice : Types.Price,
    newShortDesc : Text,
    newLongDesc : Text,
    newIsVisible : Bool,
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

  public func createTransaction<system>(
    productID : Nat,
    buyerID : Principal,
    paidPrice : Types.Price
  ) : async Transaction.Transaction {
    Cycles.add<system>(200000000000);

    var transaction = await Transaction.Transaction(transactionIDNum, productID, buyerID, paidPrice);
    transactionIDNum := transactionIDNum + 1;
    let _temp = await updateTransactionArray(transaction);
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

  public func getAllTransactionTypesFromObjectArray(transactionObjList : [Transaction.Transaction]) : async [Types.Transaction] {
    let typeBuffer = Buffer.Buffer<Types.Transaction>(0);
    for (transaction in transactionObjList.vals()) {
        typeBuffer.add(await convertTransactionToType(transaction));
    };
    return Buffer.toArray(typeBuffer);
  };

  public func getAllTransactionTypes() : async [Types.Transaction] {
    return await getAllTransactionTypesFromObjectArray(await getAllTransactions());
  };

  private func splitCycles<system>() {
    Cycles.add<system>(200000000000);
  };

  public func addToUserCart(userPrincipal : Principal, product : Types.Product) : async Bool {
    // Find the user by their Principal
    let userOpt = await findUserByPrincipal(userPrincipal);
    
    switch (userOpt) {
      case (?user) {
        // Add the product to the cart if it's not already there
        if (await addToCart(userPrincipal, product.productID)) {
          await user.addToCart(product);
          Debug.print("Added to user cart: " # Principal.toText(userPrincipal) # ", Product: " # debug_show(product.productID));
          return true;
        } else {
          Debug.print("Failed to add to user cart: " # Principal.toText(userPrincipal) # ", Product: " # debug_show(product.productID));
          return false;
        };
      };
      case (null) {
        Debug.print("User not found: " # Principal.toText(userPrincipal));
        return false;
      };
    };
  };


  public func removeFromUserCart(userPrincipal : Principal, productID : Nat) : async Bool {
    let userOpt = await findUserByPrincipal(userPrincipal);
    switch (userOpt) {
      case (?user) {
        if (await removeFromCart(userPrincipal, productID)) {
            await user.removeFromCart(productID);
            Debug.print("Removed from user cart: " # Principal.toText(userPrincipal) # ", Product: " # debug_show (productID));
            return true;
        } else {
            Debug.print("Failed to remove from user cart: " # Principal.toText(userPrincipal) # ", Product: " # debug_show (productID));
            return false;
        };
      };
      case (null) {
        Debug.print("User not found: " # Principal.toText(userPrincipal));
        return false;
      };
    };
  };

  public func clearUserCart(userPrincipal : Principal) : async Bool {
    let userOpt = await findUserByPrincipal(userPrincipal);
    switch (userOpt) {
      case (?user) {
        let currentCart = await user.getBuyersCart();
        for (product in currentCart.vals()) {
            ignore await removeFromCart(userPrincipal, product.productID);
        };
        await user.clearCart();
        Debug.print("Cleared user cart: " # Principal.toText(userPrincipal));
        return true;
      };
      case (null) {
        Debug.print("User not found: " # Principal.toText(userPrincipal));
        return false;
      };
    };
  };

  public func getUserCartCount(userPrincipal : Principal) : async Nat {
    let userOpt = await findUserByPrincipal(userPrincipal);
    switch (userOpt) {
      case (?user) {
        let cart = await user.getBuyersCart();
        Debug.print("User cart count: " # Principal.toText(userPrincipal) # ", Count: " # debug_show (cart.size()));
        return cart.size();
      };
      case (null) {
        Debug.print("User not found: " # Principal.toText(userPrincipal));
        return 0;
      };
    };
  };

  public func getUserCartProductTypes(userPrincipal : Principal) : async [Types.Product] {
    let userOpt = await findUserByPrincipal(userPrincipal);
    switch (userOpt) {
      case (?user) {
        let cartProducts = await user.getBuyersCart();
        Debug.print("Retrieved user cart: " # Principal.toText(userPrincipal) # ", Items: " # debug_show (cartProducts.size()));
        return cartProducts;
      };
      case (null) {
        Debug.print("User not found: " # Principal.toText(userPrincipal));
        return [];
      };
    };
  };

  private func _getUserCartProductTypesFromObjectArray(cartProducts : [Types.Product]) : async [Types.Product] {
    let typeBuffer = Buffer.Buffer<Types.Product>(0);
    for (product in cartProducts.vals()) {
      typeBuffer.add(product);
    };
    return Buffer.toArray(typeBuffer);
  };

  public func getUserByPrincipal(principal: Principal) : async ?User.User {
    let users = await getAllUsers(); // returns all users
    for (user in users.vals()) {
        if (Principal.equal(principal, await user.getPrincipal())) {
            return ?user;
        };
    };
    return null;
  };


  public func getProductById(productID : Nat) : async Result.Result<Product.Product, Text> {
    for (product in productsArray.vals()) {
      let id = await product.getProductID();
      if (id == productID) {
          return #ok(product);
      };
    };
    return #err("Product not found");
  };

  public func purchase(buyerPrincipal: Principal, productID: Nat) : async Result.Result<(), Text> {
    let userObjOpt = await getUserByPrincipal(buyerPrincipal);

    switch (userObjOpt) {
        case (null) {
            return #err("User not found");
        };
        case (?userObj) {
            let productResult = await getProductById(productID);

            switch (productResult) {
                case (#err(errorMsg)) {
                    return #err(errorMsg);
                };
                case (#ok(product)) {
                    let sellerPrincipal = await product.getSellerID();
                    let productPrice = await product.getPrice();
                    let buyerID = buyerPrincipal; // Using Principal directly

                    for (index in usersArray.vals()) {
                        let target = await index.getPrincipal(); // Get the Principal of the user
                        if (Principal.equal(target, sellerPrincipal)) {
                            let walletResult = await userObj.takeFromWallet(productPrice);
                            switch (walletResult) {
                                case (#ok(())) {
                                    let transaction = await createTransaction(productID, buyerID, productPrice);
                                    let transactionType = await convertTransactionToType(transaction);
                                    await index.addToWallet(productPrice);
                                    await index.addToSoldItems(transactionType);
                                    await userObj.addToPurchases(transactionType);
                                    return #ok(());
                                };
                                case (#err(errorMsg)) {
                                    return #err("Error taking from wallet: " # errorMsg);
                                };
                            };
                        };
                    };
                    return #err("Seller not found");
                };
            };
        };
    };
  };


  public func clearDB() : async () {
    usersArray := [];
    productsArray := [];
    transactionsArray := [];
    productIDNum := 0;
    transactionIDNum := 0;
    userBuffer := Buffer.fromArray<User.User>(usersArray);
    productBuffer := Buffer.fromArray<Product.Product>(productsArray);
    transactionBuffer := Buffer.fromArray<Transaction.Transaction>(transactionsArray);
  };

  private func findUserByPrincipal(principal: Principal) : async ?User.User {
    for (user in usersArray.vals()) {
        if (Principal.equal(principal, await user.getPrincipal())) {
            return ?user;
        };
    };
    null;
  };
};