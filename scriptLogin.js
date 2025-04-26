import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get, set, update, push, child, query, orderByChild,onValue} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth,onAuthStateChanged,EmailAuthProvider, reauthenticateWithCredential,updatePassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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
const auth = getAuth();




function showSection(sectionId) {
    document.querySelectorAll('.content').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}
window.showSection = showSection;

function signOut() {
    window.location.href = 'index.html'; // Redirect to login page
}
window.signOut = signOut;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('edit-profile-form').addEventListener('submit', handleFormSubmit);
});

function handleFormSubmit(event) {
    event.preventDefault(); // Prevent default form submission

    const user = auth.currentUser; // Get currently logged-in user

    if (!user) {
        showCustomAlert("You need to log in to update your profile.");
        return;
    }

    const loggedInUserEmail = user.email; // Get the logged-in user's email

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const contactNumber = document.getElementById('contact-number').value;

    // Ensure the entered email matches the logged-in user's email
    if (email !== loggedInUserEmail) {
        showCustomAlert("Incorrect Email. Please check it.");
        return;
    }

    const studentsRef = ref(database, 'approvedStudents');
    const teachersRef = ref(database, 'approvedTeachers');
    const staffRef = ref(database, 'approvedStaff');

    return new Promise((resolve, reject) => {
        // Fetch all approved students, teachers, and staff concurrently
        Promise.all([
            get(studentsRef),
            get(teachersRef),
            get(staffRef)
        ])
        .then(([studentsSnapshot, teachersSnapshot, staffSnapshot]) => {
            let isApproved = false;
            let targetList = '';
            let userKey = null;

            // Check if email matches any approved student
            if (studentsSnapshot.exists()) {
                const students = studentsSnapshot.val();
                for (const [key, user] of Object.entries(students)) {
                    if (user.email === email) {
                        isApproved = true;
                        targetList = 'approvedStudents';
                        userKey = key;
                        break;
                    }
                }
            }

            // Check if email matches any approved teacher
            if (!isApproved && teachersSnapshot.exists()) {
                const teachers = teachersSnapshot.val();
                for (const [key, user] of Object.entries(teachers)) {
                    if (user.email === email) {
                        isApproved = true;
                        targetList = 'approvedTeachers';
                        userKey = key;
                        break;
                    }
                }
            }

            // Check if email matches any approved staff
            if (!isApproved && staffSnapshot.exists()) {
                const staff = staffSnapshot.val();
                for (const [key, user] of Object.entries(staff)) {
                    if (user.email === email) {
                        isApproved = true;
                        targetList = 'approvedStaff';
                        userKey = key;
                        break;
                    }
                }
            }

            // Update name and contact number if a match is found
            if (isApproved && userKey) {
                const userRef = ref(database, `${targetList}/${userKey}`);
                const updatedData = {
                    name: name,
                    mobile_no: contactNumber
                };

                update(userRef, updatedData)
                    .then(() => {
                        console.log(`Updated ${targetList} user with email ${email}:`, updatedData);
                        showCustomAlert("Profile updated successfully.");
                        // Clear the form fields after successful update
                        document.getElementById("edit-profile-form").reset();
                        resolve(true);
                    })
                    .catch(error => {
                        console.error(`Error updating ${targetList} user:`, error);
                        reject(error);
                    });
            } else {
                console.log(`Email ${email} is not found in any approved list.`);
                showCustomAlert("Please enter correct old email.");
                resolve(false);
            }
        })
        .catch(error => {
            console.error("Error checking email approval:", error);
            reject(error);
        });
    });
}    

// Function to show the custom alert box in the center
function showCustomAlert(message) {
    const alertBox = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('custom-alert-message');
    
    // Set the alert message
    alertMessage.textContent = message;

    // Display the alert box
    alertBox.style.display = 'block';

    // Hide the alert box after 2 seconds
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 2000);
}



