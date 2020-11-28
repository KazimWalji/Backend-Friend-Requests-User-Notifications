const functions = require('firebase-functions');

const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);


exports.sendFriendRequest = functions.database.ref('/friendsList/friendRequests/{thread}/{userId}').onCreate((change, context) => {

    console.log("Notification event triggered");
    console.log("thread: ", context.params.thread);
    console.log("userID: ", context.params.userId);

    // query the users in the database and get the name of the user who sent the message
    return admin.database().ref("/users/" + context.params.userId).once('value').then(snap => {
        const name = snap.child("name").val();
        console.log(name);
        //get the token of the user receiving the message
        return admin.database().ref("/users/" + context.params.thread).once('value').then(snap => {
            var token = snap.child("registration_token").val();
            console.log("token: ", token);
            console.log("Construction the notification message.");
            const payload = {
                "notification": {
                    title: "You recieved a friend request from " + name,
                    message: "You recieved a new friend request",
                    message_id: context.params.userId,
                    sound: "default",
                }
            };
            return admin.messaging().sendToDevice(token, payload)
                .then(function (response) {
                    console.log("Successfully sent message:", response);
                    console.log("message:", response.successCount);
                    return response.successCount;
                })
                .catch(function (error) {
                    console.log("Error sending message:", error);
                });
        });
    });
});