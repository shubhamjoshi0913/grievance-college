
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAWfUozol7OfQTfL0T8hKVOPuc5xnrKLrA",
    authDomain: "grievance-redressal-syst-90620.firebaseapp.com",
    databaseURL: "https://grievance-redressal-syst-90620-default-rtdb.firebaseio.com",
    projectId: "grievance-redressal-syst-90620",
    storageBucket: "grievance-redressal-syst-90620.firebasestorage.app",
    messagingSenderId: "992036570800",
    appId: "1:992036570800:web:d638b0fcac8e70aba91d75",
    measurementId: "G-Q2MRYNXFT8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// document.addEventListener('DOMContentLoaded', () => {
//     const marqueeText = document.querySelector('.navbar-brand span'); // Target the moving text

//     // Function to speak the text
//     function speakText() {
//         const textToSpeak = marqueeText.textContent; // Get the text content of the marquee

//         const utterance = new SpeechSynthesisUtterance(textToSpeak);
//         utterance.volume = 5; // Volume level (0 to 1)
//         utterance.rate = 1;   // Speed of speech (1 is normal speed)
//         utterance.pitch = 5;  // Pitch of speech (1 is normal pitch)

//         window.speechSynthesis.speak(utterance);
//     }

//     // Trigger speak when the animation starts
//     marqueeText.addEventListener('animationstart', speakText);
// });


// Add the event listener for the login form submission
document.getElementById('index-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from submitting the default way

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('user-type').value;
    handleLogin(email, password, userType);

    console.log(userType)

    // Ensure the user type is selected
    if (!userType) {
        showNotification('Please select a user type.');
        return;
    }


// Handle grievance-member login
if (userType === 'grievance-member') {
    const loginButton = document.querySelector('.login-btn'); // Get the login button by class

    // Function to handle grievance member login
    async function loginGrievanceMember(email, password) {
        try {
            // Disable button and show "Logging..."
            loginButton.disabled = true;
            loginButton.innerText = 'Logging...';

            // Authenticate the user
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Reference to grievance member database
            const membersRef = ref(database, 'members/' + user.uid);

            // Fetch grievance member details
            const snapshot = await get(membersRef);
            if (snapshot.exists()) {
                // Redirect to grievance member's page
                window.location.href = 'Member.html';
            } else {
                showNotification('You are not authorized as a grievance member.');
                resetLoginButton(); // Reset the button
                return; // Stop execution if user is not authorized
            }

        } catch (error) {
            console.error('Login failed:', error);

            // Check specific Firebase authentication error codes
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                showNotification('Invalid email or password.');
            } else {
                showNotification('Invalid email or password or Login failed. Please try again.');
            }

            resetLoginButton(); // Reset the button after failure
        }
    }

    // Function to reset login button text and state
    function resetLoginButton() {
        loginButton.disabled = false;
        loginButton.innerText = 'Login';
    }

    loginGrievanceMember(email, password); // ✅ Call the function
    return; // Stop further execution if grievance member login logic finishes
}






    // Handle admin login
if (userType === 'admin') {
    const loginBtn = document.querySelector('.login-btn'); // Select button using class
    loginBtn.textContent = "Logging..."; // Change text to "Logging..."

    const adminRef = ref(database, 'admins/admin1'); // Reference to admin data in Firebase

    get(adminRef).then(snapshot => {
        if (snapshot.exists()) {
            const adminData = snapshot.val();

            // Check if the entered email matches the stored admin email
            if (email !== adminData.email) {
                showNotification('Invalid admin email. Please try again.');
                loginBtn.textContent = "Login"; // Reset button text
                return;
            }

            // Sign in using Firebase Authentication
            signInWithEmailAndPassword(auth, email, password)
                .then(userCredential => {
                    const user = userCredential.user;
                    console.log("Admin logged in:", user.email);

                    // Store login status in Firebase Database
                    const loggedInRef = ref(database, 'loggedInUsers/admin');
                    set(loggedInRef, {
                        isAdminLoggedIn: true,
                        loggedInUserType: 'admin',
                        loggedInAdminEmail: user.email
                    });

                    // Redirect to the Admin page
                    window.location.href = 'Admin.html';
                })
                .catch(error => {
                    console.error("Error during login:", error.message);
                    showNotification("Invalid admin password. Please try again.");
                    loginBtn.textContent = "Login"; // Reset button text on failure
                });

        } else {
            showNotification('Admin does not exist.');
            loginBtn.textContent = "Login"; // Reset button text
        }
    }).catch(error => {
        console.error('Error fetching admin data:', error);
        showNotification('Error fetching admin data.');
        loginBtn.textContent = "Login"; // Reset button text on error
    });
    return;
}



// Function to handle login (students, teachers, staff)
function handleLogin(email, password, userType) {
    const loginBtn = document.querySelector('.login-btn'); // Select the login button
    loginBtn.textContent = "Logging..."; // Change button text

    // Authenticate user with Firebase Authentication
    signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            const user = userCredential.user;
            let usersRef;

            // Determine the reference based on user type
            if (userType === 'student') {
                usersRef = ref(database, `approvedStudents/${user.uid}`);
            } else if (userType === 'teacher') {
                usersRef = ref(database, `approvedTeachers/${user.uid}`);
            } else if (userType === 'staff') {
                usersRef = ref(database, `approvedStaff/${user.uid}`);
            } else {
                loginBtn.textContent = "Login"; // Reset button text
                return;
            }

            // Check if user is approved in Realtime Database
            get(usersRef).then(snapshot => {
                if (snapshot.exists()) {
                    // User is approved, redirect to the dashboard
                    window.location.href = 'Login.html'; // Redirect to dashboard
                } else {
                    showNotification('Access denied. You are not an approved user.');
                    loginBtn.textContent = "Login"; // Reset button text
                }
            }).catch(error => {
                console.error('Error checking approval status:', error);
                showNotification('Error checking approval status.');
                loginBtn.textContent = "Login"; // Reset button text on error
            });
        })
        .catch(error => {
            console.error('Login failed:', error);
            showNotification('Invalid email or password.');
            loginBtn.textContent = "Login"; // Reset button text on failure
        });
}





// Function to display notifications
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.innerText = message;
    notification.style.display = 'block';

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

});


