const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const User = require('../../models/User');
const Channel = require('../../models/Channel');
const Deadline = require('../../models/Deadline');
const StudyPlan = require('../../models/StudyPlan');
require('dotenv').config()


//Registers user
router.post('/register', async (req, res) => {

    User.findOne({ username: req.body.username }).then(async userExists => {
        if (userExists) {
            res.send({ type: "error", message: "Username is already taken. Try a different one."})
        }
        else {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(req.body.password, salt)
            console.log("Salt: ", salt)
            console.log("HP: ", hashedPassword)
            //User Authentication
            const user = new User({
                username: req.body.username,
                password: hashedPassword
            });
            try {
                const storeUser = await user.save();
                console.log(storeUser);
                //create token
                const jwtoken = jwt.sign({
                    _id: storeUser._id,
                    username: storeUser.username
                    },
                    process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'}
                );
                //assign token
                res.header("authtoken", jwtoken).send({
                    type: "Success",
                    message: {
                        _id: storeUser._id,
                        username: storeUser.username
                    }
                });
            } catch (e) {
                res.send({ type: "error", message: e.toString()})
            }
        }
    })
});

//Repeat for login
router.post('/login', async (req, res) => {
    //User Authentication
    User.findOne({ username: req.body.username }).then(userExists => {
        if (userExists) {
            console.log(userExists);
                //compare the entered password with the hashed version of the password to make sure they're the same
                bcrypt.compare(req.body.password, userExists.password).then(isMatch => {
                    if (isMatch) {
                            //create token
                            const jwtoken = jwt.sign({
                                _id: userExists._id,
                                username: userExists.username
                                //add expiration time 
                                },
                                process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'}
                            );
                            //assign token
                            res.header("authtoken", jwtoken).send({
                                type: "Success",
                                message: {
                                    _id: userExists._id,
                                    username: userExists.username
                                }
                            });
                    } 
                    else {
                        res.send({ type: "error", message: "Wrong password."})
                    }
                })
        }
        else {
            res.send({ type: "error", message: "You havent registered yet."})
        }
    })   
});

//When the user creates a new channel
router.post('/createChannel', authenticateToken, async (req, res) => {
    //store channel info in database
    const channel = new Channel({
        owner: req.body.owner,
        channelName: req.body.channelName,
        isPrivate: req.body.isPrivate
    });
    try {
        const storeChannel = await channel.save();
        console.log(storeChannel);
        if (storeChannel) {
            res.send({ type: "success", message: "Channel was successfully created."})
        }
        else {
            res.send({ type: "error", message: "Something went wrong. Please try again."})
        }
    } catch (e) {
        res.send({ type: "error", message: e.toString()})
    }
});

//When the user deletes their account
router.post('/deleteAcct', authenticateToken, async (req, res) => {
    //remove this user from other users' friends lists
    try {
        User.updateMany({friends: {$exists: true}}, {$pull: {friends: req.body.loggedUser}}).then(async removedFromFriendList => {
            if(!removedFromFriendList){
                res.send({ type: "error", message: "Did not remove user from other users' friend lists."})
            }
        });
    } catch (err) {
            res.send({ type: "error", message: err.toString()})
    }

    //remove user info from database
    try {
        User.deleteMany({username : req.body.loggedUser}).then(removedUser => {
            console.log(removedUser);
            if (removedUser.deletedCount > 0) {
                res.send({ type: "success", message: "Account was deleted"})
            }
            else {
                res.send({ type: "error", message: "Something went wrong. Please try again."})
            }       
        })
    } catch (err) {
        res.send({ type: "error", message: err.toString()})
    }
});

//Deletes channels when user deletes account
router.post('/deleteChannels', authenticateToken, async (req, res) => {
    try {
        Channel.deleteMany({owner : req.body.loggedUser}).then(removedChannels => {
            console.log(removedChannels);
            if (removedChannels.deletedCount > 0) {
                res.send({ type: "success", message: "Channels were deleted"})
            }
            else {
                res.send({ type: "error", message: "Something went wrong. Please try again."})
            }       
        })
    } catch (err) {
        res.send({ type: "error", message: err.toString()})
    }
});

