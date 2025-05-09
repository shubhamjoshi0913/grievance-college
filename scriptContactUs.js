import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

  const firebaseConfig = {
    apiKey: "AIzaSyAR32bj0NE3n-RxdVT88ShVYcuZsXapVHM",
    authDomain: "grievance-eb3e4.firebaseapp.com",
    projectId: "grievance-eb3e4",
    storageBucket: "grievance-eb3e4.firebasestorage.app",
    messagingSenderId: "1078620464777",
    appId: "1:1078620464777:web:5a00f8d1bd2b0859d4c858",
    measurementId: "G-NT5SNF5ZXF"
  };
// Initialize Firebase and database
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    document.querySelector('.container').classList.add('visible');
    document.querySelector('.institute-image').classList.add('loaded');
});

function handleSubmit(event) {
    event.preventDefault(); // Prevent default form submission

    // Get the form field values
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    // Validate input fields
    if (!name || !email || !subject || !message) {
        alert("Please fill in all fields before submitting.");
        return;
    }

    const formData = {
        name: name,
        email: email,
        subject: subject,
        message: message,
        date: new Date().toLocaleDateString('en-GB') // Formats as DD-MM-YYYY
    };
    

    // Store data in Firebase
    const contactRef = ref(database, "contactMessages");
    const newContactRef = push(contactRef); // Generate unique ID
    set(newContactRef, formData)
        .then(() => {
            console.log("Data successfully saved to Firebase");

            // Show the success message
            const successMessage = document.getElementById('successMessage');
            successMessage.style.display = 'block';

            // Optionally clear the form fields
            document.getElementById('contactForm').reset();

            // Hide the success message after a few seconds (optional)
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
        })
        .catch((error) => {
            console.error("Error saving data to Firebase:", error);
            alert("Error submitting form. Please try again later.");
        });

    return false; // Prevent further default action
}

// Get the form element
const form = document.getElementById("contactForm");

// Add a single event listener for the form submission
form.addEventListener("submit", handleSubmit);