let currentUserUID = null; // Store the UID globally

// Auto-fill Grievant Type and Name based on login
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserUID = user.uid; // Store the UID globally
        console.log("Logged-in User UID:", currentUserUID);

        // Check in approvedStudents, approvedTeachers, and approvedStaff
        const studentsRef = ref(database, `approvedStudents/${currentUserUID}`);
        const teachersRef = ref(database, `approvedTeachers/${currentUserUID}`);
        const staffRef = ref(database, `approvedStaff/${currentUserUID}`);

        // Fetch user details from Firebase
        try {
            let userData = null;
            let role = '';

            const studentSnapshot = await get(studentsRef);
            if (studentSnapshot.exists()) {
                userData = studentSnapshot.val();
                role = "Student";
            }

            const teacherSnapshot = await get(teachersRef);
            if (teacherSnapshot.exists()) {
                userData = teacherSnapshot.val();
                role = "Teacher";
            }

            const staffSnapshot = await get(staffRef);
            if (staffSnapshot.exists()) {
                userData = staffSnapshot.val();
                role = "Staff";
            }

            if (userData) {
                console.log("User Data Found:", userData);

                // Auto-fill fields
                document.getElementById("grievant-type").value = role;
                document.getElementById("grievant-name").value = userData.name || "";
                document.getElementById("grievant-type").setAttribute("readonly", true);
                document.getElementById("grievant-name").setAttribute("readonly", true);

            } else {
                console.log("User data not found.");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    } else {
        console.log("No user is logged in.");
    }
});

// Form Submission: Push Grievance Data to Firebase
document.getElementById('post-grievance-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    if (!currentUserUID) {
        alert("You must be logged in to submit a grievance.");
        return;
    }

    // Collect form data
    const grievantTypeField = document.getElementById('grievant-type');
    const grievantNameField = document.getElementById('grievant-name');
    const grievanceTitleField = document.getElementById('grievance-title');
    const grievanceDescriptionField = document.getElementById('grievance-description');

    const grievantType = grievantTypeField.value;
    const grievantName = grievantNameField.value;
    const grievanceTitle = grievanceTitleField.value;
    const grievanceDescription = grievanceDescriptionField.value;

    // Generate unique grievance number and ID
    const grievanceNumber = 'CPN-' + Math.floor(10000 + Math.random() * 9000000);
    const grievantID = 'GR-' + Math.floor(100000 + Math.random() * 9000000);
    const grievanceDate = new Date().toLocaleDateString('en-GB'); // Format: dd-mm-yyyy

    // Create initial reply
    const initialReply = {
        user: grievantName,
        date: grievanceDate,
        message: grievanceDescription
    };

    // Create grievance object
    const grievanceData = { 
        grievantType, 
        grievantName, 
        grievanceTitle, 
        grievanceDescription, 
        grievanceNumber, 
        grievanceDate, 
        grievantID, 
        status: 'Open',
        replies: [initialReply] // Initial reply stored here
    };

    // Reference to the grievances node using the user's UID
    const grievancesRef = ref(database, `grievances/${currentUserUID}`);

    // Use `push()` instead of `set()` to allow multiple grievances
    push(grievancesRef, grievanceData)
        .then(() => {
            // Show success message
            document.getElementById('post-grievance-success').style.display = 'block';

            // Reset only specific form fields (Keep `grievantType` & `grievantName`)
            grievanceTitleField.value = "";
            grievanceDescriptionField.value = "";

            // Hide success message after 3 seconds
            setTimeout(() => {
                document.getElementById('post-grievance-success').style.display = 'none';
            }, 3000);
        })
        .catch((error) => {
            console.error('Error saving grievance to Firebase:', error);
        });
});

// Wait for Firebase authentication state to load before displaying grievances
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUserUID = user.uid; // Ensure UID is set
        displayGrievancesRealTime(); // Use real-time updates
    } else {
        currentUserUID = null;
        const tbody = document.querySelector('#my-grievance-table tbody');
        tbody.innerHTML = '<tr><td colspan="6">Please log in to view grievances.</td></tr>';
    }
});