//Deletes channel 
router.post('/deleteChannel', authenticateToken, async (req, res) => {
    //remove this channel from other users' invited lists
    try {
        User.updateMany({channelInvitations: {$exists: true}}, {$pull: {channelInvitations: req.body.channelName}}).then(async removedInvitations => {
            if(!removedInvitations){
                res.send({ type: "error", message: "Did not remove channel from other invitation lists."})
            }
        });
    } catch (err) {
            res.send({ type: "error", message: err.toString()})
    }

    try {
        Channel.deleteOne({channelName : req.body.channelName, owner: req.body.loggedUser}).then(removedChannel => {
            if (removedChannel.deletedCount > 0) {
                res.send({ type: "success", message: "Channel was deleted"})
            }
            else {
                res.send({ type: "error", message: "Either this channel doesn't exist or you are not the creator of this channel and cannot delete it. Please try again."})
            }       
        })
    } catch (err) {
        res.send({ type: "error", message: err.toString()})
    }
});

//Display current user's channels
router.post('/displayUserChannels', authenticateToken, async (req, res) => {
    console.log(req)
    try {
        Channel.find({owner : req.body.loggedUser}).then(userChannels => {
            res.send({type: "Success", userChannels})   
        })
    } catch (err) {
        res.send({ type: "error", message: err.toString()})
    }
});

//Display public channels
router.post('/displayPublicChannels', authenticateToken, async (req, res) => {
    try {
        Channel.find({isPrivate : false}).then(publicChannels => {
            res.send({type: "Success", publicChannels})   
        })
    } catch (err) {
        res.send({ type: "error", message: err.toString()})
    }
});

router.post('/addFriend', authenticateToken, async (req, res) => {
    console.log(req.body.this_user)
    console.log(req.body.other_user)
    const currUser = req.body.this_user;
    const otherUser = req.body.other_user
    
   User.findOne({username : otherUser}).then(async userExists => {
        if (userExists) {
            try {
                User.findOneAndUpdate({username: currUser}, {$push: {friends: otherUser}}).then(async addFriendResponse => { //to pop, use command pull
                    console.log(addFriendResponse); //doesn't show that it has updated but it actually has
                    if (!addFriendResponse) {
                        res.send({ type: "error", message: "Something went wrong. Please try again."})
                    }
                    User.findOneAndUpdate({username: otherUser}, {$push: {friends: currUser}}).then(async addFriendResponse2 => {
                        if (!addFriendResponse2) {
                            res.send({ type: "error", message: "Something went wrong. Please try again."})
                        }
                        else {
                            res.send({ type: "success", message: "Friend was successfully added."})
                        }
                        
                    });
                });
                } catch (e) {
                    res.send({ type: "error", message: e.toString()})
                }
        }
        else {
            res.send({ type: "error", message: "This user doesn't exist. Please try again."})
        }    
    });
});

router.post('/removeFriend', authenticateToken, async (req, res) => {
    try {
        User.findOneAndUpdate({username: req.body.this_user}, {$pull: {friends: req.body.other_user}}).then(async removeFriendResp => {
            if (!removeFriendResp) {
                res.send({ type: "error", message: "Something went wrong. Please try again."})
            }
            User.findOneAndUpdate({username: req.body.other_user}, {$pull: {friends: req.body.this_user}}).then(async removeFriendResp2 => {
                if (!removeFriendResp2) {
                    res.send({ type: "error", message: "Something went wrong. Please try again."})
                }
                else {
                    res.send({ type: "success", message: "Friend was successfully removed."})
                }
            });
        });
    } catch (e) {
        res.send({ type: "error", message: e.toString()})
    }
});

router.post('/displayFriends', authenticateToken, async (req, res) => {
    try {
        User.findOne({username : req.body.loggedUser}).then(thisUser => {
            if (thisUser) {
                res.send({type: "Success", thisUser})   
            }
            else {
                res.send({ type: "error", message: "User does not exist."})
            }
        })
    } catch (err) {
        res.send({ type: "error", message: err.toString()})
    }
});

router.post('/displayInvitations', authenticateToken, async (req, res) => {
    try {
        User.findOne({username : req.body.loggedUser}).then(thisUser => {
            if (thisUser) {
                res.send({type: "Success", thisUser})   
            }
            else {
                res.send({ type: "error", message: "User does not exist."})
            }
        })
    } catch (err) {
        res.send({ type: "error", message: err.toString()})
    }
});

//Display channel feed
router.post('/displayChannelFeed', authenticateToken, async (req, res) => {

        try {
            Channel.findOne({channelName : req.body.currChannel}).then(thisChannel => {
                    if (thisChannel) {
                        res.send({type: "Success", thisChannel})   
                    }
                    else {
                        res.send({ type: "error", message: "User does not exist."})
                    }   
                })
            } catch (err) {
                res.send({ type: "error", message: err.toString()})
            }
});

