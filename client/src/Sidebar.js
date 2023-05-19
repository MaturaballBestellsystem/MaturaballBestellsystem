import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import home from "./icons/home.svg";
import cart from "./icons/cart.svg";
import order from "./icons/order.svg";
import chat from "./icons/chat.svg";
import product from "./icons/product.svg";
import logout from "./icons/logout.svg";
import users from "./icons/users.svg";
import './CSS/Sidebar.css';
import Cookies from 'js-cookie';

function Sidebar({ setActiveTab, cartVal }) {
  const settings = require("./PROJECT_CONFIG.json");
  const [activeTab, setActive] = useState("Shop");
  const navigate = useNavigate();
  const isAdmin = Cookies.get('user_mail') === "admin" ? true : false;

  const handleClick = (tab) => {
    if (tab === "Logout") {
      Cookies.remove('jwt', { path: '/' });
      Cookies.remove('user_mail', { path: '/' });

      setActive("Shop"); // set the active tab back to "Shop"
      setActiveTab("Shop"); // update the active tab in the parent component
      navigate("/login");
    } else {
      setActive(tab);
      setActiveTab(tab);
    }
  };

  return (
    <div className="sidebar">
      <div className='logo'>
        <p id='logo' className='logo_text'>{settings.logo_text}</p>
      </div>
      {settings.user_rights.shop || isAdmin ? (
        <div
          className={activeTab === "Shop" ? "activetab" : ""}
          onClick={() => handleClick("Shop")}
        >
          <img src={home} alt="svg" />
          <p>Shop</p>
        </div>
      ) : null}
      {settings.user_rights.cart || isAdmin ? (
        <div
          className={activeTab === "Cart" ? "activetab" : ""}
          onClick={() => handleClick("Cart")}
        >
          <img src={cart} alt="svg" />
          <p>Warenkorb</p>
          {cartVal > 0 && <div className="badge">{cartVal}</div>}
        </div>
      ) : null}
      {settings.user_rights.orders || isAdmin ? (
        <div
          className={activeTab === "Order" ? "activetab" : ""}
          onClick={() => handleClick("Order")}
        >
          <img src={order} alt="svg" />
          <p>Bestellungen</p>
        </div>
      ) : null}
      {settings.user_rights.chat || isAdmin ? (
        <div
          className={activeTab === "Chat" ? "activetab" : ""}
          onClick={() => handleClick("Chat")}
        >
          <img src={chat} alt="svg" />
          <p>Chat</p>
        </div>
      ) : null}
      {settings.user_rights.products || isAdmin ? (
        <div
          className={activeTab === "Product" ? "activetab" : ""}
          onClick={() => handleClick("Product")}
        >
          <img src={product} alt="svg" />
          <p>Produkte</p>
        </div>
      ) : null}
      {isAdmin && (
        <div
          className={activeTab === "Userdata" ? "activetab" : ""}
          onClick={() => handleClick("Userdata")}
        >
          <img src={users} alt="svg" />
          <p>Benutzerdaten</p>
        </div>
      )}
      <div
        className={activeTab === "Logout" ? "activetab" : ""}
        onClick={() => handleClick("Logout")}
      >
        <img src={logout} alt="svg" />
        <p>Abmelden</p>
      </div>
    </div>
  );
}

export default Sidebar;