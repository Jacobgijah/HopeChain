import React from 'react'
import CartItems from '../Components/CartItems/CartItems'

const Cart = ({userPrincipal}) => {
  return (
    <div>
      <CartItems userPrincipal={userPrincipal}/>
    </div>
  )
}

export default Cart
