// =========================================
// FIREBASE IMPORTS
// =========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =========================================
// FIREBASE CONFIG
// =========================================

const firebaseConfig = {

    apiKey: "AIzaSyBnJFqgjwh1xWBOgDC1K7gNWqj1r_Owju0",

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

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getFirestore(app);


// =========================================
// ELEMENTS
// =========================================

const registerForm =
    document.getElementById("registerForm");

const accountStep =
    document.getElementById("accountStep");

const businessStep =
    document.getElementById("businessStep");

const nextButton =
    document.getElementById("nextButton");

const backButton =
    document.getElementById("backButton");

const password =
    document.getElementById("password");

const confirmPassword =
    document.getElementById("confirmPassword");

const passwordToggle =
    document.getElementById("passwordToggle");

const registerError =
    document.getElementById("registerError");

const createButton =
    document.getElementById("createButton");


// =========================================
// PASSWORD VISIBILITY
// =========================================

if (passwordToggle) {

    passwordToggle.addEventListener(
        "click",
        () => {

            const isHidden =
                password.type === "password";


            password.type =
                isHidden
                    ? "text"
                    : "password";


            passwordToggle.innerHTML =
                isHidden
                    ? '<i class="fa-regular fa-eye-slash"></i>'
                    : '<i class="fa-regular fa-eye"></i>';

        }
    );

}


// =========================================
// PASSWORD RULES
// =========================================

const lengthRule =
    document.getElementById("lengthRule");

const numberRule =
    document.getElementById("numberRule");

const matchRule =
    document.getElementById("matchRule");


function updatePasswordRules() {

    if (!password || !confirmPassword) {
        return;
    }


    const value =
        password.value;

    const confirmation =
        confirmPassword.value;


    const validLength =
        value.length >= 8;

    const hasNumber =
        /\d/.test(value);

    const matches =
        value.length > 0 &&
        value === confirmation;


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
            matches
        );

    }

}


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
// GET VALUE HELPER
// =========================================

function getValue(id) {

    const element =
        document.getElementById(id);

    if (!element) {
        return "";
    }

    return element.value.trim();

}


// =========================================
// STEP 1 VALIDATION
// =========================================

function validateAccount() {

    const firstName =
        getValue("firstName");

    const lastName =
        getValue("lastName");

    const dateOfBirth =
        getValue("dateOfBirth");

    const email =
        getValue("email");

    const phone =
        getValue("phone");

    const passwordValue =
        password.value;

    const confirmation =
        confirmPassword.value;


    // NAME

    if (!firstName || !lastName) {

        showError(
            "Ingresa tu nombre y apellido."
        );

        return false;

    }


    // DATE OF BIRTH

    if (!dateOfBirth) {

        showError(
            "Ingresa tu fecha de nacimiento."
        );

        return false;

    }


    // EMAIL

    if (!email) {

        showError(
            "Ingresa tu correo electrónico."
        );

        return false;

    }


    // PHONE

    if (!phone) {

        showError(
            "Ingresa tu número de teléfono."
        );

        return false;

    }


    // PASSWORD LENGTH

    if (passwordValue.length < 8) {

        showError(
            "La contraseña debe tener al menos 8 caracteres."
        );

        return false;

    }


    // PASSWORD NUMBER

    if (!/\d/.test(passwordValue)) {

        showError(
            "La contraseña debe contener al menos un número."
        );

        return false;

    }


    // PASSWORD MATCH

    if (passwordValue !== confirmation) {

        showError(
            "Las contraseñas no coinciden."
        );

        return false;

    }


    hideError();

    return true;

}


// =========================================
// NEXT STEP
// =========================================

