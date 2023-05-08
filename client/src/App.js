import React, { Component } from 'react';
import './App.css';
import OrderTracker from './OrderTracker';
import Login from "./Login";
import Signup from "./Signup";
import { Routes, Route, useNavigate } from "react-router-dom";

class App extends Component {
   state = {
      em: '',
      pw: '',
      msg: '',
      jwt: sessionStorage.getItem('jwt') || ''
   }

   render() {
      // if (this.state.jwt) {
      //    return <OrderTracker jwt={this.state.jwt} />;
      // }

      return (
         <div className="App">
            <Routes>
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

//    postLogin = (e) => {
//       e.preventDefault();
//       fetch("http://localhost:3001/login", {
//          method: "POST",
//          headers: {
//             "accept": "application/json",
//             "content-type": "application/json"
//          },
//          body: JSON.stringify({
//             em: this.state.em,
//             pw: this.state.pw
//          })
//       })
//          .then((res) => res.json())
//          .then((json) => {
//             this.setState({
//                em: '',
//                pw: '',
//                msg: json.msg,
//                jwt: json.jwt
//             })
//             sessionStorage.setItem('jwt', json.jwt);
//             const navigate = useNavigate();
//             navigate('/ordertracker');         
//          })
//    }

//    postSignup = () => {
//       console.log(this.state.em, this.state.pw);
//       fetch("http://localhost:3001/signup", {
//          method: "POST",
//          headers: {
//             "accept": "application/json",
//             "content-type": "application/json"
//          },
//          body: JSON.stringify({
//             em: this.state.em,
//             pw: this.state.pw
//          })
//       })
//    }

}

export default App;


// import React, { Component } from 'react';
// import './App.css';
// import OrderTracker from './OrderTracker';
// import Login from "./Login";
// import Signup from "./Signup";
// import { Routes, Route, useNavigate } from "react-router-dom";

// class App extends Component {
//    state = {
//       em: '',
//       pw: '',
//       msg: '',
//       jwt: sessionStorage.getItem('jwt') || ''
//    }

//    render() {
//       if (this.state.jwt) {
//          return <OrderTracker jwt={this.state.jwt} />;
//       }

//       return (
//          <div className="App">
//             <Routes>
//               <Route path="/ordertracker" element={ <OrderTracker/> } />
//               <Route path="/login" element={<Login postLogin={this.postLogin} onChange={this.onChange} em={this.state.em} pw={this.state.pw} msg={this.state.msg} history={this.props.history} />} />
//               <Route path="/signup" element={ <Signup postSignup={this.postSignup} onChange={this.onChange} em={this.state.em} pw={this.state.pw} msg={this.state.msg} /> } />
//             </Routes>
//          </div>
//       );
//    }

//    onChange = (e) => {
//       this.setState({ [e.target.name]: e.target.value })
//    }

//    postLogin = (e) => {
//       e.preventDefault();
//       fetch("http://localhost:3001/login", {
//          method: "POST",
//          headers: {
//             "accept": "application/json",
//             "content-type": "application/json"
//          },
//          body: JSON.stringify({
//             em: this.state.em,
//             pw: this.state.pw
//          })
//       })
//          .then((res) => res.json())
//          .then((json) => {
//             this.setState({
//                em: '',
//                pw: '',
//                msg: json.msg,
//                jwt: json.jwt
//             })
//             sessionStorage.setItem('jwt', json.jwt);
//             const navigate = useNavigate();
//             navigate('/ordertracker');         
//          })
//    }

//    postSignup = () => {
//       console.log(this.state.em, this.state.pw);
//       fetch("http://localhost:3001/signup", {
//          method: "POST",
//          headers: {
//             "accept": "application/json",
//             "content-type": "application/json"
//          },
//          body: JSON.stringify({
//             em: this.state.em,
//             pw: this.state.pw
//          })
//       })
//    }

// }

// export default App;