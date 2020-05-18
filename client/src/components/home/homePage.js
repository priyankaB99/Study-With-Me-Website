import React, {Component} from 'react';
import axios from "axios";
import './homePage.css';
import CurrentChannel from '../channel/currentChannel';
import $ from 'jquery';

class HomePage extends Component {
  constructor (props){
    super(props); //call the super function because this is being imbedded into a parent component 
    this.displayUserChannels = this.displayUserChannels.bind(this);
    this.displayPublicChannels = this.displayPublicChannels.bind(this);
    this.displayDeadlines = this.displayDeadlines.bind(this);
    this.deleteAcct = this.deleteAcct.bind(this);
    this.logout = this.logout.bind(this);
    this.createChannel = this.createChannel.bind(this);
    this.deleteChannel = this.deleteChannel.bind(this);
    this.requestGoToChannel = this.requestGoToChannel.bind(this);
    this.requestGoToChannelByInvite = this.requestGoToChannelByInvite.bind(this);
    this.addFriend = this.addFriend.bind(this);
    this.removeFriend = this.removeFriend.bind(this);
    this.displayFriends = this.displayFriends.bind(this);
    this.displayInvitations = this.displayInvitations.bind(this);
    this.friendModal = this.friendModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.inviteToCurrChannel = this.inviteToCurrChannel.bind(this);
    this.requestGoToHome = this.requestGoToHome.bind(this);
    this.addSP = this.addSP.bind(this);
    this.displayStudyPlans = this.displayStudyPlans.bind(this);
    this.state = {
      authToken: props.userInfo.authToken,
      isLoggedIn: props.userInfo.isLoggedIn,
      loggedUser: props.userInfo.loggedUser,
      currChannel: "",
      clickedOnFriend: ""
    }
  }

//Lifecyle method: runs automatically when the component is mounted
  componentDidMount() {
    this.loading(true).then(() => //shows loading message while components are loaded
        this.displayUserChannels(),
        this.displayPublicChannels(),
        this.displayFriends(),
        this.displayInvitations(),
        this.displayDeadlines(),
        this.displayStudyPlans(),
    ).then(() =>
        this.loading(false)
    )
  };

  async loading(yes) {
    if (yes) {
        document.getElementById('loading').style.display = 'block'; 
    }
    else {
       document.getElementById('loading').style.display = 'none'; 
    }  
}
  
//display the user's channels 
  async displayUserChannels() {
    try { //send info to backend
      const response = await axios.post('/api/users/displayUserChannels', this.state);   
      document.getElementById("myChannels").innerHTML = "";
      //loop through userChannels array and print each channel name
      const user_channels = response.data.userChannels;
      for (let i = 0; i < user_channels.length; i++){
        let channelNode = document.createElement("div");
        channelNode.classList.add("channeldiv");
        channelNode.appendChild(document.createTextNode(user_channels[i].channelName));
        document.getElementById("myChannels").appendChild(channelNode);
        //If channel is clicked on, go to channel
        channelNode.addEventListener("click", this.requestGoToChannel.bind(null, user_channels[i]), false);
      }
    } catch (error) {
      console.error("Error! ", error);
    }
  }

//display public channels
async displayPublicChannels() {
    try { //send info to backend
      const response = await axios.post('/api/users/displayPublicChannels', this.state);  
      //Get ready to print channels
      document.getElementById("publicChannels").innerHTML = ""
      //loop through publicChannels array and print each channel name
      const public_channels = response.data.publicChannels;
      for (let i = 0; i < public_channels.length; i++){
        if (!((public_channels[i].kickedOutUsers).includes(this.state.loggedUser))) { //if user does not exist in the channel's kickedOutUsers array, then display the channel
          let channelNode = document.createElement("div");
          channelNode.classList.add("channeldiv");
          channelNode.appendChild(document.createTextNode(public_channels[i].channelName));
          document.getElementById("publicChannels").appendChild(channelNode);
          //If channel is clicked on, go to channel
          channelNode.addEventListener("click", this.requestGoToChannel.bind(null, public_channels[i]), false);
        }
      }
    } catch (error) {
      console.error("Error! ", error);
    }
}

//if user click go back to home button, resets state to home and rerenders
async requestGoToHome() {
    this.setState ({
      currChannel: ''
    });
    this.setState ({
      currChannel: ''
    });
    this.componentDidMount();
  }

//resets state when user clicks on a channel to go to it
  async requestGoToChannel(channel) {
    if (this.state.currChannel === '') { //get rid of home-specific elements
      document.getElementById("deadlinesHome").innerHTML = "";
      document.getElementsByClassName("channelButtonsHome")[0].innerHTML = "";
    }
    this.setState ({
      currChannel: ""
    });
    this.setState ({
      currChannel: channel.channelName
    });
    this.displayFriends();
  }

