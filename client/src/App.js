import React, { Component } from 'react';
import logo from './studyicon.svg';
import './App.css';
import LogRegBox from './components/loginreg/login';
import HomePage from './components/home/homePage';

class App extends Component {
  constructor (){
    super(); //call the super function because this is being imbedded into a parent component
    this.loggedUserCallback = this.loggedUserCallback.bind(this); 
    this.deletedAcctCallback = this.deletedAcctCallback.bind(this);
    this.logoutCallback = this.logoutCallback.bind(this);
    this.state = {
      authToken: "",
      isLoggedIn: false,
      loggedUser: "",
      siteDisplay: "loginPage"
    }
  }

  //call back from when a user logs in, state is set accordingly
  async loggedUserCallback(userData, authtoken) {
    if (userData.type === "error"){
      alert(userData.message)
      this.setState ({
        siteDisplay: "loginPage"
      });
    }
    else {
      this.setState ({
        authToken: authtoken,
        isLoggedIn: true,
        loggedUser: userData.message.username,
        siteDisplay: "homePage"
      });
    }  
  }

  //send back to login page once the user has deleted their account
  async deletedAcctCallback(response) {
      if (response.type === "error"){
        alert(response.message)
      }
      else {
        this.setState ({
        authToken: "",
        isLoggedIn: false,
        loggedUser: "",
        siteDisplay: "loginPage"
      });
    }
  }

  async logoutCallback() {
    this.setState ({
      authToken: "",
      isLoggedIn: false,
      loggedUser: "",
      siteDisplay: "loginPage"
    });
  }

  render() {
    if (this.state.siteDisplay === "loginPage"){
        return (  
          <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h1 className="App-title">Study With Me</h1>
            </header>
            <div className='logregboxes'>
              <LogRegBox loggedUserCallback={this.loggedUserCallback}/>
            </div>
          </div>
        );
      }
    else if (this.state.siteDisplay === "homePage") {
      return (
          <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h1 className="App-title">Study With Me</h1>
            </header>
            <div className='homepage'>
              <HomePage userInfo={this.state} logoutCallback={this.logoutCallback} deletedAcctCallback={this.deletedAcctCallback}/>
            </div>
          </div>
      );
    }
  }
}

export default App;
