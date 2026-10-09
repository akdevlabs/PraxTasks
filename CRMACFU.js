
// =========================================
// FIREBASE IMPORTS
// =========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =========================================
// FIREBASE CONFIG
// =========================================

const firebaseConfig = {

    apiKey:
        "AIzaSyBnJFqgjwh1xWBOgDC1K7gNWqj1r_Owju0",

    authDomain:
        "save-a76e9.firebaseapp.com",

    projectId:
        "save-a76e9",

    storageBucket:
        "save-a76e9.firebasestorage.app",

    messagingSenderId:
        "519860252189",

    appId:
        "1:519860252189:web:62ddfd2c3caad1afb460f4",

    measurementId:
        "G-10DKR3Y58Y"
};


// =========================================
// INITIALIZE FIREBASE
// =========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// =========================================
// ELEMENTS
// =========================================

const registerForm =
    document.getElementById("userRegisterForm");

const businessIdInput =
    document.getElementById("businessIdInput");

const findIdButton =
    document.getElementById("findId");

const firstName =
    document.getElementById("firstName");

const lastName =
    document.getElementById("lastName");

const email =
    document.getElementById("email");

const phone =
    document.getElementById("phone");

const dateOfBirth =
    document.getElementById("dateOfBirth");

const position =
    document.getElementById("position");

const password =
    document.getElementById("password");

const confirmPassword =
    document.getElementById("confirmPassword");

const terms =
    document.getElementById("terms");

const registerError =
    document.getElementById("registerError");

const registerErrorText =
    registerError?.querySelector("span");

const createButton =
    document.getElementById("createButton");

const createButtonText =
    document.getElementById("createButtonText");

const createButtonIcon =
    document.getElementById("createButtonIcon");

const registerLoader =
    document.getElementById("registerLoader");


// =========================================
// PASSWORD RULES
// =========================================

const lengthRule =
    document.getElementById("lengthRule");

const numberRule =
    document.getElementById("numberRule");

const matchRule =
    document.getElementById("matchRule");


// =========================================
// BUSINESS VALIDATION STATE
// =========================================

let businessIsValid = false;

let verifiedBusinessId = null;

let verifiedBusinessData = null;


// =========================================
// ERROR MESSAGE
// =========================================

function showError(message) {

    if (!registerError || !registerErrorText) {
        console.error(message);
        return;
    }

    registerErrorText.textContent = message;

    registerError.classList.add("show");
}


// =========================================
// HIDE ERROR
// =========================================

function hideError() {

    if (!registerError || !registerErrorText) {
        return;
    }

    registerErrorText.textContent = "";

    registerError.classList.remove("show");
}


// =========================================
// SET LOADING
// =========================================

function setLoading(loading) {

    if (!createButton) {
        return;
    }

    createButton.disabled = loading;

    if (createButtonText) {
        createButtonText.textContent =
            loading
                ? "Creando cuenta..."
                : "Crear cuenta";
    }

    if (createButtonIcon) {
        createButtonIcon.style.display =
            loading ? "none" : "inline-block";
    }

    if (registerLoader) {
        registerLoader.style.display =
            loading ? "inline-block" : "none";
    }
}


// =========================================
// FIND BUSINESS
// =========================================

async function findBusiness() {

    hideError();

    const businessId =
        businessIdInput.value.trim();

    // Reset previous verification
    businessIsValid = false;
    verifiedBusinessId = null;
    verifiedBusinessData = null;


    // =========================================
    // EMPTY
    // =========================================

    if (!businessId) {

        showError(
            "Ingresa el ID de tu empresa."
        );

        businessIdInput.focus();

        return;
    }


    // =========================================
    // LOADING
    // =========================================

    findIdButton.disabled = true;

    const originalText =
        findIdButton.textContent;

    findIdButton.textContent =
        "Verificando...";


    try {

        console.log(
            "Checking Business ID:",
            businessId
        );


        // =========================================
        // FIRESTORE DOCUMENT
        // =========================================

        const businessRef =
            doc(
                db,
                "CRMBuissnes",
                businessId
            );


        const businessSnap =
            await getDoc(businessRef);


        // =========================================
        // BUSINESS DOES NOT EXIST
        // =========================================

        if (!businessSnap.exists()) {

            businessIsValid = false;

            verifiedBusinessId = null;

            verifiedBusinessData = null;

            showError(
                "El ID de la empresa no es válido. Verifica el ID proporcionado por el administrador."
            );

            console.log(
                "Business ID does not exist:",
                businessId
            );

            return;
        }


        // =========================================
        // BUSINESS EXISTS
        // =========================================

        businessIsValid = true;

        verifiedBusinessId = businessId;

        verifiedBusinessData =
            businessSnap.data();
        // =========================================
        // SAVE VERIFIED ID
        // =========================================

        localStorage.setItem(
            "BuissnesId",
            businessId
        );


        // =========================================
        // VISUAL FEEDBACK
        // =========================================

        findIdButton.textContent =
            "Empresa verificada";

        findIdButton.classList.add(
            "business-verified"
        );


    } catch (error) {

        console.error(
            "Error checking business:",
            error
        );

        businessIsValid = false;

        verifiedBusinessId = null;

        verifiedBusinessData = null;


        showError(
            "No se pudo verificar el ID de la empresa. Intenta nuevamente."
        );


    } finally {

        findIdButton.disabled = false;

        if (!businessIsValid) {

            findIdButton.textContent =
                originalText;
        }
    }
}