  //goes to channel when invited to it
  async requestGoToChannelByInvite(channel) {
    if (this.state.currChannel === '') { //get rid of home-specific elements
      document.getElementById("deadlinesHome").innerHTML = "";
      document.getElementsByClassName("channelButtonsHome")[0].innerHTML = "";
    }
    this.setState ({
      currChannel: ""
    });
    this.setState ({
      currChannel: channel
    });
    this.displayFriends();
    this.displayInvitations();
  }

  //creates new channel and sends request to backend to save in db
  async createChannel(event) {
    event.preventDefault();
    const name = prompt("Enter channel name:")
    const priv = window.confirm("Would you like this to be private? If not, press 'Cancel'.")
    const channelInfo = {
      owner: this.state.loggedUser,
      channelName: name,
      isPrivate: priv,
      loggedUser: this.state.loggedUser,
      authToken: this.state.authToken
    };
    try { //send channel info to backend
      const response = await axios.post('/api/users/createChannel', channelInfo);
      alert(response.data.message);
      //update channel lists
      this.displayUserChannels();
      this.displayPublicChannels();
    } catch (error) {
      console.error("Error! ", error);
    }
  }

  //requests backend to delete channel from db
  async deleteChannel(event) {
    event.preventDefault();
    const name = prompt("Enter the name of the channel you would like to delete:")
    const conf = window.confirm(`Are you sure you would like to delete ${name}? Keep in mind that you must be the creator of this channel to delete it. This action cannot be undone.`)
    if (conf) {
        const channelInfo = {
        channelName: name,
        loggedUser: this.state.loggedUser,
        authToken: this.state.authToken
      };
      try { //send channel info to backend
        const response = await axios.post('/api/users/deleteChannel', channelInfo);
        alert(response.data.message);
        if (response.data.type === 'success' && this.state.currChannel === name) {
          this.requestGoToHome();
        }
        else {
          //update channel lists
          this.componentDidMount();
        }
      } catch (error) {
        console.error("Error! ", error);
      }
    } 
  }

  //request backend to delete account from db if user requests it, deletes all owned channels
  async deleteAcct(event) {
    event.preventDefault();
    //const username = this.state.loggedUser;
    const conf = window.confirm("Are you sure you want to delete your account? You will no longer be able to access this account. Press 'OK' to delete account, or 'cancel' to cancel request.")
    if (conf) {
    try { //send info to backend
      const response = await axios.post('/api/users/deleteAcct', this.state);
      alert(response.data.message);
      const response2 = await axios.post('/api/users/deleteChannels', this.state);
      if (response2) {

      }
      this.setState ({
        authToken: "",
        isLoggedIn: false,
        loggedUser: "",
        currChannel: "",
        clickedOnFriend: ""
      });
      //send to parent in callback function to send back to login page once user has deleted their acct
      this.props.deletedAcctCallback(response.data);
    } catch (error) {
      console.error("Error! ", error);
    }
    }
  }

  //reset state and send to App.js callback if user requests to logout
  async logout(event) {
    this.setState ({
      authToken: "",
      isLoggedIn: false,
      loggedUser: "",
      currChannel: "",
      clickedOnFriend: ""
    });
    this.props.logoutCallback();
  }

  //adds friend's username to database if the username exists
  async addFriend(event) {
    event.preventDefault();
    const otherUser = prompt("Enter username:")
    if (otherUser === '') {
      alert("Please enter a valid username.");
    }
    else if (otherUser !== null) {
      const addFriendInfo = {
        this_user: this.state.loggedUser,
        other_user: otherUser,
        loggedUser: this.state.loggedUser,
        authToken: this.state.authToken
      };
      try {
        const response = await axios.post('/api/users/addFriend', addFriendInfo);
        alert(response.data.message);
        //update friends list
        this.displayFriends();
      } catch (error) {
        console.error("Error! ", error);
      }
    }
  }

