// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, sendPasswordResetEmail, confirmPasswordReset } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAWfUozol7OfQTfL0T8hKVOPuc5xnrKLrA",
    authDomain: "grievance-redressal-syst-90620.firebaseapp.com",
    databaseURL: "https://grievance-redressal-syst-90620-default-rtdb.firebaseio.com",
    projectId: "grievance-redressal-syst-90620",
    storageBucket: "grievance-redressal-syst-90620.appspot.com",
    messagingSenderId: "992036570800",
    appId: "1:992036570800:web:d638b0fcac8e70aba91d75",
    measurementId: "G-Q2MRYNXFT8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Function to send reset password email
function sendResetEmail() {
    const email = document.getElementById('email').value.trim();
    const messageElement = document.getElementById('message');

    // If email is empty, display a message and return
    if (!email) {
        messageElement.innerText = "Please enter your email.";
        messageElement.style.color = "red";
        // Hide the message after 2 seconds
        setTimeout(() => {
            messageElement.innerText = "";
        }, 2000);
        return;
    }

    // Check if the email exists in any of the approved lists or grievance members
    isEmailApproved(email).then((isApproved) => {
        if (isApproved) {
            // Send password reset email if the email is approved
            sendPasswordResetEmail(auth, email)
                .then(() => {
                    messageElement.innerText = "Password reset email sent! Check your inbox.";
                    messageElement.style.color = "green";
                    // Hide the success message after 2 seconds
                    setTimeout(() => {
                        messageElement.innerText = "";
                    }, 5000);
                })
                .catch((error) => {
                    messageElement.innerText = error.message;
                    messageElement.style.color = "red";
                    // Hide the error message after 2 seconds
                    setTimeout(() => {
                        messageElement.innerText = "";
                    }, 2000);
                });
        } else {
            // If the email is not found in any list, show an error message
            messageElement.innerText = "Email does not exist.";
            messageElement.style.color = "red";
            // Hide the error message after 2 seconds
            setTimeout(() => {
                messageElement.innerText = "";
            }, 2000);
        }
    }).catch((error) => {
        console.error("Error checking email approval:", error);
        messageElement.innerText = "An error occurred while checking email.";
        messageElement.style.color = "red";
        // Hide the error message after 2 seconds
        setTimeout(() => {
            messageElement.innerText = "";
        }, 2000);
    });
}

// Check if email exists in the approved list or admin list
function isEmailApproved(email) {
    // References to Firebase approved users data
    const studentsRef = ref(database, 'approvedStudents');
    const teachersRef = ref(database, 'approvedTeachers');
    const staffRef = ref(database, 'approvedStaff');
    const membersRef = ref(database, 'members');
    const adminRef = ref(database, 'admins/admin1/email'); // Admin email reference

    return new Promise((resolve, reject) => {
        // Fetch all approved students, teachers, staff, members, and admin concurrently
        Promise.all([
            get(studentsRef),
            get(teachersRef),
            get(staffRef),
            get(membersRef),
            get(adminRef)
        ])
        .then(([studentsSnapshot, teachersSnapshot, staffSnapshot, membersSnapshot, adminSnapshot]) => {
            let isApproved = false;

            // Check if email matches any approved student
            if (studentsSnapshot.exists()) {
                const students = studentsSnapshot.val();
                if (Object.values(students).some(user => user.email === email)) {
                    isApproved = true;
                }
            }

            // Check if email matches any approved teacher
            if (!isApproved && teachersSnapshot.exists()) {
                const teachers = teachersSnapshot.val();
                if (Object.values(teachers).some(user => user.email === email)) {
                    isApproved = true;
                }
            }

            // Check if email matches any approved staff
            if (!isApproved && staffSnapshot.exists()) {
                const staff = staffSnapshot.val();
                if (Object.values(staff).some(user => user.email === email)) {
                    isApproved = true;
                }
            }

            // Check if email matches any grievance member
            if (!isApproved && membersSnapshot.exists()) {
                const members = membersSnapshot.val();
                if (Object.values(members).some(user => user.email === email)) {
                    isApproved = true;
                }
            }

            // Check if email matches admin email
            if (!isApproved && adminSnapshot.exists()) {
                const adminEmail = adminSnapshot.val();
                if (email === adminEmail) {
                    isApproved = true;
                }
            }

            resolve(isApproved);
        })
        .catch(error => {
            console.error("Error checking email approval:", error);
            reject(error);
        });
    });
}


// Function to update the password for admin only
async function updateAdminPassword(oobCode, newPassword, email) {
    

    try {
        // Confirm the password reset request
        await confirmPasswordReset(auth, oobCode, newPassword);
        console.log("Admin password has been updated successfully in Firebase Auth.");

        // Check if the email belongs to the admin
        const adminRef = ref(database, 'admins/admin1');
        const snapshot = await get(adminRef);
        
        if (snapshot.exists()) {
            const adminData = snapshot.val();
            
            // Check if the email in the database matches the current email
            if (adminData.email === email) {
                // Update the password in Realtime Database
                await update(adminRef, { password: newPassword });
                console.log("Admin password has been updated in Firebase Realtime Database.");
            } else {
                console.error("Error: The email does not match the registered admin email.");
            }
        } else {
            console.error("Error: Admin not found in the database.");
        }
    } catch (error) {
        console.error("Error updating admin password:", error.message);
    }
}

// Make the function available globally
window.updateAdminPassword = updateAdminPassword;

// Make functions available in global scope
window.sendResetEmail = sendResetEmail;
// window.updatePassword = updatePassword;


