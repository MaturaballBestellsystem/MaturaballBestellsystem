import React, { useState } from "react";
import { Link, useNavigate} from 'react-router-dom';
import user from "./icons/user.svg";
import logo from "./icons/logo_banner.png";
import LoadingSpinner from './spinner';
import './CSS/LoginRegister.css';
import Cookies from 'js-cookie';

const Login = ({ onChange, em, pw, msg }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const settings = require("./PROJECT_CONFIG.json");

  const postLogin = (e) => {
    setIsLoading(true)
    e.preventDefault();
    try{
      fetch("http://localhost:3001/login", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        em: em,
        pw: pw
      })
    })
      .then((res) => res.json())
      .then((json) => {
        console.log("successful login");
        // sessionStorage.setItem('jwt', json.jwt);
        // sessionStorage.setItem('user_nm',json.msg);
        Cookies.set('jwt', json.jwt, { expires: settings.login_duation, path: '/' });
        Cookies.set('user_nm', json.msg, { expires: settings.login_duation, path: '/' });
        console.log(json.msg)
        if(json.jwt === ''){
          document.getElementById('message').innerHTML = "Falsche Email Adresse oder Passwort";
          setIsLoading(false)
        } 
        else {
          if(em === "admin"){
            Cookies.set('user_mail', em, { expires: settings.login_duation, path: '/' });
            // sessionStorage.setItem('user_mail', em);
          }
          navigate('/ordertracker');
        }
      })} catch(error){console.log(error)} 
  }

  return (
    <div className='login'>
      <div className='form'>
        <img className="form_img"src={user} alt=""></img>
        <h4>In Account einloggen</h4>
        <form>
          <div className='input'>
            <p>Email Adresse</p>
            <input
              type="email"
              name="em"
              id="mail"
              value={em}
              onChange={onChange}
            />
          </div>
          <div className='input'>
            <p>Passwort</p>
            <input
              type="password"
              name="pw"
              value={pw}
              onChange={onChange}
            />
          </div>
          {isLoading ? 
            <LoadingSpinner/> : 
            <button className='btn_primary' onClick={postLogin}>Einloggen</button>
          }
          <div className='message' id="message"></div>
          <div className='btn_secondary'>Noch nicht registriert? <Link to="/signup">Registriere dich jetzt</Link></div>
          <img className="logo_banner" src={logo} alt=""></img>
        </form>
        {/* <p>SERVER RESPONSE MESSAGE: {msg}</p> */}
      </div>
    </div>
  );
}

export default Login;