import React from "react";
import './Content.css';


function Content({ activeTab }) {
  const getContent = () => {
    switch (activeTab) {
      case "Shop":
        return <div>Shop content</div>;
      case "Cart":
        return <div>Cart content</div>;
      case "Order":
        return <div>Order content</div>;
      case "Chat":
        return <div>Chat content</div>;
      case "Product":
        return <div>Product content</div>;
      case "Logout":
        return <div>Log Out!</div>;
      default:
        return null;
    }
  };

  return <div className="content">{getContent()}</div>;
}

export default Content;
