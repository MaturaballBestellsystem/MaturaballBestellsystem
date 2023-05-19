import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Content from "./Content";
import {useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

function OrderTracker() {
  const [activeTab, setActiveTab] = useState("Shop");
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [cartVal, setCartVal] = useState(getCartQuantity());
  
  const updateCartVal = (cartVal) => {
    setCartVal(cartVal);
    console.log("Grandparent:"+cartVal)
  };


  useEffect(() => {
    // if (!sessionStorage.getItem('jwt')) {
    if (!Cookies.get('jwt')) {
      navigate('/login');
    }
  }, []);

  function getCartQuantity(){
    let q = 0;
    let cart = JSON.parse(sessionStorage.getItem('cart'));
    if(cart!=null)for(var i=0; i<cart.length; i++) q+= cart[i].quantity;
    return q;
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 756);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="OrderTracker">      
    <Content activeTab={activeTab} updateCartVal={updateCartVal}/>
      {isMobile ? (
        <Navbar setActiveTab={setActiveTab} cartVal={cartVal}/>
      ) : (
        <Sidebar setActiveTab={setActiveTab} cartVal={cartVal} />
      )}
    </div>
  );
}

export default OrderTracker;