// Function to display grievances in real-time
function displayGrievancesRealTime() {
    if (!currentUserUID) return; // Prevent function from running if not logged in

    const tbody = document.querySelector('#my-grievance-table tbody');
    tbody.innerHTML = ''; // Clear existing rows

    // Reference to the grievances in Firebase
    const grievancesRef = ref(database, `grievances/${currentUserUID}`);

    // Listen for real-time changes
    onValue(grievancesRef, (snapshot) => {
        tbody.innerHTML = ''; // Clear table before updating

        if (snapshot.exists()) {
            const grievances = snapshot.val();
            const grievancesArray = Object.entries(grievances);

            if (grievancesArray.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">No grievances posted yet.</td></tr>';
                return;
            }

            grievancesArray.forEach(([grievanceKey, grievance], index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${grievance.grievantID}</td>
                    <td>${grievance.grievanceTitle}</td>
                    <td>${grievance.grievanceDescription}</td>
                    <td>${grievance.status}</td>
                    <td>
                        <button class="view-button" 
                            style="color: white; background-color: #1abc9c; padding: 5px; border: none; border-radius: 4px; cursor: pointer;" 
                            data-key="${grievanceKey}">View
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Add event listeners to the View buttons
            document.querySelectorAll('.view-button').forEach(button => {
                button.addEventListener('click', function() {
                    const grievanceKey = this.getAttribute('data-key');
                    showGrievanceModal(grievances[grievanceKey]);
                });
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="6">No grievances posted yet.</td></tr>';
        }
    }, (error) => {
        console.error('Error fetching grievances from Firebase:', error);
    });
}
function showGrievanceModal(grievance) {
    document.getElementById('modal-grievant-id').innerText = grievance.grievantID;
    document.getElementById('modal-grievant-name').innerText = grievance.grievantName || 'N/A';
    document.getElementById('modal-title').innerText = grievance.grievanceTitle;
    document.getElementById('modal-description').innerText = grievance.grievanceDescription;
    document.getElementById('modal-date').innerText = grievance.grievanceDate || 'N/A';
    document.getElementById('modal-status').innerText = grievance.status;

    // Display all replies in chronological order
    const allReplies = grievance.replies || [];
    let contentHtml = '';

    allReplies.forEach(reply => {
        const { user, date, message } = reply;
        contentHtml += `<strong>${user}:</strong> ${date}<br>${message}<br><br>`;
    });

    if (allReplies.length === 0) {
        contentHtml = 'No replies yet';
    }

    document.getElementById('modal-reply').innerHTML = contentHtml;

    // Show modal and overlay
    document.getElementById('grievance-modal').style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';

    const reopenButton = document.getElementById('reopen-button');
    const satisfiedButton = document.getElementById('satisfied-button');
    const feedbackRow = document.getElementById('feedback-row');

    // Initially hide the feedback row
    feedbackRow.style.display = 'none';

    // Show "Re-Open" button only if status is NOT "Satisfied"
    reopenButton.style.display = grievance.status === 'Satisfied' ? 'none' : 'inline-block';

    reopenButton.onclick = function () {
        feedbackRow.style.display = 'table-row'; // Show feedback box when clicking Re-Open
    };

    satisfiedButton.onclick = function () {
        updateGrievanceStatus(grievance.grievantID, 'Satisfied');
        
        // ✅ Hide "Re-Open" button ONLY when the status is updated to "Satisfied"
        document.getElementById('modal-status').innerText = 'Satisfied';
        reopenButton.style.display = 'none';  
    };

    document.getElementById('submit-feedback-button').onclick = function () {
        const feedback = document.getElementById('feedback-text').value;
        if (feedback.trim() !== '') {
            addFeedbackToGrievance(grievance.grievantID, feedback, "User Reply");
        } else {
            alert("Please enter feedback before submitting.");
        }
    };
}



function addFeedbackToGrievance(grievantID, feedback, userType) {
    const grievancesRef = ref(database, `grievances/${currentUserUID}`);


    // Fetch grievances from Firebase
    get(grievancesRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const grievances = snapshot.val();
                const grievanceKey = Object.keys(grievances).find(
                    key => grievances[key].grievantID === grievantID
                );

                if (grievanceKey) {
                    const date = new Date().toLocaleDateString();
                    const formattedReply = {
                        user: userType,
                        date: date,
                        message: feedback
                    };

                    // Append reply to the list of replies
                    if (!grievances[grievanceKey].replies) {
                        grievances[grievanceKey].replies = [];
                    }
                    grievances[grievanceKey].replies.push(formattedReply);

                    // Update grievance status to 'Re-Open'
                    grievances[grievanceKey].status = 'Re-Open';

                    // Update the grievance in Firebase
                    const grievanceToUpdateRef = ref(database, `grievances/${currentUserUID}/${grievanceKey}`);
                    set(grievanceToUpdateRef, grievances[grievanceKey])
                        .then(() => {
                            // Update status in modal and refresh replies
                            document.getElementById('modal-status').innerText = 'Re-Open';
                            showGrievanceModal(grievances[grievanceKey]);

                            // Hide feedback row and clear feedback input
                            document.getElementById('feedback-row').style.display = 'none';
                            document.getElementById('feedback-text').value = '';

                            // Refresh grievances display
                            displayGrievancesRealTime();
                        })
                        .catch((error) => {
                            console.error('Error updating grievance in Firebase:', error);
                        });
                } else {
                    console.error('Grievance with the specified ID not found.');
                }
            } else {
                console.error('No grievances found in Firebase.');
            }
        })
        .catch((error) => {
            console.error('Error fetching grievances from Firebase:', error);
        });
}


// Function to update grievance status in localStorage
function updateGrievanceStatus(grievantID, newStatus) {
    const grievancesRef = ref(database, `grievances/${currentUserUID}`);

    // Fetch grievances from Firebase
    get(grievancesRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const grievances = snapshot.val();
                const grievanceKey = Object.keys(grievances).find(
                    key => grievances[key].grievantID === grievantID
                );

                if (grievanceKey) {
                    // Update grievance status to the new status
                    grievances[grievanceKey].status = newStatus;

                    // Save the updated grievance back to Firebase
                    const grievanceToUpdateRef = ref(database, `grievances/${currentUserUID}/${grievanceKey}`);
                    set(grievanceToUpdateRef, grievances[grievanceKey])
                        .then(() => {
                            // Update modal status text and close modal
                            document.getElementById('modal-status').innerText = newStatus;
                            document.getElementById('grievance-modal').style.display = 'none';
                            document.getElementById('modal-overlay').style.display = 'none';

                            // Refresh grievances display
                            displayGrievances();
                        })
                        .catch((error) => {
                            console.error('Error updating grievance in Firebase:', error);
                        });
                } else {
                    console.error('Grievance with the specified ID not found.');
                }
            } else {
                console.error('No grievances found in Firebase.');
            }
        })
        .catch((error) => {
            console.error('Error fetching grievances from Firebase:', error);
        });
}