//Display channel feed
router.post('/displayDeadlines', authenticateToken, async (req, res) => {
    if (req.body.currChannel == '') {
        try {
            Deadline.find({author : req.body.loggedUser}).then(allDeadlines => {
                if (allDeadlines) {
                    res.send({type: "Success", allDeadlines})   
                }
                else {
                    res.send({ type: "error", message: "User does not exist."})
                }   
            })
        } catch (err) {
            res.send({ type: "error", message: err.toString()})
        }
    }
    else {
        try {
            Deadline.find({channelName : req.body.currChannel}).then(allDeadlines => {
                if (allDeadlines) {
                    res.send({type: "Success", allDeadlines})   
                }
                else {
                    res.send({ type: "error", message: "User does not exist."})
                }   
            })
        } catch (err) {
            res.send({ type: "error", message: err.toString()})
        } 
    }
});

router.post('/displayStudyPlans', authenticateToken, async (req, res) => {
        try {
            StudyPlan.find({author : req.body.loggedUser}).then(allPlans => {
                console.log(allPlans);
                if (allPlans) {
                    res.send({type: "Success", allPlans})   
                }
                else {
                    res.send({ type: "error", message: "User does not exist."})
                }   
            })
        } catch (err) {
            res.send({ type: "error", message: err.toString()})
        }
});

router.post('/createPost', authenticateToken, async (req, res) => {
    try {
        Channel.findOneAndUpdate({channelName: req.body.channel}, {$addToSet: {posts: {user: req.body.user, title: req.body.title, content: req.body.content}}}).then(async addedPost => {
            if (!addedPost) {
                res.send({ type: "error", message: "Something went wrong. Please try again."})
            }
            else {                    
                res.send({ type: "success", message: "Post has been posted successfully."})
            }

        });
    } catch (e){
        res.send({ type: "error", message: e.toString()})
    }
});

router.post('/addDeadline', authenticateToken, async (req, res) => {
    const deadline = new Deadline({
        author: req.body.deadline_author,
        channelName: req.body.channel,
        name: req.body.project,
        date: req.body.deadline
    });
    try {
        const addResult = await deadline.save();
        if (addResult) {
            res.send({ type: "success", message: "Deadline was successfully added."})
        }
        else {
            res.send({ type: "error", message: "Something went wrong. Please try again."})
        }
    } catch (e) {
        res.send({ type: "error", message: e.toString()})
    }

});

router.post('/addStudyPlan', authenticateToken, async (req, res) => {
    const sp = new StudyPlan({
        author: req.body.loggedUser,
        channelName: req.body.channel,
        projectName: req.body.project,
        deadline: req.body.deadline,
        items: req.body.items
    });
    try {
        const addResult = await sp.save();
        console.log(addResult)
        if (addResult) {
            res.send({ type: "success", message: "Plan was successfully added."})
        }
        else {
            res.send({ type: "error", message: "Something went wrong. Please try again."})
        }
    } catch (e) {
        res.send({ type: "error", message: e.toString()})
    }

});

router.post('/deleteDeadline', async (req, res) => {
    try {
        Deadline.deleteOne({name: req.body.deleted_deadline}).then(async deadlineDeleted => {
            if (!deadlineDeleted) {
                res.send({ type: "error", message: "Something went wrong. Please try again."})
            } else {
                res.send({ type: "success", deadlineDeleted, message: "Deadline was successfully deleted."})
            }
        });
    } catch (e) {
        res.send({ type: "error", message: e.toString()})
    }

});

// router.post('/deleteStudyPlan', async (req, res) => {
//     try {
//         StudyPlan.deleteOne({author: req.body.author, projectName: req.body.projectName}).then(async planDeleted => {
//             if (!planDeleted) {
//                 res.send({ type: "error", message: "Something went wrong. Please try again."})
//             } else {
//                 res.send({ type: "success", planDeleted, message: "Plan was successfully deleted."})
//             }
//         });
//     } catch (e) {
//         res.send({ type: "error", message: e.toString()})
//     }

// });

router.post('/addToToDoList', authenticateToken, async (req, res) => {
    try {
        Channel.findOneAndUpdate({channelName: req.body.channel}, {$addToSet: {toDoList:  req.body.task}}).then(async addedTask => {
            if (!addedTask) {
                res.send({ type: "error", message: "Something went wrong. Please try again."})
            }
            else {                    
                res.send({ type: "success", message: "Task has been added successfully."})
            }
        });
    } catch (e){
        res.send({ type: "error", message: e.toString()})
    }
});

