import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import user from "./icons/user.svg";
import logo from "./icons/logo_banner.png";

import './CSS/LoginRegister.css';
import {useNavigate } from "react-router-dom";


const Signup = ({onChange, em, pw, msg }) => {

const  postSignup = () => {
   //console.log(this.state.em, this.state.pw);
   var pw = document.getElementById("pw").value;
   var em = document.getElementById("mail").value;
   var nm = document.getElementById("name").value;


   fetch("http://localhost:3001/signup", {
      method: "POST",
      headers: {
         "accept": "application/json",
         "content-type": "application/json"
      },
      body: JSON.stringify({
         em: em,
         pw: pw,
         nm: nm
      })
   })
}

const [registeredEmails, setRegisteredEmails] = useState([]);

useEffect(() => {
   fetch("http://localhost:3001/users")
   .then((res) => res.json())
   .then((data) => {
      setRegisteredEmails(data.map((user) => user.user_em));
      console.log(registeredEmails);
   })
   .catch((err) => console.log(err));
}, []);

const navigate = useNavigate();

const submitForm = (e) =>{
   e.preventDefault();
   var pass1 = pw;
   var pass2 = document.getElementById("pw2").value;      
   var num = /\d/;
   var specialCharacters = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

   if (pass1 !== pass2) {
      document.getElementById("pw").value = "";
      document.getElementById("pw2").value = "";
      document.getElementById("message").innerHTML = "Passwords don't match";
   } else if(pw.length < 6){
         document.getElementById("pw").value = "";
         document.getElementById("pw2").value = "";
         document.getElementById("message").innerHTML = "Das Passwort muss mindestens 6 Zeichen lang sein, ein Sonderzeichen und eine Zahl enthalten";
      }  else if(!num.test(pw)){
            document.getElementById("pw").value = "";
            document.getElementById("pw2").value = "";
            document.getElementById("message").innerHTML = "Das Passwort muss mindestens 6 Zeichen lang sein, ein Sonderzeichen und eine Zahl enthalten";
         }  else if(!specialCharacters.test(pw)){
               document.getElementById("pw").value = "";
               document.getElementById("pw2").value = "";
               document.getElementById("message").innerHTML = "Das Passwort muss mindestens 6 Zeichen lang sein, ein Sonderzeichen und eine Zahl enthalten";
            } else if (registeredEmails.includes(em)) {      
                  document.getElementById("mail").value = "";
                  document.getElementById("pw").value = "";
                  document.getElementById("pw2").value = "";
                  document.getElementById("message").innerHTML ="Dieser Account existiert bereits";
            }   else {
                  console.log("signup correct");
                  postSignup();
                  navigate('/login');         
                  }
}

   return (
      <div className='register'>
         <div className='form'>
            <img className="form_img" src={user} alt=""></img>
            <h4>Registrieren</h4>
            <form onSubmit={(e) => submitForm(e)}>
            <div className='input'>
                  <p>Vor- und Nachname</p>
                  <input
                     type="text"
                     name="nm"
                     id="name"
                     onChange={onChange}
                  />
               </div>              
             <div className='input'>
                  <p>Email Adresse</p>
                  <input
                     type="email"
                     name="em"
                     id="mail"
                     onChange={onChange}
                  />
               </div>
               <div className='input'>
                  <p>Passwort</p>
                  <input
                     type="password"
                     name="pw"
                     id="pw"
                     onChange={onChange}
                  />
               </div>

               <div className='input'>
                  <p>Passwort wiederholen</p>
                  <input
                     type="password"
                     name="pw2"
                     id="pw2"
                     onChange={onChange}
                  />
               </div>

               <div className='message' id="message"></div>

               <button type="submit" className='btn_primary'>Registrieren</button>

               <div className='btn_secondary'>Bereits registriert? <Link to="/login">Weiter zum Login</Link></div>
               <img className="logo_banner" src={logo} alt=""></img>

            </form>

            {/* <p>SERVER RESPONSE MESSAGE: {msg}</p> */}

         </div>
      </div>
   );
}

export default Signup;