// Close modal when clicking the close button
document.getElementById('close-modal').addEventListener('click', function() {
    document.getElementById('grievance-modal').style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none';
});

// Call the function to display the data when the page loads
document.addEventListener('DOMContentLoaded', function() {
    displayGrievancesRealTime();
});




document.getElementById('change-password-form').addEventListener('submit', handlePasswordChange);
document.getElementById('new-password').addEventListener('input', checkPasswordStrength);
function showNotification(message) {
    const notification = document.getElementById("notification");
    const notificationMessage = document.getElementById("notificationMessage");

    // Ensure the notification and message elements exist in the DOM
    if (notification && notificationMessage) {
        notificationMessage.textContent = message; // Set the message
        notification.style.display = "block"; // Show the notification
    } else {
        console.error("Notification elements not found in the DOM.");
    }
}



function checkPasswordStrength() {
    const password = document.getElementById('new-password').value;
    const strengthBars = document.querySelectorAll('.strength-bar');
    const requirements = {
        length: /(?=.{8,})/,
        uppercase: /(?=.*[A-Z])/,
        number: /(?=.*\d)/,
        specialChar: /(?=.[!@#$%^&])/,
    };

    let strength = 0;
    if (requirements.length.test(password)) strength++;
    if (requirements.uppercase.test(password)) strength++;
    if (requirements.number.test(password)) strength++;
    if (requirements.specialChar.test(password)) strength++;

    strengthBars.forEach((bar, index) => {
        if (index < strength) {
            bar.classList.add('strong');
            bar.classList.remove('medium');
        } else if (index === strength) {
            bar.classList.add('medium');
            bar.classList.remove('strong');
        } else {
            bar.classList.remove('medium', 'strong');
        }
    });

    document.getElementById('length-requirement').classList.toggle('valid', requirements.length.test(password));
    document.getElementById('uppercase-requirement').classList.toggle('valid', requirements.uppercase.test(password));
    document.getElementById('number-requirement').classList.toggle('valid', requirements.number.test(password));
    document.getElementById('special-char-requirement').classList.toggle('valid', requirements.specialChar.test(password));
}



function handlePasswordChange(event) {
    event.preventDefault();

    const currentPassword = document.getElementById('current-password').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();


    if (!currentPassword || !newPassword || !confirmPassword ) {
        console.log("All fields are required.");
        return;
    }
      // Validate passwords
      if (!validatePasswordChange(currentPassword, newPassword, confirmPassword)) {
        return; // Exit if validation fails
    }

    if (newPassword !== confirmPassword) {
       showNotification("New password and confirm password do not match.");
        return;
    }

// References to Firebase approved users data
const studentsRef = ref(database, 'approvedStudents');
const teachersRef = ref(database, 'approvedTeachers');
const staffRef = ref(database, 'approvedStaff');

Promise.all([get(studentsRef), get(teachersRef), get(staffRef)])
    .then(([studentsSnapshot, teachersSnapshot, staffSnapshot]) => {
        let isMatch = false;
        let targetList = '';
        let userKey = null;

        // Check if current password matches any student's password
        if (studentsSnapshot.exists()) {
            const students = studentsSnapshot.val();
            for (const [key, user] of Object.entries(students)) {
                if (user.password === currentPassword) {
                    isMatch = true;
                    targetList = 'approvedStudents';
                    userKey = key;
                    break;
                }
            }
        }

        // Check if current password matches any teacher's password
        if (!isMatch && teachersSnapshot.exists()) {
            const teachers = teachersSnapshot.val();
            for (const [key, user] of Object.entries(teachers)) {
                if (user.password === currentPassword) {
                    isMatch = true;
                    targetList = 'approvedTeachers';
                    userKey = key;
                    break;
                }
            }
        }

        // Check if current password matches any staff's password
        if (!isMatch && staffSnapshot.exists()) {
            const staff = staffSnapshot.val();
            for (const [key, user] of Object.entries(staff)) {
                if (user.password === currentPassword) {
                    isMatch = true;
                    targetList = 'approvedStaff';
                    userKey = key;
                    break;
                }
            }
        }

        if (isMatch && userKey) {
            const user = auth.currentUser;

            if (!user) {
                throw new Error("No user is logged in!");
            }

            // ✅ Step 1: Re-authenticate user before updating the password
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            return reauthenticateWithCredential(user, credential)
                .then(() => {
                    console.log("✅ Re-authentication successful!");

                    // ✅ Step 2: Update password in Firebase Authentication
                    return updatePassword(user, newPassword);
                })
                .then(() => {
                    console.log("✅ Password updated in Firebase Authentication!");

                    // ✅ Step 3: Update password in Firebase Realtime Database
                    const userRef = ref(database, `${targetList}/${userKey}`);
                    return update(userRef, { password: newPassword });
                })
                .then(() => {
                    console.log("✅ Password updated successfully.");
                    showNotification("Password updated successfully!");
                });
        } else {
            throw new Error("Current password is incorrect.");
        }
    })
    .catch(error => {
        console.error("❌ Error updating password:", error);
        // Handle incorrect password errors
        if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
            showNotification("❌ Incorrect current password. Please try again.");
        } else {
            showNotification(error.message);
        }
    });
}





function validatePasswordChange(currentPassword, newPassword, confirmPassword) {
    const passwordRequirements = {
        minLength: 8,
        hasUppercase: /[A-Z]/,
        hasNumber: /[0-9]/,
        hasSpecialChar: /[!@#$%^&*]/,
    };

    // Ensure new password is different from current password
    if (currentPassword === newPassword) {
        showNotification('New password cannot be the same as the current password.');
        return false;
    }

    // Check new password strength
    if (!passwordRequirements.hasUppercase.test(newPassword) ||
        !passwordRequirements.hasNumber.test(newPassword) ||
        !passwordRequirements.hasSpecialChar.test(newPassword) ||
        newPassword.length < passwordRequirements.minLength) {
            showNotification('New password does not meet the strength requirements.');
        return false;
    }

    // Ensure new password and confirm password match
    if (newPassword !== confirmPassword) {
        showNotification('New password and confirm password do not match.');
        return false;
    }

    return true;
}

document.addEventListener('DOMContentLoaded', () => {

 // Set default "Loading..." message
document.getElementById('Name').textContent = "Loading...";

// Check if the user is logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        const userUID = user.uid;
        let userName = "User"; // Default name

        // Function to fetch user name from a given reference
        const fetchUserName = (userRef) => {
            onValue(userRef, (snapshot) => {
                if (snapshot.exists()) {
                    userName = snapshot.val().name;
                    document.getElementById('Name').textContent = `Welcome ${userName}!!`;
                }
            }, { onlyOnce: true }); // Fetch data only once to avoid unnecessary re-renders
        };

        // Check in Students, Teachers, and Staff
        fetchUserName(ref(database, `approvedStudents/${userUID}`));
        fetchUserName(ref(database, `approvedTeachers/${userUID}`));
        fetchUserName(ref(database, `approvedStaff/${userUID}`));
    } else {
        document.getElementById('Name').textContent = "Welcome";
    }
});
    
document.querySelectorAll('.toggle-password').forEach(toggle => {
    toggle.addEventListener('click', () => {
        const inputId = toggle.getAttribute('data-input');
        const inputElement = document.getElementById(inputId);
        
        // Toggle between password and text input types
        if (inputElement.type === 'password') {
            inputElement.type = 'text';
            toggle.classList.remove('fa-eye');
            toggle.classList.add('fa-eye-slash');
        } else {
            inputElement.type = 'password';
            toggle.classList.remove('fa-eye-slash');
            toggle.classList.add('fa-eye');
        }
    });
});
});

document.addEventListener('DOMContentLoaded', () => {
    // Function to show notification
    function showNotification(message) {
        const notification = document.getElementById("notification");
        const notificationMessage = document.getElementById("notificationMessage");
        notificationMessage.textContent = message; // Set the message
        notification.style.display = "block"; // Show the notification
    }

    // Add event listener to OK button to hide the notification and clear the form
    document.getElementById("notificationOkButton").onclick = function() {
        // Hide the notification
        document.getElementById("notification").style.display = "none";
        
        // Clear the form fields
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    };
});



