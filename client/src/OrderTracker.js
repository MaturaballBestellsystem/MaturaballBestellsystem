import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Content from "./Content";
import { Navigate, useNavigate } from "react-router-dom";

function OrderTracker() {
  const [activeTab, setActiveTab] = useState("Shop");
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionStorage.getItem('jwt')) {
      navigate('/login');
    }
  }, []);

  return (
    <div className="OrderTracker">
      <Sidebar setActiveTab={setActiveTab} />
      <Content activeTab={activeTab} />
    </div>
  );
}

export default OrderTracker;

  // const navigate = useNavigate();
  // const authenticated = sessionStorage.getItem('jwt');
  // console.log(authenticated);
  // if(!authenticated) navigate('/login');
