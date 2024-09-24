export const idlFactory = ({ IDL }) => {
  const ProductID = IDL.Nat;
  const Product = IDL.Record({
    'id' : ProductID,
    'sellerPrincipal' : IDL.Principal,
    'inventory' : IDL.Nat,
    'productName' : IDL.Text,
    'shortDescription' : IDL.Text,
    'currency' : IDL.Text,
    'category' : IDL.Text,
    'price' : IDL.Float64,
    'productImage' : IDL.Vec(IDL.Nat8),
    'longDescription' : IDL.Text,
    'dateAdded' : IDL.Text,
  });
  const UserID = IDL.Nat;
  const User = IDL.Record({ 'id' : UserID, 'principal' : IDL.Principal });
  return IDL.Service({
    'addProduct' : IDL.Func(
        [
          IDL.Principal,
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Float64,
          IDL.Text,
          IDL.Text,
          IDL.Vec(IDL.Nat8),
          IDL.Nat,
          IDL.Text,
        ],
        [ProductID],
        [],
      ),
    'deposit' : IDL.Func([IDL.Float64, IDL.Text], [IDL.Float64], []),
    'getProducts' : IDL.Func([], [IDL.Vec(Product)], ['query']),
    'getProductsBySeller' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Product)],
        ['query'],
      ),
    'getTotalCharityAmount' : IDL.Func([], [IDL.Float64], ['query']),
    'getTotalPrice' : IDL.Func([], [IDL.Float64], ['query']),
    'getUser' : IDL.Func([IDL.Principal], [IDL.Opt(User)], ['query']),
    'registerUser' : IDL.Func([IDL.Principal], [IDL.Opt(User)], []),
  });
};
export const init = ({ IDL }) => { return []; };