if (nextButton) {

    nextButton.addEventListener(
        "click",
        () => {

            if (!validateAccount()) {
                return;
            }


            accountStep.classList.add(
                "hidden"
            );

            businessStep.classList.remove(
                "hidden"
            );


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


// =========================================
// BACK
// =========================================

if (backButton) {

    backButton.addEventListener(
        "click",
        () => {

            businessStep.classList.add(
                "hidden"
            );

            accountStep.classList.remove(
                "hidden"
            );

            hideError();

        }
    );

}


// =========================================
// CREATE ACCOUNT
// =========================================


// =========================================
// CREATE ACCOUNT
// =========================================

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // =================================
            // ACCOUNT INFORMATION
            // =================================

            const firstName =
                getValue("firstName");

            const lastName =
                getValue("lastName");

            const dateOfBirth =
                getValue("dateOfBirth");

            const email =
                getValue("email");

            const phone =
                getValue("phone");

            const passwordValue =
                password.value;


            // =================================
            // BUSINESS INFORMATION
            // =================================

            const businessName =
                getValue("businessName");

            const rfc =
                getValue("rfc").toUpperCase();

            const businessPhone =
                getValue("businessPhone");

            const state =
                getValue("state");

            const city =
                getValue("city");

            const businessType =
                getValue("businessType");


            // =================================
            // TERMS
            // =================================

            const termsElement =
                document.getElementById("terms") ||
                document.getElementById("acceptTerms");

            const terms =
                termsElement
                    ? termsElement.checked
                    : false;


            // =================================
            // VALIDATION
            // =================================

            if (!businessName) {

                showError(
                    "Ingresa el nombre de tu negocio."
                );

                return;
            }


            if (!state || !city) {

                showError(
                    "Ingresa la ubicación de tu negocio."
                );

                return;
            }


            if (!businessType) {

                showError(
                    "Selecciona el tipo de negocio."
                );

                return;
            }


            if (!terms) {

                showError(
                    "Debes aceptar los términos y el aviso de privacidad."
                );

                return;
            }


            hideError();
            setLoading(true);


            try {

                // =========================================
                // 1. CREATE FIREBASE AUTH OWNER ACCOUNT
                // =========================================

                const credential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        passwordValue
                    );


                const user =
                    credential.user;


                // =========================================
                // 2. OWNER ID
                // =========================================

                // Firebase Auth UID = OWNER ID

                const ownerId =
                    user.uid;


                console.log(
                    "OWNER ID:",
                    ownerId
                );


                // =========================================
                // 3. UPDATE OWNER PROFILE
                // =========================================

                await updateProfile(
                    user,
                    {
                        displayName:
                            `${firstName} ${lastName}`
                    }
                );


                // =========================================
                // 4. CREATE A NEW BUSINESS DOCUMENT
                // =========================================

                // IMPORTANT:
                //
                // DO NOT USE user.uid HERE.
                //
                // Firestore automatically creates
                // a completely different ID.

                const businessRef =
                    doc(
                        db,
                        "CRMBuissnes",
                        crypto.randomUUID()
                    );


                const businessId =
                    businessRef.id;


                console.log(
                    "BUSINESS ID:",
                    businessId
                );


                // =========================================
                // 5. CREATE OWNER DOCUMENT
                // =========================================

                const ownerRef =
                    doc(
                        db,
                        "CRMOwner",
                        ownerId
                    );


                // =========================================
                // 6. OWNER DATA
                // =========================================

                const ownerData = {

                    OwnerId:
                        ownerId,

                    BusinessId:
                        businessId,

                    FirstName:
                        firstName,

                    LastName:
                        lastName,

                    DateOfBirth:
                        dateOfBirth,

                    Email:
                        email,

                    Phone:
                        phone,

                    
                    BusinessType:
                        businessType,


                    Role:
                        "owner",

                    Status:
                        "active",

                    CreatedAt:
                        serverTimestamp()

                };


                // =========================================
                // 7. BUSINESS DATA
                // =========================================

                const businessData = {

                    BusinessId:
                        businessId,

                    OwnerId:
                        ownerId,

                    BusinessName:
                        businessName,

                    Email:
                        email,

                    RFC:
                        rfc,

                    Phone:
                        businessPhone,

                    State:
                        state,

                    City:
                        city,

                    BusinessType:
                        businessType,

                    Role:
                        "owner",

                    Status:
                        "active",

                    CreatedAt:
                        serverTimestamp()

                };


                console.log(
                    "OWNER DATA:",
                    ownerData
                );

                console.log(
                    "BUSINESS DATA:",
                    businessData
                );


                // =========================================
                // 8. SAVE OWNER
                // =========================================

                await setDoc(
                    ownerRef,
                    ownerData
                );


                console.log(
                    "CRMOwner CREATED:",
                    ownerId
                );


                // =========================================
                // 9. SAVE BUSINESS
                // =========================================

                await setDoc(
                    businessRef,
                    businessData
                );


                console.log(
                    "CRMBuissnes CREATED:",
                    businessId
                );


                // =========================================
                // 10. SAVE SESSION
                // =========================================

                localStorage.setItem(
                    "uid",
                    ownerId
                );


                localStorage.setItem(
                    "BusinessId",
                    businessId
                );


                localStorage.setItem(
                    "UserRole",
                    "owner"
                );


                // =========================================
                // 11. VERIFY LOCAL STORAGE
                // =========================================

                console.log(
                    "SESSION OWNER:",
                    localStorage.getItem("uid")
                );

                console.log(
                    "SESSION BUSINESS:",
                    localStorage.getItem("BusinessId")
                );

                console.log(
                    "SESSION ROLE:",
                    localStorage.getItem("UserRole")
                );


                // =========================================
                // 12. REDIRECT
                // =========================================

                window.location.href =
                    "index30.html";


            } catch (error) {

                console.error(
                    "REGISTRATION ERROR:",
                    error
                );

                console.error(
                    "ERROR CODE:",
                    error.code
                );

                console.error(
                    "ERROR MESSAGE:",
                    error.message
                );


                showError(
                    getFirebaseError(error)
                );


            } finally {

                setLoading(false);

            }

        }
    );

}
// =========================================
// LOADING
// =========================================

function setLoading(loading) {

    if (!createButton) {
        return;
    }


    createButton.disabled =
        loading;


    if (loading) {

        createButton.classList.add(
            "loading"
        );

    } else {

        createButton.classList.remove(
            "loading"
        );

    }

}


// =========================================
// ERROR
// =========================================

function showError(message) {

    if (!registerError) {
        alert(message);
        return;
    }


    const span =
        registerError.querySelector("span");


    if (span) {

        span.textContent =
            message;

    }


    registerError.classList.add(
        "show"
    );

}


function hideError() {

    if (!registerError) {
        return;
    }


    registerError.classList.remove(
        "show"
    );

}


// =========================================
// FIREBASE ERRORS
// =========================================

function getFirebaseError(error) {

    console.error(
        "Firebase error:",
        error
    );


    switch (error.code) {

        case "auth/email-already-in-use":

            return "Ya existe una cuenta con este correo.";


        case "auth/invalid-email":

            return "El correo electrónico no es válido.";


        case "auth/weak-password":

            return "La contraseña es demasiado débil.";


        case "auth/network-request-failed":

            return "No se pudo conectar con el servidor.";


        case "auth/operation-not-allowed":

            return "El registro con correo y contraseña no está habilitado en Firebase.";


        case "permission-denied":

        case "firestore/permission-denied":

            return "No tienes permiso para guardar esta información. Revisa las reglas de Firestore.";


        default:

            return (
                error.message ||
                "No fue posible crear la cuenta. Intenta nuevamente."
            );

    }

}