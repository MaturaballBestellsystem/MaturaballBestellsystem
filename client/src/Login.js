import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import user from "./icons/user.svg";
import './LoginRegister.css';

const Login = ({ onChange, em, pw, msg }) => {
  const navigate = useNavigate();

  const postLogin = (e) => {
    e.preventDefault();
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
        sessionStorage.setItem('jwt', json.jwt)
        if(json.jwt == '') document.getElementById('message').innerHTML = "Falsche Email Adresse oder Passwort";
        else navigate('/ordertracker');
      })
  }

  return (
    <div className='login'>
      <div className='form'>
        <img src={user}></img>
        <h4>In Account einloggen</h4>
        <form>
          <div className='input'>
            <p>Email Adresse</p>
            <input
              type="email"
              name="em"
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
          <button className='btn_primary' onClick={postLogin}>Einloggen</button>
          <div className='message' id="message"></div>
          <div className='btn_secondary'>Noch nicht registriert? <Link to="/signup">Registriere dich jetzt</Link></div>
        </form>
        {/* <p>SERVER RESPONSE MESSAGE: {msg}</p> */}
      </div>
    </div>
  );
}

export default Login;