router.post('/markTaskAsCompleted', authenticateToken, async (req, res) => {
    try {
        Channel.findOneAndUpdate({channelName: req.body.this_channel}, {$addToSet: {completedTasks:  req.body.completed_task}}).then(async taskCompleted => {
            if (!taskCompleted) {
                res.send({ type: "error", message: "Something went wrong. Please try again."})
            }
            else {    
                Channel.findOneAndUpdate({channelName: req.body.this_channel}, {$pull: {toDoList: req.body.completed_task}}).then(async taskRemoved => {
                    if (!taskRemoved){
                        res.send({ type: "error", message: "Something went wrong. Please try again."})
                    }
                    else {
                        res.send({ type: "success", message: "Task has been marked as complete."})
                    }
                });
            }
        });
    } catch (e){
        res.send({ type: "error", message: e.toString()})
    }
    
});

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage});

// router.post('/uploadImage', upload.any(), async (req, res) => {
//     console.log(req.files)
//     console.log(req.files[0].mimetype)
//     const image = new Uploads({
//         //channelName: req.files[0].currChannel,
//         owner: req.loggedUser,
//         data: req.files[0].buffer,
//         originalName: req.files[0].originalname,
//         contentType: req.files[0].mimetype
//     });
//     try {
//         const uploadResult = await image.save();
//         res.redirect('/') 
//     } catch (e) {
//         res.send({ type: "error", message: e.toString()})
//     }

// });

// router.post('/getFiles', upload.any(), async (req, res) => {
//     try {
//         Uploads.find({channelName: req.loggedUser}).then(userFiles => {
//             if (userFiles) {
//                 res.send({type: "Success", userFiles})   
//             }
//             else {
//                 res.send({ type: "error", message: "Files do not exist."})
//             }   
//         })
//     } catch (err) {
//         res.send({ type: "error", message: err.toString()})
//     }
// });

router.post('/inviteToCurrChannel', async (req, res) => {
    try {
        Channel.findOne({channelName : req.body.currChannel}).then(thisChannel => {
            if (!thisChannel.isPrivate) { //the channel is public
                res.send({type: "error", message: "This channel is public, so users can join without an invitation."})   
            }
            else { //the channel is private
                User.findOneAndUpdate({username: req.body.clickedOnFriend}, {$addToSet: {channelInvitations: req.body.currChannel}}).then(async invitedFriend => {
                    if (invitedFriend) {
                        res.send({ type: "Success", message: "Friend has been invited to channel.", thisChannel, invitedFriend})
                    }
                    else {
                        res.send({ type: "error", message: "Friend has already been invited to this channel."})
                    }
                });
            }   
        });
    } catch (err) {
        res.send({ type: "error", message: err.toString()})
    }
});

//add user to the channel's 'kickedOutUsers' list. Upon loging, the user will no longer have access to this channel
router.post('/kickOutOfChannel', async (req, res) => {
    try {
        Channel.findOne({channelName : req.body.this_channel}).then(thisChannel => {
            if (thisChannel.owner == req.body.kicked_user) {
                //if the user being kicked out is the owner of the channel, they will not be kicked out
                res.send({ type: "error", message: "This user is the owner of this channel, and therefore cannot be kicked out."})
            } else if(req.body.loggedUser != thisChannel.owner) {
                //if the user being kicked out is the owner of the channel, they will not be kicked out
                res.send({ type: "error", message: "You must be the creator of this channel in order to kick users out."})
            }  else {
                Channel.findOneAndUpdate({channelName : req.body.this_channel}, {$addToSet: {kickedOutUsers: req.body.kicked_user}}).then(async kickedOut => {
                    if (kickedOut) {
                        res.send({ type: "Success", message: "User has been kicked out. The next time they log in, they will not have access to this channel."})
                    }
                    else {
                        res.send({ type: "error", message: "Something went wrong. Please try again."})
                    }
                });
            }
        });
    } catch (err) {
        res.send({ type: "error", message: err.toString()})
    }
});


function authenticateToken(req, res, next) {
    //const authHeader = req.headers['authorization']
    const token = req.body.authToken;
    if (token == null) {
        return res.sendStatus(401)
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403)
        }
        else {
            req.loggedUser = user
            next() 
        }
          
    })
}

module.exports = router; //so we can use it elsewhere