  //removes selected friend from database
  async removeFriend(event) {
    event.preventDefault();
    this.closeModal();
    const removeFriendInfo = {
      this_user: this.state.loggedUser,
      other_user: this.state.clickedOnFriend,
      authToken: this.state.authToken
    };
      try {
        const response = await axios.post('/api/users/removeFriend', removeFriendInfo);
        alert(response.data.message);
        // display updated friends list
        this.displayFriends();
      } catch (error) {
        console.error("Error! ", error);
      }
  }

  //display friends upon login
  async displayFriends() {
    try { //send info to backend
      const response = await axios.post('/api/users/displayFriends', this.state);  
      //Get ready to print friends
      document.getElementById("myFriends").innerHTML = ""
      //loop through friends list and print each friend's username
      const friends_list = response.data.thisUser.friends;
      for (let i = 0; i < friends_list.length; i++){
        let friendNode = document.createElement("div");
        friendNode.classList.add("friendsdiv");
        friendNode.appendChild(document.createTextNode(friends_list[i]));
        document.getElementById("myFriends").appendChild(friendNode);
        //If friend is clicked on, modal box will appear
        friendNode.addEventListener("click", this.friendModal.bind(null, friends_list[i]), false);
      }
    } catch (error) {
      console.error("Error! ", error);
    }
  }

  //display invitations upon login
  async displayInvitations() {
    try { //send info to backend
      const response = await axios.post('/api/users/displayInvitations', this.state);  
      //Get ready to print invitations
      document.getElementById("myInvitations").innerHTML = ""
      //loop through invitations list and print each chatroom the user has been invited to
      const invite_list = response.data.thisUser.channelInvitations;
      for (let i = 0; i < invite_list.length; i++){
        let inviteNode = document.createElement("div");
        inviteNode.classList.add("invitationdiv");
        inviteNode.appendChild(document.createTextNode(invite_list[i]));
        document.getElementById("myInvitations").appendChild(inviteNode);
        //If channel is clicked on, go to channel
        inviteNode.addEventListener("click", this.requestGoToChannelByInvite.bind(null, invite_list[i]), false);
      }
    } catch (error) {
      console.error("Error! ", error);
    }
  }

  // Changes the state of the clickedOnFriend and opens friend modal
  async friendModal(friend) {
    this.setState ({
      clickedOnFriend: friend
    });
    document.getElementsByClassName('modal2')[0].style.display = "block";
  }

  // When the user clicks on <span> (x) or "cancel", close the modal
  async closeModal() {
    document.getElementsByClassName('modal2')[0].style.display = "none";
    document.getElementsByClassName('modal')[0].style.display = "none";
    document.getElementsByClassName('modal')[1].style.display = "none";
  } 

  //requests backend to invite selected user to access private channel
  async inviteToCurrChannel(event) {
    this.closeModal();
    event.preventDefault();
    try {
      const response = await axios.post('/api/users/inviteToCurrChannel', this.state);  
      alert(response.data.message);
    } catch (error) {
      console.error("Error! ", error);
    }
  }