// =========================================
// FIND BUTTON
// =========================================

if (findIdButton) {

    findIdButton.addEventListener(
        "click",
        findBusiness
    );
}


// =========================================
// IF USER CHANGES BUSINESS ID
// INVALIDATE VERIFICATION
// =========================================

if (businessIdInput) {

    businessIdInput.addEventListener(
        "input",
        () => {

            const currentId =
                businessIdInput.value.trim();

            if (
                verifiedBusinessId &&
                currentId !== verifiedBusinessId
            ) {

                businessIsValid = false;

                verifiedBusinessId = null;

                verifiedBusinessData = null;

                findIdButton.classList.remove(
                    "business-verified"
                );

                findIdButton.textContent =
                    "Find";
            }

            hideError();
        }
    );
}


// =========================================
// PASSWORD VALIDATION
// =========================================

function updatePasswordRules() {

    const passwordValue =
        password.value;

    const confirmValue =
        confirmPassword.value;


    // =========================================
    // LENGTH
    // =========================================

    const validLength =
        passwordValue.length >= 8;


    // =========================================
    // NUMBER
    // =========================================

    const hasNumber =
        /\d/.test(passwordValue);


    // =========================================
    // MATCH
    // =========================================

    const passwordsMatch =
        passwordValue.length > 0 &&
        passwordValue === confirmValue;


    // =========================================
    // UPDATE UI
    // =========================================

    if (lengthRule) {

        lengthRule.classList.toggle(
            "valid",
            validLength
        );
    }


    if (numberRule) {

        numberRule.classList.toggle(
            "valid",
            hasNumber
        );
    }


    if (matchRule) {

        matchRule.classList.toggle(
            "valid",
            passwordsMatch
        );
    }
}


// =========================================
// PASSWORD EVENTS
// =========================================

if (password) {

    password.addEventListener(
        "input",
        updatePasswordRules
    );
}

if (confirmPassword) {

    confirmPassword.addEventListener(
        "input",
        updatePasswordRules
    );
}


// =========================================
// CHECK IF USER IS 18 OR OLDER
// =========================================

function isAtLeast18(dateString) {

    if (!dateString) {
        return false;
    }

    const birthDate =
        new Date(dateString + "T00:00:00");

    if (isNaN(birthDate.getTime())) {
        return false;
    }

    const today =
        new Date();

    let age =
        today.getFullYear() -
        birthDate.getFullYear();

    const monthDifference =
        today.getMonth() -
        birthDate.getMonth();

    // If birthday has not happened yet this year
    if (
        monthDifference < 0 ||
        (
            monthDifference === 0 &&
            today.getDate() < birthDate.getDate()
        )
    ) {
        age--;
    }

    return age >= 18;
}




// =========================================
// CREATE USER
// =========================================

