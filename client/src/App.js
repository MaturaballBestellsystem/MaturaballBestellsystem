import React, { Component } from 'react';
import './CSS/App.css';
import OrderTracker from './OrderTracker';
import Login from "./Login";
import Signup from "./Signup";
import { Routes, Route } from "react-router-dom";
import Cookies from 'js-cookie';

class App extends Component {

   state = {
      em: '',
      pw: '',
      msg: '',
      jwt: Cookies.get('jwt') || ''
   }

   render() {
      return (
         <div className="App">
            <Routes>
               <Route path="/" element={ <OrderTracker/> } />
              <Route path="/ordertracker" element={ <OrderTracker/> } />
              <Route path="/login" element={<Login postLogin={this.postLogin} onChange={this.onChange} em={this.state.em} pw={this.state.pw} msg={this.state.msg} history={this.props.history} />} />
              <Route path="/signup" element={ <Signup postSignup={this.postSignup} onChange={this.onChange} em={this.state.em} pw={this.state.pw} msg={this.state.msg} /> } />
            </Routes>
         </div>
      );
   }

   onChange = (e) => {
      this.setState({ [e.target.name]: e.target.value })
   }
}

export default App;