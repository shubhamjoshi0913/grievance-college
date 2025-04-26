
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, get, push, remove,update, child,onValue} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth,EmailAuthProvider, updatePassword, createUserWithEmailAndPassword,deleteUser,sendEmailVerification,reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
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

// Initialize Firebase and database
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth();

document.addEventListener('DOMContentLoaded', () => {
    // Handle dropdown functionality
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.addEventListener('click', () => {
            dropdown.classList.toggle('active');
            const content = dropdown.querySelector('.dropdown-content');
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });
    });

    // Handle sidebar link clicks to show the relevant section
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            const targetId = link.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });


        // Handle sign-out button click
        const signOutBtn = document.getElementById('sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', signOut);
        } else {
            console.error('Sign-out button not found!');
        }


    // Handle form submissions
    function handleFormSubmit(formId, successMessageId) {
        document.getElementById(formId)?.addEventListener('submit', (event) => {
            event.preventDefault();
            // Perform form submission logic here

            // Show success message
            const messageElement = document.getElementById(successMessageId);
            messageElement.style.display = 'block';

            // Clear the form fields
            document.getElementById(formId).reset();
        });
    }

   
// Handle change password form submission (for admin only)
document.getElementById('change-password-form')?.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    if (!checkPasswordMatch()) return; // Ensure new passwords match and are valid

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;

    const user = auth.currentUser; // Get the currently logged-in admin user

    if (!user) {
        alert('No admin is currently logged in.');
        return;
    }

    const adminRef = ref(database, 'admins/admin1'); // Admin details in Firebase Realtime Database

    try {
        // Reauthenticate the admin before changing the password
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update password in Firebase Authentication
        await updatePassword(user, newPassword);

        // Update password in Firebase Realtime Database
        const snapshot = await get(adminRef);
        if (snapshot.exists()) {
            const adminData = snapshot.val();
            await set(adminRef, { ...adminData, password: newPassword }); // Update the password field
        }

        alert('Password updated successfully.');

    } catch (error) {
        console.error('Error updating password:', error);

        // Explicitly check for incorrect password error
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            alert('Current password is incorrect! Please try again.');
        } else if (error.code === 'auth/too-many-requests') {
            alert('Too many incorrect attempts. Please try again later.');
        } else {
            alert(error.message);
        }
    }

    // Clear the form fields
    document.getElementById('change-password-form').reset();
});



// Show success message and hide after 2 seconds
function showSuccessMessage() {
    const messageElement = document.getElementById('change-password-success-message');
    if (messageElement) {
        messageElement.style.display = 'block';
        
        // Hide the success message after 2 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 2000);
    }
}


});
 
// Function to check if new passwords match and validate the password strength
function checkPasswordMatch() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;
    const errorElement = document.getElementById('password-error');

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&()+}{":;'?/>.<,])[A-Za-z\d!@#$%^&*()+}{":;'?/>.<,]{8,}$/;

    let valid = true;
    
    // Reset all condition styles to red before checking
    resetPasswordConditions();

    // Check if the new password is not the same as the current password, but only on form submission
    if (currentPassword === newPassword) {
        errorElement.textContent = 'New password should not be the same as the current password.';
        valid = false;

        // Hide the error message after 2 seconds
        setTimeout(() => {
            errorElement.textContent = '';  // Clear the error message after 2 seconds
        }, 2000);
    }

    // Check password strength requirements
    if (newPassword.length >= 8) {
        document.getElementById('min-length').style.color = 'green';
    }

    if (/[A-Z]/.test(newPassword)) {
        document.getElementById('uppercase').style.color = 'green';
    }

    if (/\d/.test(newPassword)) {
        document.getElementById('number').style.color = 'green';
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        document.getElementById('special-char').style.color = 'green';
    }

    // Only show "Passwords do not match!" error if both fields are filled
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match!';
        valid = false;

        // Hide the error message after 2 seconds
        setTimeout(() => {
            errorElement.textContent = '';  // Clear the error message after 2 seconds
        }, 2000);
    }

    if (valid) {
        document.getElementById('password-error').textContent = ''; // Clear any previous error message
    }

    return valid;
}
// Reset password condition styles (turn everything to red initially)
function resetPasswordConditions() {
    document.getElementById('min-length').style.color = 'red';
    document.getElementById('uppercase').style.color = 'red';
    document.getElementById('number').style.color = 'red';
    document.getElementById('special-char').style.color = 'red';
}

// Show error message for a brief period (2 seconds)
function showPasswordError(message) {
    const errorElement = document.getElementById('password-error');
    errorElement.textContent = message;
    setTimeout(() => {
        errorElement.textContent = ''; // Hide error after 2 seconds
    }, 2000);
}

