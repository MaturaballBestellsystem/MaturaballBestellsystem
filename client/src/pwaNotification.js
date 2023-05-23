import React from 'react';
import './CSS/pwaNotification.css';
import share from "./icons/share.svg";
import logo from "./icons/logo.png";
import dots from "./icons/dots.svg";



const PWAnotification = ({ manufacturer, updatePwa }) => {
  
    if(manufacturer == "IOS"){
        return (
            <div className='pwa'>
                <img className='logo_pwa' src={logo} alt='logo'></img>
                <h5>App installieren</h5>
                <p>Klicke <img src={share} className="shareIos" alt="symbol"></img> dann "Zum Home-Bildschirm"</p>
                <button onClick={updatePwa}>Später</button>
            </div>
        );
    } else if(manufacturer == "Android"){
        return (
            <div className='pwa'>
                 <img className='logo_pwa' src={logo} alt='logo'></img>
                <h5>App installieren</h5>
                <p>Klicke <img src={dots} className="shareAndroid" alt="symbol"></img> dann "Zum Startbildschirm hinzufügen"</p>
                <button onClick={updatePwa}>Später</button>
            </div>
        );
    }

    return(<div></div>);

}

export default PWAnotification;