  //display all deadlines created by the logged in user on the homepage
  async displayDeadlines() {
    try {
        const response = await axios.post('/api/users/displayDeadlines', this.state);
              //Get ready to print feed
              document.getElementById("deadlinesHome").innerHTML = "";
              let title = document.createElement('strong');
              title.innerText = "Your Project Deadlines";
              document.getElementById("deadlinesHome").appendChild(title);
              document.getElementById("deadlinesHome").appendChild(document.createElement("br"));
              document.getElementById("deadlinesHome").appendChild(document.createElement("br"));
              //loop through channel posts array and print each deadline
              const channel_deadlines = response.data.allDeadlines;
              for (let i = 0; i < channel_deadlines.length; i++){
                if (channel_deadlines[i].author === this.state.loggedUser) {
                  let deadlineNode = document.createElement("div");
                  deadlineNode.classList.add("deadlineDiv2");
                  deadlineNode.appendChild(document.createTextNode(channel_deadlines[i].name + ": "));
                  deadlineNode.appendChild(document.createElement("br"));
                  deadlineNode.appendChild(document.createTextNode(channel_deadlines[i].date));
                  document.getElementById("deadlinesHome").appendChild(deadlineNode);
                  document.getElementById("deadlinesHome").appendChild(document.createElement("br"));
                }
              }
          } catch (error) {
              console.error("Error! ", error);
      }
}

//display all study plans associated with this user on the homepage
async displayStudyPlans() {
  try {
      const response = await axios.post('/api/users/displayStudyPlans', this.state)
            //Get ready to print study plans
            document.getElementById("studyplansHome").innerHTML = "";
            let title = document.createElement('strong');
            title.innerText = "Your Personal Study Plans";
            document.getElementById("studyplansHome").appendChild(title);
            document.getElementById("studyplansHome").appendChild(document.createElement("br"));
            document.getElementById("studyplansHome").appendChild(document.createElement("br"));
            //loop through channel posts array and print each post
            const plans = response.data.allPlans;
            for (let i = 0; i < plans.length; i++){
                let deadlineNode = document.createElement("div");
                deadlineNode.classList.add("spDiv");
                deadlineNode.appendChild(document.createTextNode("Plan: " + plans[i].projectName+ " - Deadline: " + plans[i].deadline));
                document.getElementById("studyplansHome").appendChild(deadlineNode);
                deadlineNode.addEventListener("click", this.showPlanDetails.bind(null, plans[i]), false);
                document.getElementById("studyplansHome").appendChild(document.createElement("br"));
            }
        } catch (error) {
            console.error("Error! ", error);
    }
}

//opens study plan modal box which displays study plan details
async showPlanDetails(plan) {
  // Show the update event modal window
  document.getElementById("spModal").style.display = "block";
  // Show details
  document.getElementById("spContent").innerHTML = "";
  $("#spContent").append(`<strong>Project Name: </strong>`);
  let userText2 = document.createTextNode(plan.projectName);
  $("#spContent").append(userText2);
  $("#spContent").append(`<br><br>`);
  $("#spContent").append(`<strong>Project Deadline: </strong> ${plan.deadline} <br><br>`);
  for (let i=0; i<plan.items.length; i++) { 
    $("#spContent").append(`<strong>Task ${i+1}: </strong>`);
    let userText3 = document.createTextNode(plan.items[i].name);
    $("#spContent").append(userText3);
    $("#spContent").append(`&nbsp;&nbsp;`);
    $("#spContent").append(`<strong>Finish By: </strong>`);
    let userText4 = document.createTextNode(plan.items[i].deadline);
    $("#spContent").append(userText4);
    $("#spContent").append(`<br><br>`);
  }
}

//shows add study plan modal box
async addStudyPlan() {
  document.getElementsByClassName('modal')[0].style.display = "block";
}

//called from the modal box, requests backend to save study plan info in database
async addSP(event) {
  event.preventDefault();
  this.closeModal();
  const plan_name = document.getElementById('plan_name').value;
  const plan_deadline = document.getElementById('plan_deadline').value;
  const plan_items = document.getElementsByName('plan_tasks');
  const plan_times = document.getElementsByName('plan_times');
  const items = [];
  for (let i=0; i<plan_items.length; i++) {
    let item = {name: plan_items[i].value, deadline: plan_times[i].value};
    items.push(item);
  }
  document.getElementById('planElements').innerHTML = "";
  const planInfo = {
      author: this.state.loggedUser,
      project: plan_name,
      deadline: plan_deadline,
      items: items,
      loggedUser: this.state.loggedUser,
      authToken: this.state.authToken
  };
  try { //send post info to backend
      const response = await axios.post('/api/users/addStudyPlan', planInfo);
      if (response.data.type === 'error') {
        alert(response.data.message);
      }
      this.displayStudyPlans();
  } catch (error) {
      console.error("Error! ", error);
  }
}

//allow user to add more study plan elements when they click on the instruction
async addPSElement() {
  $("#planElements").append(
    "Task: <input type='text' name='plan_tasks'></input>  Finish By: <input type='date' name='plan_times'></input><br></br>");
}

