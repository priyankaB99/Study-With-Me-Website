import React, {Component} from 'react';
import './login.css';
import axios from "axios";

class LogRegBox extends Component {
    constructor (props){
      super(props); //call the super function because this is being imbedded into a parent component 
      this.requestLogin = this.requestLogin.bind(this);
      this.requestRegister = this.requestRegister.bind(this);
    }
  
    //hide or show login/register boxes
    changeToReg = event => {
        document.getElementById('loginbox').style.display = 'none';
        document.getElementById('regbox').style.display = 'block';
      };
    changeToLogin = event => {
        document.getElementById('loginbox').style.display = 'block';
        document.getElementById('regbox').style.display = 'none';
      };

//send to backend when user registers
    async requestRegister(event) {
        event.preventDefault();
        const data = new FormData(event.target); //make form object to get items
        const userInfo = {
            username: data.get('username'),
            password: data.get('password')
        };
        console.log("got to here")
        try { //sent register info to backend
            const response = await axios.post('/api/users/register', userInfo);
            //send to parent in callback function
            this.props.loggedUserCallback(response.data, response.headers.authtoken);
          } catch (error) {
            console.error("Error! ", error);
        }
    }

//send to backend when user logs in
    async requestLogin(event) {
        event.preventDefault();
        const data = new FormData(event.target); //make form object to get items
        const userInfo = {
            username: data.get('username'),
            password: data.get('password')
        };
        
        try { //sent register info to backend
            const response = await axios.post('/api/users/login', userInfo);
            //send to parent in callback function
            this.props.loggedUserCallback(response.data, response.headers.authtoken);
          } catch (error) {
            console.error("Error! ", error);
        }
    }

    render() {
        return (
            <div>
                <div id='loginbox'>
                    <h2>Login Here</h2>
                    <form onSubmit={this.requestLogin}>
                        <div>
                            Username: <input type="text" id="username" name="username"
                            required></input>
                        </div><br></br>
                        <div>
                            Password: <input type="password" id="password" name="password"
                            required></input>
                        </div><br></br>
                        <button type="submit">Log In</button>
                    </form><br></br>
                    Not yet Registered? <button onClick={this.changeToReg}> Sign Up Here </button>
                </div>

                <div id='regbox'>
                <h2>Register Here</h2>
                <form onSubmit={this.requestRegister}>
                    <div>
                        Username: <input type="text" id="username" name="username"
                        required></input>
                    </div><br></br>
                    <div>
                        Password: <input type="password" id="password" name="password"
                        required></input>
                    </div><br></br>
                    <button type="submit">Register</button>
                </form><br></br>
                <button onClick={this.changeToLogin}> Login Here </button>
                </div>
            </div>
        );
    }
  }
     
  export default LogRegBox;
  