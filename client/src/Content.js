import React from "react";
import './CSS/Content.css';
import Edit from './edit';
import Shop from './shop';
import Cart from './cart';
import Order from "./order";
import Chat from "./chat";
import Userdata from "./Userdata";
import { useEffect, useState } from 'react';


function Content({ activeTab, updateCartVal }) {

  const setVal = (value) => {
    updateCartVal(value);
    console.log("Parent:"+value)
  };


  const getContent = () => {
    switch (activeTab) {
      case "Shop":
        return <div className="wrapper"><Shop setVal={setVal}/></div>;
      case "Cart":
        return <div className="wrapper"><Cart setVal={setVal}/></div>;
      case "Order":
        return <div className="wrapper"><Order/></div>;
      case "Chat":
        return <div className="wrapper"><Chat/></div>;
      case "Product":
        return <div className="wrapper"><Edit/></div>;
      case "Userdata":
        return <div className="wrapper"><Userdata/></div>;
      case "Logout":
        return <div>Log Out!</div>;
      default:
        return null;
    }
  };

  return <div className="content">{getContent()}</div>;
}

export default Content;
