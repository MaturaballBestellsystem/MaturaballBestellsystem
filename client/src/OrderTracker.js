import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Content from "./Content";
import PwaNotification from "./pwaNotification";
import {useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

function OrderTracker() {
  const [activeTab, setActiveTab] = useState("Shop");
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [cartVal, setCartVal] = useState(getCartQuantity());
  const [pwa, setPWA] = useState(false);
  const [manufacturer, setManufacturer] = useState("");

  //Navigate back to Login if user is not authorized
  useEffect(() => {
    if (!Cookies.get('jwt')) {
      navigate('/login');
    }
  }, []);
  
  const updateCartVal = (cartVal) => {
    setCartVal(cartVal);
    console.log("Grandparent:"+cartVal)
  };

  const updatePwa = () => {
    setPWA(true);
  };

  useEffect(() => {
    var width = window.screen.width;
    var useragent = navigator.userAgent;
    if(width > 756){      
      setPWA(true)
      return;
    } 
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setPWA(true);
    } else{
      if(useragent.includes("iPhone")||useragent.includes("iPod")||useragent.includes("iPad")){
        setManufacturer("IOS");
      } else if(useragent.includes("Android")){
        setManufacturer("Android");
      }
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
    { !pwa && manufacturer==="IOS" && <PwaNotification manufacturer={manufacturer} updatePwa={updatePwa}/>} 
    { !pwa && manufacturer==="Android" && <PwaNotification manufacturer={manufacturer} updatePwa={updatePwa}/>} 

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