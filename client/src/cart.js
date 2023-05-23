import React, { useState, useEffect } from 'react';
import './CSS/cart.css';
import Cookies from 'js-cookie';

const Cart = ({setVal}) => {
    const [cart, setCart] = useState([]);
    const [user_nm, setUser] = useState([]);
    const [roomNumber, setRoomNumber] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [cartQuantity, setCartQuantity] = useState(0);


    useEffect(() => {
        const cartData = JSON.parse(sessionStorage.getItem('cart')) || [];
        setCart(cartData);
    }, []);

    useEffect(() => {
        const user = Cookies.get('user_nm');
        setUser(user);
    }, []);

    useEffect(() => {
        getCartQuantity();
    }, []);

    useEffect(() => {
        if (roomNumber) {
            setOrderPlaced(true);
        } else {
            setOrderPlaced(false);
        }
    }, [roomNumber]);

    const handleQuantityChange = (item, newQuantity) => {
        if(newQuantity > 0){
             const updatedCart = cart.map((cartItem) => {
            if (cartItem.item_id === item.item_id) {
                return { ...cartItem, quantity: newQuantity };
            } else {
                return cartItem;
            }
        });
        setCart(updatedCart);
        sessionStorage.setItem('cart', JSON.stringify(updatedCart));
        setVal(getCartQuantity())
        }
    };

    const handleRemoveItem = (item) => {
        const updatedCart = cart.filter((cartItem) => cartItem.item_id !== item.item_id);
        setCart(updatedCart);
        sessionStorage.setItem('cart', JSON.stringify(updatedCart));
        setVal(getCartQuantity())
    };
      

    const handlePlaceOrder = () => {
        const orderData = {
            user_nm: user_nm,
            room_number: roomNumber,
            items: cart
        };
        fetch("http://"+window.location.hostname+":3001/order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        })
            .then((res) => {
                if (res.ok) {
                    console.log('Order saved to database');
                    setCart([]);
                    sessionStorage.removeItem('cart');
                    setRoomNumber('');
                    setVal(getCartQuantity())
                    setOrderPlaced(true);
                } else {
                    console.log('Error saving order to database');
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };


    function getCartQuantity(){
        let q = 0;
        let cart = JSON.parse(sessionStorage.getItem('cart'));
        if(cart!=null)for(var i=0; i<cart.length; i++) q+= cart[i].quantity;
        setCartQuantity(q)
        console.log(cartQuantity)
        return q;
      }

      

    return (
        <div className='Cart'>
            <h4>Warenkorb</h4>                
            <div className='table_wrap'>
            {cart.length === 0 ? (
                <p>Dein Warenkorb ist leer.</p>
            ) : (
                    <table>
                        <tbody>
                            {cart.map((cartItem) => (
                                <tr key={cartItem.item_id} className="cart_first_border">
                                    <td className="cart_name">
                                        <div className="cart_name_title">{cartItem.item_name}</div>
                                        <div className="cart_name_size">{cartItem.item_size}</div>
                                    </td>
                                    <td className="cart_quantity">
                                        <button className="cart_pm" onClick={() => handleQuantityChange(cartItem, cartItem.quantity - 1)}>-</button>
                                        <div className="cart_quantity_num">{cartItem.quantity}</div>
                                        <button className="cart_pm" onClick={() => handleQuantityChange(cartItem, cartItem.quantity + 1)}>+</button>
                                    </td>
                                    <td>
                                        <button className="cart_btn_del" onClick={() => handleRemoveItem(cartItem)}>&#10005;</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
          )}
        {cartQuantity > 0 && (<div className="cart_summary">
            <p>Bestellen</p>
            <input className="cart_room" placeholder="Raum" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
            <button className="cart_postBtn" disabled={!orderPlaced} onClick={handlePlaceOrder}>Bestellen</button>
        </div>)}
            </div>
        </div>
    );
}

export default Cart;