import React, { useState, useEffect } from 'react';
import {useNavigate } from 'react-router-dom';
import userpic from "./icons/user.svg"
import trash from "./icons/trash.svg"
import "./CSS/userdata.css"
import Cookies from 'js-cookie';


const Userdata = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [passwords, setPasswords] = useState({});
  const navigate = useNavigate();

  // Check admin rights
  useEffect(() => {
    console.log(Cookies.get('user_mail'));
    if (Cookies.get('user_mail') !== 'admin') navigate('/ordertracker');
  }, []);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:3001/userdata`)
      .then((res) => res.json())
      .then((json) => {
        console.log(json);
        setUsers(json);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleDelete = (userId) => {
    setSelectedUsers((selectedUsers) => [...selectedUsers, userId]);
  };

  const handleSaveChanges = () => {
    fetch(`http://${window.location.hostname}:3001/api/deleteuser`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ids: selectedUsers,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // Update the user list after successful deletion
        return fetch(`http://${window.location.hostname}:3001/userdata`);
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data);
        setSelectedUsers([]);
      })
      .catch((error) => console.error('Error:', error));
  };

  const handleChangePassword = (userId) => {
    const password = passwords[userId];
    fetch("http://"+window.location.hostname+":3001/api/changepassword", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        id: userId,
        pw: password 
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error');
      }
      console.log("success")
      // Update the user list after successful password change
      return fetch("http://"+window.location.hostname+":3001/userdata");
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error');
      }
      return response.json();
    })
    .then(data => setUsers(data))
    .catch(error => console.error('Error:', error));
  };

  const handlePasswordChange = (userId, password) => {
    setPasswords(passwords => ({ ...passwords, [userId]: password }));
  };

  return (
    <div className='userdata'>
      <h4>Benutzerdaten</h4>
          {users.map(user => (
            selectedUsers.includes(user.user_id) ? null :
            <div className="userdata_card" key={user.user_id} data-id={user.user_id}>
              <div className="userdata_card_wrap">
              <div className="userdata_card_pic"><img src={userpic} alt=""></img></div>
              <div className="userdata_card_details">
                <div className="userdata_card_name">{user.user_nm}</div>
                <div className="userdata_card_mail">{user.user_em}</div>
              </div>
              <div className="userdata_card_password"><input type='text' placeholder="neues Passwort" onChange={(e) => handlePasswordChange(user.user_id, e.target.value)} /></div>
              <div className="userdata_card_buttons">
                <button onClick={() => handleChangePassword(user.user_id)}>Speichern</button>
                <button onClick={() => handleDelete(user.user_id)}><img src={trash} alt=""></img></button>
              </div>
              </div>
            </div>
          ))}

      {selectedUsers.length > 0 && (
        <div className="userdata_card_buttons">
          <button onClick={handleSaveChanges}>Speichern</button>
        </div>
      )}
    </div>
  );
};

export default Userdata;