async function createAccount(event) {

    event.preventDefault();

    hideError();


    // =========================================
    // BUSINESS MUST BE VERIFIED
    // =========================================

    const currentBusinessId =
        businessIdInput.value.trim();


    if (
        !businessIsValid ||
        !verifiedBusinessId ||
        currentBusinessId !== verifiedBusinessId
    ) {

        showError(
            "Primero verifica el ID de tu empresa."
        );

        businessIdInput.focus();

        return;
    }


    // =========================================
    // GET FORM VALUES
    // =========================================

    const firstNameValue =
        firstName.value.trim();

    const lastNameValue =
        lastName.value.trim();

    const emailValue =
        email.value.trim();

    const phoneValue =
        phone.value.trim();

    const dateOfBirthValue =
        dateOfBirth.value;

    const positionValue =
        position.value;

    const passwordValue =
        password.value;

    const confirmPasswordValue =
        confirmPassword.value;


    // =========================================
    // REQUIRED FIELDS
    // =========================================

    if (!firstNameValue) {

        showError(
            "Ingresa tu nombre."
        );

        firstName.focus();

        return;
    }


    if (!lastNameValue) {

        showError(
            "Ingresa tu apellido."
        );

        lastName.focus();

        return;
    }


    if (!phoneValue) {

        showError(
            "Ingresa tu teléfono."
        );

        phone.focus();

        return;
    }



    if (!dateOfBirthValue) { 
        showError( 
            "Ingresa tu fecha de nacimiento." 
        );

        dateOfBirth.focus(); 

        return; 
    }

    if (!isAtLeast18(dateOfBirthValue)) { 
        showError( "Debes tener al menos 18 años para crear una cuenta." 

        ); 

        dateOfBirth.focus(); 

        return; 
    }









    if (!positionValue) {

        showError(
            "Selecciona tu puesto o función."
        );

        position.focus();

        return;
    }


    if (!emailValue) {

        showError(
            "Ingresa tu correo electrónico."
        );

        email.focus();

        return;
    }


    // =========================================
    // PASSWORD
    // =========================================

    if (passwordValue.length < 8) {

        showError(
            "La contraseña debe tener al menos 8 caracteres."
        );

        password.focus();

        return;
    }


    if (!/\d/.test(passwordValue)) {

        showError(
            "La contraseña debe contener al menos un número."
        );

        password.focus();

        return;
    }


    if (
        passwordValue !==
        confirmPasswordValue
    ) {

        showError(
            "Las contraseñas no coinciden."
        );

        confirmPassword.focus();

        return;
    }


    // =========================================
    // TERMS
    // =========================================

    if (!terms.checked) {

        showError(
            "Debes aceptar los términos de servicio y el aviso de privacidad."
        );

        return;
    }


    // =========================================
    // START LOADING
    // =========================================

    setLoading(true);


    try {

        // =========================================
        // CREATE FIREBASE AUTH ACCOUNT
        // =========================================

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                emailValue,
                passwordValue
            );


        const user =
            userCredential.user;


        console.log(
            "Firebase Auth user created:",
            user.uid
        );


        // =========================================
        // UPDATE DISPLAY NAME
        // =========================================

        await updateProfile(
            user,
            {
                displayName:
                    `${firstNameValue} ${lastNameValue}`
            }
        );


        // =========================================
        // SAVE USER DATA
        // =========================================

        /*
            Structure:

            CRMBuissnes
                └── BUSINESS_ID
                    └── Users
                        └── UID
        */

        const userRef =
            doc(
                db,
                "CRMUser",

                user.uid
            );


        await setDoc(
            userRef,
            {

                // =================================
                // ACCOUNT
                // =================================

                uid:
                    user.uid,

                email:
                    emailValue,

                firstName:
                    firstNameValue,

                lastName:
                    lastNameValue,

                displayName:
                    `${firstNameValue} ${lastNameValue}`,


                // =================================
                // BUSINESS
                // =================================

                BuissnesId:
                    verifiedBusinessId,


                // =================================
                // EMPLOYEE INFORMATION
                // =================================

                phone:
                    phoneValue,

                dateOfBirth:
                    dateOfBirthValue,

                BusinessType:
                    positionValue,


                // =================================
                // ACCOUNT STATUS
                // =================================

                role:
                    "user",

                status:
                    "active",

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()
            }
        );


        // =========================================
        // SAVE BUSINESS ID
        // =========================================

        localStorage.setItem(
            "BuissnesId",
            verifiedBusinessId
        );
// =========================================
// SAVE USER ID IN BUSINESS DATABASE
// =========================================

const businessRef = doc(
    db,
    "CRMBuissnes",
    verifiedBusinessId
);

// Get the latest business data
const businessSnap = await getDoc(businessRef);

if (!businessSnap.exists()) {
    throw new Error("Business document does not exist.");
}

const businessData = businessSnap.data();

// Keep existing users
const users = businessData.Users || {};

// Prevent duplicate user IDs
const alreadyExists = Object.values(users).some(
    userEntry => userEntry.id === user.uid
);

if (!alreadyExists) {
    const nextIndex = Object.keys(users).length;

    users[nextIndex] = {
        id: user.uid
    };

    await updateDoc(businessRef, {
        Users: users
    });
}

console.log("User saved in business database:", user.uid);

        // =========================================
        // SAVE USER ID
        // =========================================

        localStorage.setItem(
            "uid",
            user.uid
        );


        console.log(
            "User account created successfully."
        );


        // =========================================
        // REDIRECT
        // =========================================

        window.location.href =
            "index30.html";


    } catch (error) {

        console.error(
            "Error creating account:",
            error
        );


        // =========================================
        // FIREBASE ERRORS
        // =========================================

        if (
            error.code ===
            "auth/email-already-in-use"
        ) {

            showError(
                "Este correo electrónico ya está registrado."
            );

        }

        else if (
            error.code ===
            "auth/invalid-email"
        ) {

            showError(
                "El correo electrónico no es válido."
            );

        }

        else if (
            error.code ===
            "auth/weak-password"
        ) {

            showError(
                "La contraseña es demasiado débil."
            );

        }

        else {

            showError(
                "No se pudo crear la cuenta. Intenta nuevamente."
            );
        }


    } finally {

        setLoading(false);
    }
}


// =========================================
// FORM SUBMIT
// =========================================

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        createAccount
    );
}