  render() {
  if (this.state.currChannel !== '') {
    return (
      <div>
          <div className='mainPage'>
            
            <div className='addPage'>
              <button onClick={this.createChannel} >Create Channel</button>
              <button onClick={this.deleteChannel} >Delete Channel</button>
              <button onClick={this.requestGoToHome} >Return to My Home Page</button>
            </div>

            <div className='accountButtons'>
              Hi,  {this.state.loggedUser}! &nbsp;
              <button onClick={this.logout}> Logout </button>  
              <button onClick={this.deleteAcct}> Delete Account </button>
              <button onClick={this.addFriend}> Add Friend By Username </button>
            </div>
            
            <div className='pageContent'>
              <div id='sidebar'>
                <div className="channelBox">
                  <p className='mC'> My Channels </p>
                  <div id='myChannels'></div>
                </div>
                <div className="channelBox">
                  <p className='mC'> Public Channels </p>
                  <div id='publicChannels'></div>
                </div>
              </div>
             
               <div id='channelContent'>
                 <CurrentChannel logout={this.logout} channelInfo={this.state} />
               </div>

              <div id='sidebar2'>
                  <div className="friendsBox">
                    <p className='mC'> My Friends </p>
                    <div id='myFriends'></div>
                  </div>
                  <div className="friendsBox">
                    <p className='mC'> Invitations </p>
                    <div id='myInvitations'></div>
                  </div>
                </div>
            </div>

            <div id="friendModal" className="modal2">
                <div className="modal-content">
                    <span onClick={this.closeModal} className="close">&times;</span>
                      <div id='friendModalContent'>
                          <button onClick={this.inviteToCurrChannel}> Invite to Current Channel </button><br></br>
                          <button onClick={this.removeFriend}> Remove Friend </button><br></br>
                          <button onClick={this.closeModal}> Cancel </button><br></br>
                      </div> 
                </div>
            </div> 

          </div>
      </div>
  );
    }
else {
  return (
      <div>
            <div className='mainPage'>
              <div className='addPage'>
                <button onClick={this.createChannel} > Create Channel </button>
                <button onClick={this.deleteChannel} > Delete Channel </button>
              </div>

              <div className='accountButtons'>
                Hi,  {this.state.loggedUser}! &nbsp;
                <button onClick={this.logout}> Logout </button>  
                <button onClick={this.deleteAcct}> Delete Account </button>
                <button onClick={this.addFriend}> Add Friend By Username </button>
              </div>
              
              <div className='pageContent'>
                <div id='sidebar'>
                  <div className="channelBox">
                    <p className='mC'> My Channels </p>
                    <div id='myChannels'></div>
                  </div>
                  <div className="channelBox">
                    <p className='mC'> Public Channels </p>
                    <div id='publicChannels'></div>
                  </div>
                </div>

                <div id='channelContent'>
                <div className='channelButtonsHome'>
                    <button onClick={this.addStudyPlan} id="add_doc_btn" >Create Study Plan</button>
                    &nbsp;&nbsp;<h3 id='loading'>Loading...</h3>
                </div>
                  <div id='welcome'>
                    <strong>Welcome to Study With Me!</strong>
                    <p>You can create project groups for yourself for everyone and share them 
                    with your friends. On each channel, feel free to post ideas, links, and notes. 
                    You and your friends can share todo lists, deadlines, and more! You will see all of 
                    your deadlines and personal study plans here.</p>
                  </div>
                  <div id='studyplansHome'></div>
                  <div id='deadlinesHome'></div>
                </div>

                <div id='sidebar2'>
                    <div className="friendsBox">
                      <p className='mC'> My Friends </p>
                      <div id='myFriends'></div>
                    </div>
                    <div className="friendsBox">
                      <p className='mC'> Invitations </p>
                      <div id='myInvitations'></div>
                    </div>
                  </div>
              </div>

            <div id="friendModal" className="modal2">
              <div className="modal-content">
                  <span onClick={this.closeModal} className="close">&times;</span>
                    <div id='friendModalContent'>
                        <button onClick={this.removeFriend}> Remove Friend </button><br></br>
                        <button onClick={this.closeModal}> Cancel </button><br></br>
                    </div> 
              </div>
            </div>

            <div id="addStudyPlan" className="modal">
                <div className="modal-content">
                    <span onClick={this.closeModal} className="close">&times;</span>
                    <form onSubmit={this.addSP}>
                        <div id='addSPModalContent'>
                            <p>Create a Study Plan!</p>
                            <div>
                                Project Name: <input type="text" id="plan_name" required></input><br></br><br></br>
                                Deadline: <input type="date" id="plan_deadline" required></input><br></br><br></br>
                                <div id='planElements'></div>
                                <h3 onClick={this.addPSElement}> Press HERE to Add Element </h3>
                            </div>
                            <button type="submit"> Add Study Plan </button><br></br><br></br>
                            <button onClick={this.closeModal}> Cancel </button>
                        </div> 
                    </form>
                </div>
            </div>

            <div id="spModal" className="modal">
              <div className="modal-content">
                  <span onClick={this.closeModal} className="close">&times;</span>
                    <div id='spContent'></div> 
              </div>
            </div>

            </div>
        </div>
    );
  }
  }
}
   
export default HomePage;