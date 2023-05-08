// import React, {useEffect, useState} from 'react'

// function Sidebar() {
    

//     return(
//         <div className='sidebar'>
//             <div className='logo'>
//                 <p id='logo' className='logo_text'>HAK</p>
//             </div>
//         </div>
//     )
// }

// export default Sidebar;
import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom"
import home from "./icons/home.svg";
import cart from "./icons/cart.svg";
import order from "./icons/order.svg";
import chat from "./icons/chat.svg";
import product from "./icons/product.svg";
import logout from "./icons/logout.svg";
import './Sidebar.css';




function Sidebar({ setActiveTab }) {
  const [activeTab, setActive] = useState("Shop");
  const navigate = useNavigate();

  const handleClick = (tab) => {
    if (tab === "Logout") {
        sessionStorage.removeItem("jwt"); // remove the JWT from session storage
        setActive("Shop"); // set the active tab back to "Shop"
        setActiveTab("Shop"); // update the active tab in the parent component
        navigate("/login")    
    } else {
        setActive(tab);
        setActiveTab(tab);
      }
  };

  return (
    <div className="sidebar">
    <div className='logo'><p id='logo' className='logo_text'>HAK</p></div>
        <div
            className={activeTab === "Shop" ? "active-tab" : ""}
            onClick={() => handleClick("Shop")}
        >
            <img src={home} alt="svg"/>
            <p>Shop</p>
        </div>
        <div
            className={activeTab === "Cart" ? "active-tab" : ""}
            onClick={() => handleClick("Cart")}
        >
            <img src={cart} alt="svg"/>
            <p>Warenkorb</p>
        </div>
        <div
            className={activeTab === "Order" ? "active-tab" : ""}
            onClick={() => handleClick("Order")}
        >
            <img src={order} alt="svg"/>
            <p>Bestellungen</p>
        </div>
        <div
            className={activeTab === "Chat" ? "active-tab" : ""}
            onClick={() => handleClick("Chat")}
        >
           <img src={chat} alt="svg"/>
            <p>Nachrichten</p>
        </div>
        <div
            className={activeTab === "Product" ? "active-tab" : ""}
            onClick={() => handleClick("Product")}
        >
            <img src={product} alt="svg"/>
            <p>Bearbeiten</p>
        </div>

        <div
            className={activeTab === "Logout" ? "active-tab" : ""}
            onClick={() => handleClick("Logout")}
        >
            <img src={logout} alt="svg"/>
            <p>Ausloggen</p>
        </div>
    </div>
  );
}

export default Sidebar;
