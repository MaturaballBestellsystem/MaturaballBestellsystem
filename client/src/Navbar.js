import React, { useState } from "react";
import {useNavigate } from "react-router-dom"
import home from "./icons/home.svg";
import home_m from "./icons/home_mobile_full.svg";

import cart from "./icons/cart.svg";
import cart_m from "./icons/cart_mobile_full.svg";

import order from "./icons/order.svg";
import order_m from "./icons/order_mobile_full.svg";

import chat from "./icons/chat.svg";
import chat_m from "./icons/chat_mobile_full.svg";

import './CSS/Navbar.css';
import Cookies from 'js-cookie';


function Navbar({ setActiveTab, cartVal }) {
  const [activeTab, setActive] = useState("Shop");
  const navigate = useNavigate();

  const handleClick = (tab) => {
    if (tab === "Logout") {
      Cookies.remove("jwt"); // remove the JWT from session storage
      Cookies.remove("user_mail");
      setActive("Shop"); // set the active tab back to "Shop"
      setActiveTab("Shop"); // update the active tab in the parent component
      navigate("/login");
    } else {
      setActive(tab);
      setActiveTab(tab);
    }
  };

  return (
    <div className="navbar" id={activeTab === "Chat" ? "navbar_chat" : ""}>
      <div
        className={activeTab === "Shop" ? "active-tab" : "inactive"}
        onClick={() => handleClick("Shop")}
      >
        <img src={activeTab === "Shop" ? home_m : home} alt="svg"/>
        <p>Shop</p>
      </div>
      <div
        id="cartTab" className={activeTab === "Cart" ? "active-tab" : "inactive"}
        onClick={() => handleClick("Cart")}
      >
        <img src={activeTab === "Cart" ? cart_m : cart} alt="svg"/>
        <p>Warenkorb</p>
        {cartVal > 0 && <div className="cartBadge">{cartVal}</div>}
      </div>
      <div
        className={activeTab === "Order" ? "active-tab" : "inactive"}
        onClick={() => handleClick("Order")}
      >
        <img src={activeTab === "Order" ? order_m : order} alt="svg"/>
        <p>Bestellungen</p>
      </div>
      <div
        className={activeTab === "Chat" ? "active-tab" : "inactive"}
        onClick={() => handleClick("Chat")}
      >
        <img src={activeTab === "Chat" ? chat_m : chat} alt="svg"/>
        <p>Chat</p>
      </div>
    </div>
  );
}

export default Navbar;

