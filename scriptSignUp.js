import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, get,push } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth, sendEmailVerification, createUserWithEmailAndPassword,  deleteUser,fetchSignInMethodsForEmail  } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth();

document.getElementById("role").addEventListener('change', toggleForm);




document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.error-message').forEach(error => error.style.display = 'none');

    document.querySelectorAll('.signup-form').forEach(form => {
        form.addEventListener('submit', async function (e) {
            e.preventDefault(); 

            const role = document.getElementById("role").value;
            const rollNo = document.getElementById('roll-no')?.value.trim();
            const email = document.getElementById('email').value.trim();
            const mobileNo = document.getElementById('contact-number').value.trim();
            const password = document.getElementById('password').value;

            if (role === 'student') {
                const studentsRef = ref(database, 'students/');
                const approvedStudentsRef = ref(database, 'approvedStudents/'); // Reference to approved students
                const teachersRef = ref(database, 'teachers/');
                const staffRef = ref(database, 'staff/');
                const approvedTeachersRef = ref(database, 'approvedTeachers/');
                const approvedStaffRef = ref(database, 'approvedStaff/');
                const membersRef = ref(database, 'members/');
                const signupButton = document.getElementById('signup-button'); // Get the signup button
            
                try {
                    const snapshot = await get(studentsRef);
                    const approvedSnapshot = await get(approvedStudentsRef); // Get approved students data
                    const teachersSnapshot = await get(teachersRef); // Get teachers data
                    const staffSnapshot = await get(staffRef); // Get staff data
                    const approvedTeachersSnapshot = await get(approvedTeachersRef); // Get approved teachers data
                    const approvedStaffSnapshot = await get(approvedStaffRef); // Get approved staff data
                    const membersSnapshot = await get(membersRef); // Get members data
                    let isDuplicate = false;
            
                    if (snapshot.exists()) {
                        const existingStudents = Object.values(snapshot.val());
                        isDuplicate = existingStudents.some(student => student.roll_no === rollNo || student.email === email || student.mobile_no === mobileNo);
            
                        if (isDuplicate) {
                            if (existingStudents.some(student => student.roll_no === rollNo)) {
                                showError('roll-no-error', "This Roll Number is already taken.");
                            }
                            if (existingStudents.some(student => student.email === email)) {
                                showError('email-error', "This email is already in use.");
                            }
                            if (existingStudents.some(student => student.mobile_no === mobileNo)) {
                                showError('contact-number-error', "This contact number is already in use.");
                            }
                            return;
                        }
                    }
            
                    if (approvedSnapshot.exists()) {
                        const approvedStudents = Object.values(approvedSnapshot.val());
            
                        // Check if the roll number or mobile number is already registered in approved students
                        if (approvedStudents.some(student => student.roll_no === rollNo)) {
                            showError('roll-no-error', "This Roll Number is already registered.");
                            return;
                        }
                        if (approvedStudents.some(student => student.mobile_no === mobileNo)) {
                            showError('contact-number-error', "This contact number is already registered.");
                            return;
                        }
                    }



                      // Check for duplicate mobile number in teachers, staff, approved teachers, approved staff, and members
        const checkTeacherStaffMembersDuplicates = (snapshot, refName) => {
            if (snapshot.exists()) {
                const existing = Object.values(snapshot.val());
                if (existing.some(item => item.mobile_no === mobileNo)) {
                    showError('contact-number-error', `This contact number is already in use.`);
                    return true;
                }
                if (existing.some(item => item.contact === mobileNo)) {
                    showError('contact-number-error', `This contact number is already in use .`);
                    return true;
                }
            }
            return false;
        };

        if (checkTeacherStaffMembersDuplicates(teachersSnapshot, 'teachers') || 
            checkTeacherStaffMembersDuplicates(staffSnapshot, 'staff') || 
            checkTeacherStaffMembersDuplicates(approvedTeachersSnapshot, 'approved teachers') || 
            checkTeacherStaffMembersDuplicates(approvedStaffSnapshot, 'approved staff') || 
            checkTeacherStaffMembersDuplicates(membersSnapshot, 'members')) {
            return;
        }



            
                    if (mobileNo.length !== 10 || isNaN(mobileNo)) {
                        showError('contact-number-error', "Please enter a valid 10-digit contact number.");
                        return;
                    }
            
                    // Disable signup button after submission
                    signupButton.style.display = 'none'; 
            
                    // Create user in Firebase Authentication
                    try {
                        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                        const user = userCredential.user;
            
                        // Send email verification
                        await sendEmailVerification(user);
                        alert("A verification email has been sent. Please verify your email within 3 minutes.");
            
                        // Set a timeout to delete the user if not verified in 3 minutes (180,000ms)
                        const deleteTimeout = setTimeout(async () => {
                            await user.reload();
                            if (!user.emailVerified) {
                                await deleteUser(user);
                                alert("Your email was not verified within 3 minutes. Your account has been deleted. Please sign up again.");
                                signupButton.style.display = 'block'; // Show the signup button again
                            }
                        }, 180000); // 3 minutes timeout
            
                        // Check email verification status every 3 seconds
                        let checkVerification = setInterval(async () => {
                            await user.reload();
                            if (user.emailVerified) {
                                clearInterval(checkVerification);
                                clearTimeout(deleteTimeout); // Cancel deletion since the email is verified

                                 // Alert when email verification is successful
                    alert("Signup successful! Your email has been verified.");

            
                                const name = document.getElementById('student-name').value;
                                const gender = document.querySelector('input[name="gender"]:checked').value;
                                const course = document.getElementById('course').value;
                                const batch = document.getElementById('batch').value;
            
                                const studentData = {
                                    uid: user.uid, // Store UID as the unique key
                                    name, gender, course, batch, roll_no: rollNo, email, mobile_no: mobileNo, role: 'student'
                                };
            
                                await set(ref(database, 'students/' + user.uid), studentData);
            
                                alert('Signup successful! Redirecting...');
                                setTimeout(() => { window.location.href = 'index.html'; }, 2000);
                            }
                        }, 3000);
                    } catch (error) {
                        if (error.code === 'auth/email-already-in-use') {
                            showError('email-error', "Email already registered. Please verify your email.");
                        } else {
                            console.error("Error during signup:", error.message);
                            alert(error.message);
                        }
                        signupButton.style.display = 'block'; // Show signup button in case of error
                    }
                } catch (error) {
                    console.error("Error during signup:", error.message);
                    alert(error.message);
                    signupButton.style.display = 'block'; // Show signup button in case of error
                }
            }
            
            
            
            else if (role === 'teacher') {
                const teachersRef = ref(database, 'teachers/');
                const approvedTeachersRef = ref(database, 'approvedTeachers/');
                const studentsRef = ref(database, 'students/');
                const approvedStudentsRef = ref(database, 'approvedStudents/');
                const staffRef = ref(database, 'staff/');
                const approvedStaffRef = ref(database, 'approvedStaff/');
                const membersRef = ref(database, 'members/');
            
                const teacherEmail = document.getElementById('teacher-email').value.trim();
                const teacherMobileNo = document.getElementById('teacher-contact').value.trim();
                const teacherPassword = document.getElementById('teacher-password').value.trim();
                const signupButton = document.getElementById('signup-button2');
                const successMessage = document.getElementById('success-message');
                const teacherForm = document.getElementById('teacher-form');
            
                teacherForm.style.display = 'block'; 
            
                if (!teacherPassword) {
                    showError('teacher-password-error', "Password is required.");
                    return;
                }
            
                try {
                    // Fetch data from all required references
                    const snapshots = await Promise.all([
                        get(teachersRef), get(approvedTeachersRef),
                        get(studentsRef), get(approvedStudentsRef),
                        get(staffRef), get(approvedStaffRef),
                        get(membersRef)
                    ]);
            
                    const [
                        snapshotTeachers, snapshotApprovedTeachers,
                        snapshotStudents, snapshotApprovedStudents,
                        snapshotStaff, snapshotApprovedStaff,
                        snapshotMembers
                    ] = snapshots;
            
                    let isDuplicate = false;
            
                    // Function to check for duplicates in different sections
                    const checkDuplicate = (snapshot, type) => {
                        if (snapshot.exists() && snapshot.val()) {
                            const existingData = Object.values(snapshot.val());
                            if (existingData.some(item => item.email === teacherEmail)) {
                                showError('teacher-email-error', `This email is already registered.`);
                                isDuplicate = true;
                            }
                            if (existingData.some(item => item.mobile_no === teacherMobileNo)) {
                                showError('teacher-contact-error', `This mobile number is already associated.`);
                                isDuplicate = true;
                            }
                            if (existingData.some(item => item.contact === teacherMobileNo)) {
                                showError('teacher-contact-error', `This mobile number is already associated.`);
                                isDuplicate = true;
                            }
                        }
                    };
            
                    // Check duplicates in all relevant categories
                    checkDuplicate(snapshotTeachers, "Teachers");
                    checkDuplicate(snapshotApprovedTeachers, "Approved Teachers");
                    checkDuplicate(snapshotStudents, "Students");
                    checkDuplicate(snapshotApprovedStudents, "Approved Students");
                    checkDuplicate(snapshotStaff, "Staff");
                    checkDuplicate(snapshotApprovedStaff, "Approved Staff");
                    checkDuplicate(snapshotMembers, "Members");
            
                    if (isDuplicate) return; // Stop if duplicate is found
            
                    // Validate contact number (10 digits)
                    if (teacherMobileNo.length !== 10 || isNaN(teacherMobileNo)) {
                        showError('teacher-contact-error', "Please enter a valid 10-digit contact number.");
                        return;
                    }
            
                    // Disable signup button after submission
                    signupButton.style.display = 'none';
            
                    // Create user in Firebase Authentication
                    try {
                        const userCredential = await createUserWithEmailAndPassword(auth, teacherEmail, teacherPassword);
                        const user = userCredential.user;
            
                        // Send email verification
                        await sendEmailVerification(user);
                        alert("A verification email has been sent. Please verify your email within 3 minutes.");
            
                        // Set a timeout to delete the user if not verified in 3 minutes
                        const deleteTimeout = setTimeout(async () => {
                            await user.reload();
                            if (!user.emailVerified) {
                                await deleteUser(user);
                                alert("Your email was not verified within 3 minutes. Your account has been deleted. Please sign up again.");
                                signupButton.style.display = 'block'; 
                            }
                        }, 180000);
            
                        // Check email verification status every 3 seconds
                        let checkVerification = setInterval(async () => {
                            await user.reload();
                            if (user.emailVerified) {
                                clearInterval(checkVerification);
                                clearTimeout(deleteTimeout);

                                 // Alert when email verification is successful
                    alert("Signup successful! Your email has been verified.");

            
                                const name = document.getElementById('teacher-name').value;
                                const gender = document.querySelector('input[name="gender"]:checked').value;
                                const department = document.getElementById('department').value;
                                const designation = document.getElementById('designation').value;
            
                                const teacherData = {
                                    uid: user.uid, 
                                    name, gender, department,  designation, email: teacherEmail, mobile_no: teacherMobileNo, role: 'teacher'
                                };
            
                                await set(ref(database, 'teachers/' + user.uid), teacherData);
            
                                successMessage.style.display = 'block';
                                setTimeout(() => { 
                                    window.location.href = 'index.html';
                                }, 2000);
                            }
                        }, 3000);
            
                    } catch (error) {
                        if (error.code === 'auth/email-already-in-use') {
                            showError('teacher-email-error', "This email is already registered.");
                        } else {
                            console.error("Error during signup:", error.message);
                            alert(error.message);
                        }
                        signupButton.style.display = 'block';
                    }
                } catch (error) {
                    console.error("Error during signup:", error.message);
                    alert(error.message);
                    signupButton.style.display = 'block';
                }
            }
            
            
            
            
            
            else if (role === 'staff') {

                const teachersRef = ref(database, 'teachers/');
                const approvedTeachersRef = ref(database, 'approvedTeachers/');
                const studentsRef = ref(database, 'students/');
                const approvedStudentsRef = ref(database, 'approvedStudents/');
                const staffRef = ref(database, 'staff/');
                const approvedStaffRef = ref(database, 'approvedStaff/');
                const membersRef = ref(database, 'members/');



                // Similar checks for staff data (email and mobile number)
                
                const staffEmail = document.getElementById('staff-email').value.trim();
                const staffMobileNo = document.getElementById('staff-contact').value.trim();
                const staffPassword = document.getElementById('staff-password').value.trim();
                const signupButton = document.getElementById('signup-button3');
                const successMessage = document.getElementById('success-message');
                const staffForm = document.getElementById('staff-form');
                
   
                staffForm.style.display = 'block'; 

                if (!staffPassword) {
                    showError('staff-password-error', "Password is required.");
                    return;
                }




                
                try {
                    // Fetch data from all required references
                    const snapshots = await Promise.all([
                        get(teachersRef), get(approvedTeachersRef),
                        get(studentsRef), get(approvedStudentsRef),
                        get(staffRef), get(approvedStaffRef),
                        get(membersRef)
                    ]);
            
                    const [
                        snapshotTeachers, snapshotApprovedTeachers,
                        snapshotStudents, snapshotApprovedStudents,
                        snapshotStaff, snapshotApprovedStaff,
                        snapshotMembers
                    ] = snapshots;
            
                    let isDuplicate = false;
            
                    // Function to check for duplicates in different sections
                    const checkDuplicate = (snapshot, type) => {
                        if (snapshot.exists() && snapshot.val()) {
                            const existingData = Object.values(snapshot.val());
                            if (existingData.some(item => item.email === staffEmail)) {
                                showError('staff-email-error', `This email is already registered.`);
                                isDuplicate = true;
                            }
                            if (existingData.some(item => item.mobile_no === staffMobileNo)) {
                                showError('staff-contact-error', `This mobile number is already associated.`);
                                isDuplicate = true;
                            }
                            if (existingData.some(item => item.contact === staffMobileNo)) {
                                showError('staff-contact-error', `This mobile number is already associated.`);
                                isDuplicate = true;
                            }
                        }
                    };
            
                    // Check duplicates in all relevant categories
                    checkDuplicate(snapshotTeachers, "Teachers");
                    checkDuplicate(snapshotApprovedTeachers, "Approved Teachers");
                    checkDuplicate(snapshotStudents, "Students");
                    checkDuplicate(snapshotApprovedStudents, "Approved Students");
                    checkDuplicate(snapshotStaff, "Staff");
                    checkDuplicate(snapshotApprovedStaff, "Approved Staff");
                    checkDuplicate(snapshotMembers, "Members");
            
                    if (isDuplicate) return; // Stop if duplicate is found
            
                    // Validate contact number (10 digits)
                    if (staffMobileNo.length !== 10 || isNaN(staffMobileNo)) {
                        showError('staff-contact-error', "Please enter a valid 10-digit contact number.");
                        return;
                    }
            
                    // Disable signup button after submission
                    signupButton.style.display = 'none';
            
                    // Create user in Firebase Authentication
                    try {
                        const userCredential = await createUserWithEmailAndPassword(auth, staffEmail, staffPassword);
                        const user = userCredential.user;
            
                        // Send email verification
                        await sendEmailVerification(user);
                        alert("A verification email has been sent. Please verify your email within 3 minutes.");
            
                        // Set a timeout to delete the user if not verified in 3 minutes
                        const deleteTimeout = setTimeout(async () => {
                            await user.reload();
                            if (!user.emailVerified) {
                                await deleteUser(user);
                                alert("Your email was not verified within 3 minutes. Your account has been deleted. Please sign up again.");
                                signupButton.style.display = 'block'; 
                            }
                        }, 180000);
            
                        // Check email verification status every 3 seconds
                        let checkVerification = setInterval(async () => {
                            await user.reload();
                            if (user.emailVerified) {
                                clearInterval(checkVerification);
                                clearTimeout(deleteTimeout);

                                 // Alert when email verification is successful
                    alert("Signup successful! Your email has been verified.");

            
                                const name = document.getElementById('staff-name').value;
                                const gender = document.querySelector('input[name="gender"]:checked').value;
                                const department = document.getElementById('staff-department').value;
                                const designation = document.getElementById('staff-designation').value;
            
                                const staffData = {
                                    uid: user.uid, 
                                     name, gender, department, designation, email: staffEmail, mobile_no: staffMobileNo, role: 'staff'
                                };
            
                                await set(ref(database, 'staff/' + user.uid), staffData);
            
                                successMessage.style.display = 'block';
                                setTimeout(() => { 
                                    window.location.href = 'index.html';
                                }, 2000);
                            }
                        }, 3000);
            
                    } catch (error) {
                        if (error.code === 'auth/email-already-in-use') {
                            showError('staff-email-error', "This email is already registered.");
                        } else {
                            console.error("Error during signup:", error.message);
                            alert(error.message);
                        }
                        signupButton.style.display = 'block';
                    }
                } catch (error) {
                    console.error("Error during signup:", error.message);
                    alert(error.message);
                }
            }
                });
            });
        });
    
    
    




function showError(id, message) {
    const errorElement = document.getElementById(id);
    errorElement.style.display = 'block';
    errorElement.textContent = message;
    setTimeout(() => { errorElement.style.display = 'none'; }, 3000);
}
