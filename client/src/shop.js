import React, { useState, useEffect } from 'react';
import './CSS/shop.css';
import Item from './item';

const Shop = ({ setVal }) => {

  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch("http://localhost:3001/items")
      .then((res) => res.json())
      .then((json) => setItems(json))
      .catch((err) => console.log(err));
  }, []);

  const handleItemClick = (item) => {
    if(item.item_stock === 0){
      console.log("sold out");
      return;
    }
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    // const cart = JSON.parse(Cookies.get('cart'))|| [];
    const itemInCart = cart.find((cartItem) => cartItem.item_id === item.item_id);
    if (itemInCart) {
      itemInCart.quantity++;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    // Cookies.set('cart', "JSON.stringify(cart)", { expires: settings.login_duation, path: '/' });
    sessionStorage.setItem('cart', JSON.stringify(cart));
    sessionStorage.setItem('cartVal', getCartQuantity);
    console.log(cart);
    setVal(getCartQuantity())

  };

  function getCartQuantity(){
    let q = 0;
    let cart = JSON.parse(sessionStorage.getItem('cart'));
    console.log(cart);
    if(cart!=null)for(var i=0; i<cart.length; i++) q+= cart[i].quantity;
    return q;
  }



  return (
    <div className='Shop'>
        <h4>Shop</h4>
        <div id='items'>
          {items.map((item) => (
            <Item
              key={item.item_id}
              name={item.item_name}
              size={item.item_size}
              stock={item.item_stock}
              img={item.item_img}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>
    </div>
  );
}

export default Shop;
