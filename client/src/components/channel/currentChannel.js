import React, {Component} from 'react';
import axios from "axios";
import './currentChannel.css';

class CurrentChannel extends Component {
    constructor (props){
        super(props);
        this.displayChannelFeed = this.displayChannelFeed.bind(this);
        this.displayDeadlines = this.displayDeadlines.bind(this);
        this.createPostModal = this.createPostModal.bind(this);
        this.createPost = this.createPost.bind(this);
        this.kickOutOfChannel = this.kickOutOfChannel.bind(this);
        this.addDeadline = this.addDeadline.bind(this);
        this.addToToDoList = this.addToToDoList.bind(this);
        this.toDoListModal = this.toDoListModal.bind(this);
        this.displayToDoList = this.displayToDoList.bind(this);
        this.displayCompletedTasks = this.displayCompletedTasks.bind(this);
        this.markTaskAsCompleted = this.markTaskAsCompleted.bind(this);
        this.deleteDeadline = this.deleteDeadline.bind(this);
        this.state = {
            loggedUser: props.channelInfo.loggedUser,
            currChannel: props.channelInfo.currChannel,
            authToken: props.channelInfo.authToken,
            isLoggedIn: props.channelInfo.isLoggedIn
          }
    }

componentDidMount() {
    this.loading(true).then(() =>  //shows loading message while components are loaded
        this.displayChannelFeed(),
        this.displayDeadlines(),
        this.displayToDoList(),
        this.displayCompletedTasks()
    ).then(() =>
        this.loading(false)
    )  
}

async loading(yes) {
    if (yes) {
        document.getElementById('loading').style.display = 'block'; 
    }
    else {
       document.getElementById('loading').style.display = 'none'; 
    } 
}

//display feed of channel posts
async displayChannelFeed() {
    try {
        const response = await axios.post('/api/users/displayChannelFeed', this.state);   
        //Get ready to print feed
        document.getElementById("channelFeed").innerHTML = "";
        //loop through channel posts array and print each post
        const channel_posts = response.data.thisChannel.posts;
        for (let i = 0; i < channel_posts.length; i++){
            //work on this css
            let postNode = document.createElement("div");
            postNode.classList.add("post");

            let titleNode = document.createElement("div");
            titleNode.classList.add("titlediv");
            let strongNode = document.createElement("strong");
            strongNode.innerText = channel_posts[i].title;
            titleNode.appendChild(strongNode);
            postNode.appendChild(titleNode);
            
            let userNode = document.createElement("div");
            userNode.classList.add("authordiv");
            let postedBy = "Posted by: "
            userNode.appendChild(document.createTextNode(postedBy));
            userNode.appendChild(document.createTextNode(channel_posts[i].user));
            postNode.appendChild(userNode);
            userNode.addEventListener("click", this.kickOutOfChannel.bind(null, channel_posts[i].user), false);
            postNode.appendChild(document.createElement("br"));

            let contentNode = document.createElement("div");
            contentNode.classList.add("contentdiv");
            contentNode.appendChild(document.createTextNode(channel_posts[i].content));
            postNode.appendChild(contentNode);

            document.getElementById("channelFeed").appendChild(postNode);
            document.getElementById("channelFeed").appendChild(document.createElement("br"));
        }
    } catch (error) {
        console.error("Error! ", error);
    }
}

//display deadlines for this channel
async displayDeadlines() {
    try {
        const response = await axios.post('/api/users/displayDeadlines', this.state); 
        //Get ready to print deadlines
        document.getElementById("deadlines").innerHTML = "";
        let title = document.createElement('strong');
        title.innerText = "Project Deadlines";
        document.getElementById("deadlines").appendChild(title);
        document.getElementById("deadlines").appendChild(document.createElement("br"));
        document.getElementById("deadlines").appendChild(document.createElement("br"));
        //loop through channel posts array and print each post
        const channel_deadlines = response.data.allDeadlines;
        for (let i = 0; i < channel_deadlines.length; i++){
            let deadlineNode = document.createElement("div");
            deadlineNode.classList.add("deadlineDiv");
            deadlineNode.appendChild(document.createTextNode(channel_deadlines[i].name + ": "));
            deadlineNode.appendChild(document.createElement("br"));
            deadlineNode.appendChild(document.createTextNode(channel_deadlines[i].date));
            document.getElementById("deadlines").appendChild(deadlineNode);
            deadlineNode.addEventListener("click", this.deleteDeadline.bind(null, channel_deadlines[i].name), false);
            document.getElementById("deadlines").appendChild(document.createElement("br"));
        }
    } catch (error) {
        console.error("Error! ", error);
    }
}

//display todo list items for this channel
async displayToDoList() {
    try {
        const response = await axios.post('/api/users/displayChannelFeed', this.state); 
        //Get ready to print todo's
        document.getElementById("toDoList").innerHTML = "";
        let title = document.createElement('strong');
        title.innerText = "To-Do List:";
        document.getElementById("toDoList").appendChild(title);
        document.getElementById("toDoList").appendChild(document.createElement("br"));
        document.getElementById("toDoList").appendChild(document.createElement("br"));
        //loop through channel toDoList array and print each task
        const channel_toDoList = response.data.thisChannel.toDoList;
        for (let i = 0; i < channel_toDoList.length; i++){
            let taskNode = document.createElement("div");
            taskNode.classList.add("toDo");
            taskNode.innerText = channel_toDoList[i];
            document.getElementById("toDoList").appendChild(taskNode);
            document.getElementById("toDoList").appendChild(document.createElement("br"));
            taskNode.addEventListener("click", this.markTaskAsCompleted.bind(null, channel_toDoList[i]), false);
        }
        document.getElementById("toDoList").appendChild(document.createElement("br"));
    } catch (error) {
        console.error("Error! ", error);
    }
}

//display all todolist items that have been completed
async displayCompletedTasks() {
    try {
        const response = await axios.post('/api/users/displayChannelFeed', this.state); 
        //Get ready to print completed tasks
        document.getElementById("complete").innerHTML = "";
        let title = document.createElement('strong');
        title.innerText = "Completed Tasks:";
        document.getElementById("complete").appendChild(title);
        document.getElementById("complete").appendChild(document.createElement("br"));
        document.getElementById("complete").appendChild(document.createElement("br"));
        //loop through channel's completedTask array and display each task
        const channel_completed = response.data.thisChannel.completedTasks;
        for (let i = 0; i < channel_completed.length; i++){
            let taskNode = document.createElement("div");
            taskNode.classList.add("comp");
            taskNode.innerText = channel_completed[i];
            document.getElementById("complete").appendChild(taskNode);
            document.getElementById("complete").appendChild(document.createElement("br"));
        }
    } catch (error) {
        console.error("Error! ", error);
    }
}

//move todo item to completed tasks list
async markTaskAsCompleted(completedTask) {
    const conf = window.confirm("Would you like to mark this task as completed? If not, press 'Cancel'.")
    if (conf) {
        const completedInfo = {
            this_user: this.state.loggedUser,
            completed_task: completedTask,
            this_channel: this.state.currChannel,
            authToken: this.state.authToken
        };
        try {
            const response = await axios.post('/api/users/markTaskAsCompleted', completedInfo);
            if (response.data.type === 'error') {
                alert(response.data.message);
            }
            this.displayCompletedTasks();
            this.displayToDoList();
          } catch (error) {
            console.error("Error! ", error);
          }
    }
}

//requests backend to delete deadlne from database
async deleteDeadline(deletedDeadline) {
    const conf = window.confirm("Would you like to remove this deadline? If not, press 'Cancel'.")
    if (conf) {
        const deletedInfo = {
            this_user: this.state.loggedUser,
            deleted_deadline: deletedDeadline,
            this_channel: this.state.currChannel,
            authToken: this.state.authToken
        };
        try {
            const response = await axios.post('/api/users/deleteDeadline', deletedInfo);
            if (response.data.type === 'error') {
                alert(response.data.message);
            }
            this.displayDeadlines();
        } catch (error) {
            console.error("Error! ", error);
        }
    }
}

//displays modals
async addDocument() {
    document.getElementsByClassName('modal')[3].style.display = "block";
}

async createPostModal(event) {
    document.getElementsByClassName('modal')[0].style.display = "block";
}

async addDeadlineModal() {
    document.getElementsByClassName('modal')[1].style.display = "block";
}

async toDoListModal() {
    document.getElementsByClassName('modal')[2].style.display = "block";
}

//kick user out of the current channel if the logged in user is the creator of the channel
async kickOutOfChannel(kickedOutUser) {
    const conf = window.confirm("Would you like to kick this user out of this channel? If not, press 'Cancel'.")
    if (conf) {
        const kickedInfo = {
            this_user: this.state.loggedUser,
            kicked_user: kickedOutUser,
            this_channel: this.state.currChannel,
            authToken: this.state.authToken
        };
        try {
            const response = await axios.post('/api/users/kickOutOfChannel', kickedInfo);
            alert(response.data.message);
          } catch (error) {
            console.error("Error! ", error);
          }
    }
}

//create post and request backend to store in the database
async createPost(event) {
    event.preventDefault();
    this.closeModal();
    const Title = document.getElementById('title').value;
    const Content = document.getElementById('content').value;
    const postInfo = {
        channel: this.state.currChannel,
        user: this.state.loggedUser,
        title: Title,
        content: Content,
        loggedUser: this.state.loggedUser,
        authToken: this.state.authToken
    };
    try { //send post info to backend
        const response = await axios.post('/api/users/createPost', postInfo);
        if (response.data.type === 'error') {
            alert(response.data.message);
        }
        this.displayChannelFeed();
    } catch (error) {
        console.error("Error! ", error);
    }
}

//add deadline for this channel and add to database
async addDeadline(event) {
    event.preventDefault();
    this.closeModal();
    const project_name = document.getElementById('project_name').value;
    const deadline_date = document.getElementById('deadline_date').value;
    const deadlineInfo = {
        channel: this.state.currChannel,
        deadline_author: this.state.loggedUser,
        project: project_name,
        deadline: deadline_date,
        loggedUser: this.state.loggedUser,
        authToken: this.state.authToken
    };
    try { //send post info to backend
        const response = await axios.post('/api/users/addDeadline', deadlineInfo);
        if (response.data.type === 'error') {
            alert(response.data.message);
        }
        this.displayDeadlines();
    } catch (error) {
        console.error("Error! ", error);
    }
}

//add todo list item to this channel
async addToToDoList(event) {
    event.preventDefault();
    this.closeModal();
    const task_name = document.getElementById('task_name').value;
    const taskInfo = {
        channel: this.state.currChannel,
        task_author: this.state.loggedUser,
        task: task_name,
        loggedUser: this.state.loggedUser,
        authToken: this.state.authToken
    };
    try { //send task info to backend
        const response = await axios.post('/api/users/addToToDoList', taskInfo);
        if (response.data.type === 'error') {
            alert(response.data.message);
        }
        this.displayToDoList();
    } catch (error) {
        console.error("Error! ", error);
    }
}

// When the user clicks on <span> (x), "post", or "cancel", close the modal
async closeModal() {
    document.getElementsByClassName('modal')[0].style.display = "none";
    document.getElementsByClassName('modal')[1].style.display = "none";
    document.getElementsByClassName('modal')[2].style.display = "none";
} 

render() {
    return (
        <div>
            <div className="Channel">
                
                <div className='channelButtons'>
                    <button onClick={this.createPostModal} id="create_post_btn" >Create post</button>
                    <button onClick={this.inviteFriend} id="invite_btn" >Invite friend</button>
                    <button onClick={this.addDeadlineModal} id="add_deadline_btn" >Add Deadline</button>
                    <button onClick={this.toDoListModal} id="add_deadline_btn" >Add Todo Task</button>
                    &nbsp;&nbsp;<h3 id='loading'>Loading...</h3>
                </div>
                <strong className="Channel-title"> {this.state.currChannel} </strong>
                
                <div id='channelFeed'></div>
                <div id='deadlines'></div>
                <div id='todo'>
                    <div id='toDoList'></div>
                    <div id='complete'></div>
                </div>
            </div>

            <div id="createPostModal" className="modal">
                <div className="modal-content">
                    <span onClick={this.closeModal} className="close">&times;</span>
                    <form onSubmit={this.createPost}>
                        <div id='createPostContent'>
                            <p>Create new post on channel: {this.state.currChannel}</p>
                            <div>
                                <label> Title : </label>
                                <input type="text" id="title" required></input><br></br><br></br>
                        
                                <label> Content : </label>
                                <textarea type="text" id="content" rows="4" cols="43" required></textarea><br></br><br></br>
                            </div>
                            <button type="submit"> Post </button><br></br>
                            <button onClick={this.closeModal}> Cancel </button>
                        </div> 
                    </form>
                </div>
            </div>

            <div id="createDeadlineModal" className="modal">
                <div className="modal-content">
                    <span onClick={this.closeModal} className="close">&times;</span>
                    <form onSubmit={this.addDeadline}>
                        <div id='createPostContent'>
                            <p>Create a new Project Deadline in this Channel: {this.state.currChannel}</p>
                            <div>
                                <label> Project Name : </label>
                                <input type="text" id="project_name" required></input><br></br><br></br>
                        
                                <label> Deadline : </label>
                                <input type="date" id="deadline_date" required></input><br></br><br></br>
                            </div>
                            <button type="submit"> Add Deadline </button><br></br>
                            <button onClick={this.closeModal}> Cancel </button>
                        </div> 
                    </form>
                </div>
            </div>

            <div id="toDoListModal" className="modal">
                <div className="modal-content">
                    <span onClick={this.closeModal} className="close">&times;</span>
                    <form onSubmit={this.addToToDoList}>
                        <div id='toDoListModalContent'>
                            <p>Add an item to the {this.state.currChannel} to-do list:</p>
                            <div>
                                <label> Task : </label>
                                <input type="text" id="task_name" required></input><br></br><br></br>
                            </div>
                            <button type="submit"> Add task </button><br></br><br></br>
                            <button onClick={this.closeModal}> Cancel </button>
                        </div> 
                    </form>
                </div>
            </div>

        </div>
    );
  }
}
       
export default CurrentChannel;