// Toggle password visibility
document.addEventListener('DOMContentLoaded', () => {
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

// Listen for changes in the "New Password" field to dynamically check conditions
document.getElementById('new-password').addEventListener('input', function () {
    checkPasswordMatch(); // Re-validate every time the user types in the password field
});

 // Sign out function
 function signOut() {
    window.location.href = 'index.html'; // Adjust the URL to match your login page
 }

 // Reference to the Firebase database for members
const membersRef = ref(database, 'members');

// Function to populate the table dynamically
function populateTable(snapshot) {
    const tableBody = document.querySelector('#members-table tbody');
    tableBody.innerHTML = ''; // Clear the table before populating

    if (snapshot.exists()) {
        const members = snapshot.val();
        Object.entries(members).forEach(([key, member], index) => {
            const row = document.createElement('tr');
            row.setAttribute('data-key', key); // Store Firebase key for easy deletion
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${member.name}</td>
                <td>${member.gender}</td>
                <td>${member.designation}</td>
                <td>${member.email}</td>
                <td>${member.contact}</td>
                <td>
                    <button class="action-button" onclick="deleteMember('${key}', '${member.email}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        console.log('No members found.');
    }
}

// 🔄 **Real-time listener for changes in Firebase**
onValue(membersRef, (snapshot) => {
    populateTable(snapshot);
});

// Function to delete the currently authenticated user from Firebase Authentication
async function deleteUserFromAuth() {
    const user = auth.currentUser;
    if (!user) {
        console.log("No user is currently authenticated.");
        return;
    }

    try {
        await deleteUser(user);
        console.log("Member deleted from Firebase Authentication.");
        alert("Member deleted successfully.");
    } catch (error) {
        console.error("Error deleting member from Firebase Authentication:", error);
        alert(`Error deleting member from Firebase Authentication: ${error.message}`);
    }
}

// Function to delete a member from Firebase Realtime Database
window.deleteMember = function(userKey, email) {
    const confirmation = confirm("Are you sure you want to delete this member?");
    if (!confirmation) return;

    // Delete the user from Firebase Authentication (if they are logged in)
    if (auth.currentUser && auth.currentUser.email === email) {
        deleteUserFromAuth();
    } else {
        console.log("User must be logged in to delete their account.");
    }

    // Delete member from Firebase Realtime Database
    const memberRef = ref(database, `members/${userKey}`);
    remove(memberRef)
        .then(() => {
            console.log("Member deleted from Firebase Realtime Database.");
        })
        .catch(error => {
            console.error("Error deleting member from Firebase Realtime Database:", error);
        });
};

// Function to check if email already exists in Firebase
function isEmailTaken(email) {
    return get(membersRef)
        .then(snapshot => {
            if (snapshot.exists()) {
                const members = snapshot.val();
                return Object.values(members).some(member => member.email === email);
            }
            return false;
        })
        .catch(error => {
            console.error('Error checking email:', error);
            return false;
        });
}

// Function to check if contact number already exists in Firebase
function isContactTaken(contact) {
    return get(membersRef)
        .then(snapshot => {
            if (snapshot.exists()) {
                const members = snapshot.val();
                return Object.values(members).some(member => member.contact === contact);
            }
            return false;
        })
        .catch(error => {
            console.error('Error checking contact:', error);
            return false;
        });
}

// Function to validate contact number (must be exactly 10 digits)
function isValidContact(contact) {
    return contact.length === 10 && /^\d+$/.test(contact);
}

document.getElementById('add-member-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent normal form submission

    // Get form values
    const name = document.getElementById('member-name').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const designation = document.getElementById('member-degination').value;
    const email = document.getElementById('member-email').value;
    const contact = document.getElementById('member-contact').value;
    const password = document.getElementById('member-password').value;
    const submitButton = document.getElementById('submit-button'); // Add Member button

    // Hide all error messages initially
    document.getElementById('email-error').style.display = 'none';
    document.getElementById('contact-error').style.display = 'none';
    document.getElementById('contact-length-error').style.display = 'none';

    let isValid = true;

    // Check if email already exists
    if (await isEmailTaken(email)) {
        showErrorMessage('email-error');
        isValid = false;
    }

    // Check if contact number already exists
    if (await isContactTaken(contact)) {
        showErrorMessage('contact-error');
        isValid = false;
    }

    // Validate contact number length (must be exactly 10 digits)
    if (!isValidContact(contact)) {
        showErrorMessage('contact-length-error');
        isValid = false;
    }

    if (!isValid) return; // Stop execution if validation fails

    try {
        // ✅ Register the user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user; // Get Firebase Authentication UID

        // ✅ Send email verification
        await sendEmailVerification(user);
        alert('Verification email sent. Please verify your email within 3 minutes.');

        // 🔴 Hide Add Member button immediately
        submitButton.style.display = 'none';

        // ⏳ Set a timer to delete the user if they don't verify within 3 minutes (180,000ms)
        const deleteUserTimeout = setTimeout(async () => {
            await user.reload(); // Refresh user data
            if (!user.emailVerified) {
                await user.delete(); // Delete user from Firebase Authentication
                alert('Your verification time expired. Please sign up again.');
                submitButton.style.display = 'block'; // Show button again for retry
            }
        }, 180000); // 180,000ms = 3 minutes

        // 🔄 Polling for email verification
        const checkEmailVerification = setInterval(async () => {
            await user.reload(); // Refresh user data
            if (user.emailVerified) {
                clearInterval(checkEmailVerification); // Stop polling
                clearTimeout(deleteUserTimeout); // Cancel auto-delete if verified

                // ✅ Save user data in Realtime Database after email verification
                await set(ref(database, 'members/' + user.uid), {
                    uid: user.uid,
                    name: name,
                    gender: gender,
                    designation: designation,
                    
                    email: email,
                    contact: contact,
                    isLoggedIn: false
                });

                alert('Grievance member added successfully after email verification!');

                // ✅ Clear the form
                document.getElementById('add-member-form').reset();

                // ✅ Show Add Member button again
                submitButton.style.display = 'block';
            }
        }, 3000); // Check every 3 seconds
    } catch (error) {
        console.error('Registration failed:', error);
        alert(error);
        submitButton.style.display = 'block'; // Show button if registration fails
    }
});

// Function to show and hide error messages
function showErrorMessage(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 2000);
}

// Populate the table on page load
document.addEventListener('DOMContentLoaded', populateTable);








    


   // Function to display pending teachers from Firebase
   function displayStudents() {
    const studentsRef = ref(database, 'students/');
    get(studentsRef).then(snapshot => {
        const tbody = document.querySelector('#studentTable tbody');
        tbody.innerHTML = ''; // Clear existing entries

        if (snapshot.exists()) {
            const students = snapshot.val();  // Now we have the student data as an object
            Object.keys(students).forEach((key, index) => {
                const student = students[key];
                const row = document.createElement('tr');
                row.innerHTML = `
                   <td>${index + 1}</td>
                    <td>${student.name}</td>
                    <td>${student.gender}</td>
                    <td>${student.course}</td>
                    <td>${student.batch}</td>
                    <td>${student.roll_no}</td>
                    <td>${student.email}</td>
                    <td>${student.mobile_no}</td>
                    <td>
                        <button class="approveStudentBtn" data-key="${key}">Approve</button>
                        <button class="deleteStudentBtn" data-key="${key}">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Attach event listeners for the buttons
            document.querySelectorAll('.approveStudentBtn').forEach(button => {
                button.addEventListener('click', function () {
                    const key = this.dataset.key;
                    approveStudent(key); // Approve pending student
                });
            });

            document.querySelectorAll('.deleteStudentBtn').forEach(button => {
                button.addEventListener('click', function () {
                    const key = this.dataset.key;
                    deleteStudent(key); // Delete pending student
                });
            });
        }
    });
}


// Function to display approved teachers from Firebase
function displayApprovedStudents() {
    const approvedStudentsRef = ref(database, 'approvedStudents/');
    get(approvedStudentsRef).then(snapshot => {
        const tbody = document.querySelector('#approvedStudents tbody');
        tbody.innerHTML = ''; // Clear existing entries

        if (snapshot.exists()) {
            const approvedStudents = snapshot.val();
            Object.keys(approvedStudents).forEach((key, index) => {
                const student = approvedStudents[key];
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${student.name}</td>
                    <td>${student.gender}</td>
                    <td>${student.course}</td>
                    <td>${student.batch}</td>
                    <td>${student.roll_no}</td>
                    <td>${student.email}</td>
                    <td>${student.mobile_no}</td>
                    <td><button class="deleteApprovedStudentBtn" data-key="${key}">Delete</button></td>
                `;
                tbody.appendChild(row);
            });

            document.querySelectorAll('.deleteApprovedStudentBtn').forEach(button => {
                button.addEventListener('click', function () {
                    const key = this.dataset.key;
                    deleteApprovedStudent(key); // Delete approved teacher
                });
            });
        }
    });
}
   

 


// Function to approve a pending student
function approveStudent(key) {
    // Show confirmation dialog
    const confirmApprove = confirm('Are you sure you want to approve this student?');

    if (confirmApprove) {
        const studentRef = ref(database, `students/${key}`);
        const approvedStudentRef = ref(database, `approvedStudents/${key}`); // Use the same key

        // Get the student data from the students node
        get(studentRef).then(snapshot => {
            if (snapshot.exists()) {
                const student = snapshot.val();

                // Move student to the approvedStudents node with the same key
                set(approvedStudentRef, student)
                    .then(() => {
                        console.log('Student approved successfully');

                        // Remove the student from the pending students list
                        remove(studentRef)
                            .then(() => {
                                console.log('Student removed from pending list');
                                
                                // Refresh the displayed lists
                                displayStudents();
                                displayApprovedStudents();
                            })
                            .catch(error => {
                                alert('Error removing student: ' + error.message);
                                console.error('Error removing student:', error);
                            });
                    })
                    .catch(error => {
                        alert('Error approving student: ' + error.message);
                        console.error('Error approving student:', error);
                    });
            } else {
                alert('Student data not found!');
            }
        }).catch(error => {
            alert('Error fetching student data: ' + error.message);
            console.error('Error fetching student data:', error);
        });
    } else {
        console.log('Student approval cancelled');
    }
}


// Function to delete student from Firebase Authentication (only if they are logged in)
async function deleteStudentAuth(email) {
    const user = auth.currentUser;

    if (user && user.email === email) {
        try {
            await deleteUser(user);
            console.log("✅ Student deleted from Firebase Authentication.");
            alert("✅ Student account deleted successfully from Authentication.");
        } catch (error) {
            console.error("❌ Error deleting student from Firebase Authentication:", error);
            alert(`❌ Error deleting student from Firebase Authentication: ${error.message}`);
        }
    } else {
        console.log("⚠️ User must be logged in to delete their account.");
    }
}

// Function to delete student from Firebase Realtime Database
function deleteStudent(key, email) {
    const confirmDelete = confirm('⚠️ Are you sure you want to delete this student?');

    if (confirmDelete) {
        const studentRef = ref(database, 'students/' + key);

        // ✅ 1️⃣ Delete from Firebase Authentication (Only if logged in)
        deleteStudentAuth(email);

        // ✅ 2️⃣ Delete from Firebase Realtime Database
        remove(studentRef)
            .then(() => {
                console.log('✅ Student deleted successfully from Realtime Database');
                alert('✅ Student deleted successfully from Database.');
                displayStudents(); // Refresh the displayed list
            })
            .catch(error => {
                alert('❌ Error deleting student from Realtime Database: ' + error.message);
                console.error("❌ Error deleting student: ", error);
            });
    } else {
        console.log('❌ Student deletion cancelled');
    }
}


// Function to delete student from Firebase Authentication (if logged in)
async function deleteApprovedStudentAuth(email) {
    if (auth.currentUser && auth.currentUser.email === email) {
        try {
            await deleteUser(auth.currentUser);
            console.log("Student deleted from Firebase Authentication.");
            alert("Student account deleted successfully.");
        } catch (error) {
            console.error("Error deleting student from Firebase Authentication:", error);
            alert(`Error deleting student from Firebase Authentication: ${error.message}`);
        }
    } else {
        console.log("User must be logged in to delete their account.");
    }
}

// Function to delete approved student from Firebase Realtime Database
function deleteApprovedStudent(key) {
    const confirmDelete = confirm('Are you sure you want to delete this approved student?');

    if (confirmDelete) {
        // Fetch student details to get their email
        const approvedStudentRef = ref(database, 'approvedStudents/' + key);
        get(approvedStudentRef).then(snapshot => {
            if (snapshot.exists()) {
                const studentData = snapshot.val();
                const studentEmail = studentData.email;

                // 1️⃣ Delete from Firebase Authentication (only if logged in)
                deleteApprovedStudentAuth(studentEmail);

                // 2️⃣ Delete from Firebase Realtime Database
                remove(approvedStudentRef)
                    .then(() => {
                        console.log('Approved student deleted successfully from Realtime Database');
                        displayApprovedStudents(); // Refresh the approved students list
                    })
                    .catch(error => {
                        alert('Error deleting approved student from Realtime Database: ' + error.message);
                        console.error("Error deleting approved student: ", error);
                    });

            } else {
                alert("Student not found in Realtime Database.");
            }
        }).catch(error => {
            console.error("Error fetching approved student details:", error);
        });
    } else {
        console.log('Approved student deletion cancelled');
    }
}





   // Function to display pending teachers from Firebase
function displayTeachers() {
    const teachersRef = ref(database, 'teachers/');
    get(teachersRef).then(snapshot => {
        const tbody = document.querySelector('#teacherTable tbody');
        tbody.innerHTML = ''; // Clear existing entries

        if (snapshot.exists()) {
            const teachers = snapshot.val();  // Now we have the teacher data as an object
            Object.keys(teachers).forEach((key, index) => {
                const teacher = teachers[key];
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${teacher.name}</td>
                    <td>${teacher.gender || 'N/A'}</td>
                    <td>${teacher.department || 'N/A'}</td>
                    <td>${teacher.designation || 'N/A'}</td>
                    <td>${teacher.email || 'N/A'}</td>
                    <td>${teacher.mobile_no || 'N/A'}</td>
                    <td>
                        <button class="approveTeacherBtn" data-key="${key}">Approve</button>
                        <button class="deleteTeacherBtn" data-key="${key}">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Attach event listeners for the buttons
            document.querySelectorAll('.approveTeacherBtn').forEach(button => {
                button.addEventListener('click', function () {
                    const key = this.dataset.key;
                    approveTeacher(key); // Approve pending teacher
                });
            });

            document.querySelectorAll('.deleteTeacherBtn').forEach(button => {
                button.addEventListener('click', function () {
                    const key = this.dataset.key;
                    deleteTeacher(key); // Delete pending teacher
                });
            });
        }
    });
}

// Function to display approved teachers from Firebase
function displayApprovedTeachers() {
    const approvedTeachersRef = ref(database, 'approvedTeachers/');
    get(approvedTeachersRef).then(snapshot => {
        const tbody = document.querySelector('#approvedTeachers tbody');
        tbody.innerHTML = ''; // Clear existing entries

        if (snapshot.exists()) {
            const approvedTeachers = snapshot.val();
            Object.keys(approvedTeachers).forEach((key, index) => {
                const teacher = approvedTeachers[key];
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${teacher.name}</td>
                    <td>${teacher.gender || 'N/A'}</td>
                    <td>${teacher.department || 'N/A'}</td>
                    <td>${teacher.designation || 'N/A'}</td>
                    <td>${teacher.email || 'N/A'}</td>
                    <td>${teacher.mobile_no || 'N/A'}</td>
                    <td><button class="deleteApprovedTeacherBtn" data-key="${key}">Delete</button></td>
                `;
                tbody.appendChild(row);
            });

            document.querySelectorAll('.deleteApprovedTeacherBtn').forEach(button => {
                button.addEventListener('click', function () {
                    const key = this.dataset.key;
                    deleteApprovedTeacher(key); // Delete approved teacher
                });
            });
        }
    });
}

// Function to approve a pending teacher
function approveTeacher(key) {
    // Show confirmation dialog
    const confirmApprove = confirm('Are you sure you want to approve this teacher?');

    if (confirmApprove) {
        const teachersRef = ref(database, `teachers`);
        const approvedTeachersRef = ref(database, `approvedTeachers/${key}`); // Ensure the same key is used

        // Get the teacher data from the teachers node
        get(teachersRef).then(snapshot => {
            const teachers = snapshot.val();
            const teacher = teachers[key];

            if (teacher) {
                // Store the teacher in the approvedTeachers node with the same unique key
                set(approvedTeachersRef, teacher).then(() => {
                    console.log('Teacher approved successfully');
                    
                    // Remove the teacher from the pending teachers list
                    const teacherRef = ref(database, `teachers/${key}`);
                    remove(teacherRef).then(() => {
                        console.log('Teacher removed from pending approvals');

                        // Refresh the displayed lists
                        displayTeachers();
                        displayApprovedTeachers();
                    }).catch(error => {
                        alert('Error removing teacher: ' + error.message);
                        console.error('Error removing teacher:', error);
                    });

                }).catch(error => {
                    alert('Error approving teacher: ' + error.message);
                    console.error('Error approving teacher:', error);
                });
            }
        });
    } else {
        console.log('Teacher approval cancelled');
    }
}

// Function to delete teacher from Firebase Authentication
async function deleteTeacherAuth(email) {
    const user = auth.currentUser;

    if (user && user.email === email) {
        try {
            await deleteUser(user);
            console.log("✅ Teacher deleted from Firebase Authentication.");
            alert("✅ Teacher account deleted successfully.");
        } catch (error) {
            console.error("❌ Error deleting teacher from Firebase Authentication:", error);
            alert(`❌ Error deleting teacher: ${error.message}`);
        }
    } else {
        console.log("⚠️ Teacher must be logged in to delete their own account.");
    }
}

// Function to delete a teacher from Firebase Realtime Database
function deleteTeacher(key) {
    const confirmDelete = confirm('⚠️ Are you sure you want to delete this teacher?');

    if (confirmDelete) {
        const teacherRef = ref(database, 'teachers/' + key);

        // ✅ Fetch the teacher's email before deleting
        get(teacherRef).then(snapshot => {
            if (snapshot.exists()) {
                const teacherData = snapshot.val();
                const teacherEmail = teacherData.email;

                // ✅ 1️⃣ Delete from Firebase Authentication (Only if logged in)
                deleteTeacherAuth(teacherEmail);

                // ✅ 2️⃣ Delete from Firebase Realtime Database
                remove(teacherRef)
                    .then(() => {
                        console.log('✅ Teacher deleted successfully from Realtime Database');
                        alert('✅ Teacher deleted successfully from Database.');
                        displayTeachers(); // Refresh the displayed list
                    })
                    .catch(error => {
                        alert('❌ Error deleting Teacher from Database: ' + error.message);
                        console.error("❌ Error deleting teacher: ", error);
                    });
            } else {
                console.log("⚠️ Teacher not found in database.");
            }
        }).catch(error => {
            console.error("❌ Error fetching teacher data: ", error);
        });
    } else {
        console.log('❌ Teacher deletion cancelled');
    }
}

// Function to delete an approved teacher
async function deleteApprovedTeacherAuth(email) {
    const user = auth.currentUser;

    if (user && user.email === email) {
        try {
            await deleteUser(user);
            console.log("✅ Teacher deleted from Firebase Authentication.");
            alert("✅ Teacher account deleted successfully.");
        } catch (error) {
            console.error("❌ Error deleting teacher from Firebase Authentication:", error);
            alert(`❌ Error deleting teacher: ${error.message}`);
        }
    } else {
        console.log("⚠️ Teacher must be logged in to delete their own account.");
    }
}

// Function to delete approved teacher from Firebase Realtime Database and Authentication
function deleteApprovedTeacher(key) {
    const confirmDelete = confirm('⚠️ Are you sure you want to delete this approved teacher?');

    if (confirmDelete) {
        const approvedTeacherRef = ref(database, 'approvedTeachers/' + key);

        // ✅ Fetch the teacher's email before deleting
        get(approvedTeacherRef).then(snapshot => {
            if (snapshot.exists()) {
                const teacherData = snapshot.val();
                const teacherEmail = teacherData.email;

                // ✅ 1️⃣ Delete from Firebase Authentication (Only if logged in)
                deleteApprovedTeacherAuth(teacherEmail);

                // ✅ 2️⃣ Delete from Firebase Realtime Database
                remove(approvedTeacherRef)
                    .then(() => {
                        console.log('✅ Approved teacher deleted successfully from Realtime Database');
                        alert('✅ Approved teacher deleted successfully from Database.');
                        displayApprovedTeachers(); // Refresh the list
                    })
                    .catch(error => {
                        alert('❌ Error deleting teacher from Database: ' + error.message);
                        console.error("❌ Error deleting teacher: ", error);
                    });
            } else {
                console.log("⚠️ Approved teacher not found in database.");
            }
        }).catch(error => {
            console.error("❌ Error fetching approved teacher data: ", error);
        });
    } else {
        console.log('❌ Approved teacher deletion cancelled');
    }
}


   
   // Function to display pending staff from Firebase
function displayStaff() {
    const staffRef = ref(database, 'staff/');
    get(staffRef).then(snapshot => {
        const tbody = document.querySelector('#staffTable tbody');
        tbody.innerHTML = ''; // Clear existing entries

        if (snapshot.exists()) {
            const staff = snapshot.val(); // Staff data as an object
            Object.keys(staff).forEach((key, index) => {
                const staffMember = staff[key];
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${staffMember.name}</td>
                    <td>${staffMember.gender || 'N/A'}</td>
                    <td>${staffMember.department || 'N/A'}</td>
                    <td>${staffMember.designation || 'N/A'}</td>
                    <td>${staffMember.email || 'N/A'}</td>
                    <td>${staffMember.mobile_no || 'N/A'}</td>
                    <td>
                        <button class="approveStaffBtn" data-key="${key}">Approve</button>
                        <button class="deleteStaffBtn" data-key="${key}">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Attach event listeners for the buttons
            document.querySelectorAll('.approveStaffBtn').forEach(button => {
                button.addEventListener('click', function () {
                    const key = this.dataset.key;
                    approveStaff(key); // Approve pending staff
                });
            });

            document.querySelectorAll('.deleteStaffBtn').forEach(button => {
                button.addEventListener('click', function () {
                    const key = this.dataset.key;
                    deleteStaff(key); // Delete pending staff
                });
            });
        }
    });
}

// Function to display approved staff from Firebase
function displayApprovedStaff() {
    const approvedStaffRef = ref(database, 'approvedStaff/');
    get(approvedStaffRef).then(snapshot => {
        const tbody = document.querySelector('#approvedStaff tbody');
        tbody.innerHTML = ''; // Clear existing entries

        if (snapshot.exists()) {
            const approvedStaff = snapshot.val();
            Object.keys(approvedStaff).forEach((key, index) => {
                const staffMember = approvedStaff[key];
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${staffMember.name}</td>
                    <td>${staffMember.gender || 'N/A'}</td>
                    <td>${staffMember.department || 'N/A'}</td>
                    <td>${staffMember.designation || 'N/A'}</td>
                    <td>${staffMember.email || 'N/A'}</td>
                    <td>${staffMember.mobile_no || 'N/A'}</td>
                    <td><button class="deleteApprovedStaffBtn" data-key="${key}">Delete</button></td>
                `;
                tbody.appendChild(row);
            });

            document.querySelectorAll('.deleteApprovedStaffBtn').forEach(button => {
                button.addEventListener('click', function () {
                    const key = this.dataset.key;
                    deleteApprovedStaff(key); // Delete approved staff
                });
            });
        }
    });
}

// Function to approve a pending staff member
function approveStaff(key) {
    const confirmApprove = confirm('Are you sure you want to approve this staff member?');

    if (confirmApprove) {
        const staffRef = ref(database, `staff/${key}`);
        const approvedStaffRef = ref(database, `approvedStaff/${key}`); // Ensure the same key is used

        get(staffRef).then(snapshot => {
            if (snapshot.exists()) {
                const staffMember = snapshot.val();

                // Store staff in the approvedStaff node with the same unique key
                set(approvedStaffRef, staffMember).then(() => {
                    console.log('Staff approved successfully');

                    // Remove staff from pending list
                    remove(staffRef).then(() => {
                        console.log('Staff removed from pending approvals');

                        // Refresh the displayed lists
                        displayStaff();
                        displayApprovedStaff();
                    }).catch(error => {
                        alert('Error removing staff from pending list: ' + error.message);
                        console.error('Error removing staff from pending list:', error);
                    });

                }).catch(error => {
                    alert('Error adding staff to approved list: ' + error.message);
                    console.error('Error adding staff to approved list:', error);
                });
            }
        }).catch(error => {
            alert('Error fetching staff data: ' + error.message);
            console.error('Error fetching staff data:', error);
        });
    } else {
        console.log('Staff approval cancelled');
    }
}

// Function to delete staff from Firebase Authentication
async function deleteStaffAuth(email) {
    const user = auth.currentUser;

    if (user && user.email === email) {
        try {
            await deleteUser(user);
            console.log("✅ Staff deleted from Firebase Authentication.");
            alert("✅ Staff account deleted successfully.");
        } catch (error) {
            console.error("❌ Error deleting staff from Firebase Authentication:", error);
            alert(`❌ Error deleting staff: ${error.message}`);
        }
    } else {
        console.log("⚠️ Staff must be logged in to delete their own account.");
    }
}


// Function to delete a pending staff member
function deleteStaff(key) {
    const confirmDelete = confirm('⚠️ Are you sure you want to delete this staff?');

    if (confirmDelete) {
        const staffRef = ref(database, 'staff/' + key);

        // ✅ Fetch the teacher's email before deleting
        get(staffRef).then(snapshot => {
            if (snapshot.exists()) {
                const staffData = snapshot.val();
                const staffEmail = staffData.email;

                // ✅ 1️⃣ Delete from Firebase Authentication (Only if logged in)
                deleteStaffAuth(staffEmail);

                // ✅ 2️⃣ Delete from Firebase Realtime Database
                remove(staffRef)
                    .then(() => {
                        console.log('✅ Staff deleted successfully from Realtime Database');
                        alert('✅ Staff deleted successfully from Database.');
                        displayStaff(); // Refresh the displayed list
                    })
                    .catch(error => {
                        alert('❌ Error deleting Staff from Database: ' + error.message);
                        console.error("❌ Error deleting staff: ", error);
                    });
            } else {
                console.log("⚠️ Staff not found in database.");
            }
        }).catch(error => {
            console.error("❌ Error fetching staff data: ", error);
        });
    } else {
        console.log('❌ Staff deletion cancelled');
    }
}

// Function to delete an approved staff
async function deleteApprovedStaffAuth(email) {
    const user = auth.currentUser;

    if (user && user.email === email) {
        try {
            await deleteUser(user);
            console.log("✅ Staff deleted from Firebase Authentication.");
            alert("✅ Staff account deleted successfully.");
        } catch (error) {
            console.error("❌ Error deleting staff from Firebase Authentication:", error);
            alert(`❌ Error deleting staff: ${error.message}`);
        }
    } else {
        console.log("⚠️ Staff must be logged in to delete their own account.");
    }
}

// Function to delete an approved staff member
function deleteApprovedStaff(key) {
    const confirmDelete = confirm('⚠️ Are you sure you want to delete this approved staff?');

    if (confirmDelete) {
        const approvedStaffRef = ref(database, 'approvedStaff/' + key);

        // ✅ Fetch the staff's email before deleting
        get(approvedStaffRef).then(snapshot => {
            if (snapshot.exists()) {
                const staffData = snapshot.val();
                const staffEmail = staffData.email;

                // ✅ 1️⃣ Delete from Firebase Authentication (Only if logged in)
                deleteApprovedStaffAuth(staffEmail);

                // ✅ 2️⃣ Delete from Firebase Realtime Database
                remove(approvedStaffRef)
                    .then(() => {
                        console.log('✅ Approved staff deleted successfully from Realtime Database');
                        alert('✅ Approved staff deleted successfully from Database.');
                        displayApprovedStaff(); // Refresh the list
                    })
                    .catch(error => {
                        alert('❌ Error deleting staff from Database: ' + error.message);
                        console.error("❌ Error deleting staff: ", error);
                    });
            } else {
                console.log("⚠️ Approved staff not found in database.");
            }
        }).catch(error => {
            console.error("❌ Error fetching approved staff data: ", error);
        });
    } else {
        console.log('❌ Approved staff deletion cancelled');
    }
}



   
   // Define a single function to initialize the display of all entities
   function initialize() {
       displayStudents();          // Call to display students
       displayTeachers();          // Call to display teachers
       displayApprovedStudents();  // Call to display approved students
       displayApprovedTeachers();  // Call to display approved teachers
       displayStaff();             // Call to display staff
       displayApprovedStaff();     // Call to display approved staff
   }
   
   
   // Assign the initialize function to window.onload
   window.onload = initialize;
   
   // Handling student form submission
   document.getElementById('student-form').addEventListener('submit', function (event) {
       event.preventDefault();
   
       // Get values from the form
       const name = document.getElementById('student-name').value;
       const gender = document.querySelector('input[name="gender"]:checked').value;
       const course = document.getElementById('course').value;
       const batch = document.getElementById('batch').value;
       const roll_no = document.getElementById('roll-no').value;
       const email = document.getElementById('email').value;
       const mobile_no = document.getElementById('contact-number').value;
       const password = document.getElementById('password').value;
   
       const studentData = { name, gender, course, batch, roll_no, email, mobile_no};
   
       // Save the data to local storage
       const existingStudents = JSON.parse(localStorage.getItem('students')) || [];
       existingStudents.push(studentData);
       localStorage.setItem('students', JSON.stringify(existingStudents));
       
   
       // Show success message
       const successMessage = document.getElementById('success-message');
       successMessage.style.display = 'block';
   
       // Refresh the displayed students
       displayStudents();
   });
   
   // Handling teacher form submission
   document.getElementById('teacher-form').addEventListener('submit', function (event) {
       event.preventDefault();
   
       // Get values from the form
       const name = document.getElementById('teacher-name').value;
       const gender = document.querySelector('input[name="gender"]:checked').value;
       const department = document.getElementById('department').value;
       const designation = document.getElementById('designation').value;
       const email = document.getElementById('teacher-email').value;
       const mobile_no = document.getElementById('teacher-contact').value;
       const password = document.getElementById('password').value;
   
       const teacherData = { name, gender, department, designation, email, mobile_no};
   
       // Save the data to local storage
       const existingTeachers = JSON.parse(localStorage.getItem('teachers')) || [];
       existingTeachers.push(teacherData);
       localStorage.setItem('teachers', JSON.stringify(existingTeachers));
   
       // Show success message
       const successMessage = document.getElementById('success-message');
       successMessage.style.display = 'block';
   
       // Refresh the displayed teachers
       displayTeachers();
   });
   
   // Handling staff form submission
   document.getElementById('staff-form').addEventListener('submit', function (event) {
       event.preventDefault();
   
       // Get values from the form
       const name = document.getElementById('staff-name').value;
       const gender = document.querySelector('input[name="gender"]:checked').value;
       const department = document.getElementById('staff-department').value;
       const designation = document.getElementById('staff-designation').value; // Corrected from 'designation' to 'staff-designation'
       const email = document.getElementById('staff-email').value;
       const mobile_no = document.getElementById('staff-contact').value;
       const password = document.getElementById('password').value;
   
       const staffData = { name, gender, department, designation, email, mobile_no};
   
       // Save the data to local storage
       const existingStaff = JSON.parse(localStorage.getItem('staff')) || [];
       existingStaff.push(staffData);
       localStorage.setItem('staff', JSON.stringify(existingStaff));
   
       // Show success message
       const successMessage = document.getElementById('success-message');
       successMessage.style.display = 'block';
   
       // Refresh the displayed staff
       displayStaff();
    });
   
   
   
   
   
   

