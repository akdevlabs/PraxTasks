// ==========================================
// FIREBASE IMPORTS
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================
// FIREBASE CONFIG
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyBnJFqgjwh1xWBOgDC1K7gNWqj1r_Owju0",
    authDomain: "save-a76e9.firebaseapp.com",
    projectId: "save-a76e9",
    storageBucket: "save-a76e9.firebasestorage.app",
    messagingSenderId: "519860252189",
    appId: "1:519860252189:web:62ddfd2c3caad1afb460f4",
    measurementId: "G-10DKR3Y58Y"
};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);


// ==========================================
// ELEMENTS
// ==========================================

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const rememberInput = document.getElementById("remember");

const loginButton = document.getElementById("loginButton");
const loginButtonText = document.getElementById("loginButtonText");
const loginButtonIcon = document.getElementById("loginButtonIcon");
const loginLoader = document.getElementById("loginLoader");

const loginError = document.getElementById("loginError");

const passwordToggle = document.getElementById("passwordToggle");

const forgotPassword = document.getElementById("forgotPassword");


// ==========================================
// ERROR MESSAGE
// ==========================================

function showError(message) {

    loginError.querySelector("span").textContent = message;

    loginError.style.display = "flex";
}


function hideError() {

    loginError.style.display = "none";
}


// ==========================================
// LOADING STATE
// ==========================================

function setLoading(loading) {

    loginButton.disabled = loading;

    if (loading) {

        loginButtonText.textContent = "Iniciando sesión...";

        loginButtonIcon.style.display = "none";

        loginLoader.style.display = "inline-block";

    } else {

        loginButtonText.textContent = "Iniciar sesión";

        loginButtonIcon.style.display = "inline-block";

        loginLoader.style.display = "none";
    }
}


// ==========================================
// PASSWORD TOGGLE
// ==========================================

passwordToggle.addEventListener("click", () => {

    const isPassword =
        passwordInput.type === "password";

    passwordInput.type =
        isPassword ? "text" : "password";

    passwordToggle.innerHTML = isPassword
        ? '<i class="fa-regular fa-eye-slash"></i>'
        : '<i class="fa-regular fa-eye"></i>';

    passwordToggle.setAttribute(
        "aria-label",
        isPassword
            ? "Ocultar contraseña"
            : "Mostrar contraseña"
    );
});


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener("submit", async (event) => { 
    event.preventDefault(); 
    hideError(); 
    const email = emailInput.value.trim(); 
    const password = passwordInput.value; 
    // ====================================== 
    // // VALIDATE INPUT // 
    // ====================================== 
    if (!email || !password) { 
     showError( "Ingresa tu correo electrónico y contraseña." ); 
     return; 
    } 

    setLoading(true); 
    
    try { 
        // ====================================== 
        // SET FIREBASE SESSION PERSISTENCE // 
        // ====================================== 
    
    if (rememberInput.checked) { 
        await setPersistence( 
            auth, 
            browserLocalPersistence 
        ); 
    } else { 
        await setPersistence(
             auth, 
             browserSessionPersistence 
            ); 
        } 
        // ====================================== 
        //  FIREBASE LOGIN // 
        // ====================================== 
        
        const userCredential = 
            await signInWithEmailAndPassword( 
                auth, 
                email, 
                password 
            ); 
        
        const user = userCredential.user; 
    
        console.log( "Firebase login successful:", user.uid ); 
        
        // ====================================== 
        // USER UID // 
        // ====================================== 
        
        const uid = user.uid; 
        
        // ====================================== 
        //  CHECK REGULAR CRM USER // 
        // ====================================== 
        
        const crmUserRef = doc( db, "CRMUser", uid ); 
        const crmUserSnapshot = await getDoc( crmUserRef ); 
        
        // ====================================== 
        //  CHECK BUSINESS / ADMIN // 
        // ====================================== 
         
        const businessRef = doc( db, "CRMOwner", uid ); 
        const businessSnapshot = await getDoc( businessRef ); 
        
        // ====================================== 
        // ACCOUNT VARIABLES // 
        // ====================================== 
        
        let accountData = null; let accountType = null; 
        
        // ======================================  
        // REGULAR CRM USER FOUND // 
        // ====================================== 
        
        if (crmUserSnapshot.exists()) { 
            accountData = crmUserSnapshot.data(); 
            accountType = "user"; 
            console.log( "CRM User account found:", accountData ); 
        } 
        // ====================================== 
        //  BUSINESS / ADMIN FOUND // 
        // ====================================== 
        
        if ( !accountData && businessSnapshot.exists() ) { 
            accountData = businessSnapshot.data(); 
            accountType = "admin"; 
            console.log( "CRM Business/Admin account found:", accountData ); 
        } 
        
        // ====================================== // 
        // NO CRM ACCOUNT FOUND // 
        // ====================================== 
        
        if (!accountData) { await signOut(auth); 
            showError( "No encontramos una cuenta de CRM asociada a este usuario." ); 
            return; } 
        
        // ====================================== // 
        // SAVE USER ID // 
        // ====================================== 
        const ActiveID = user.uid
        localStorage.setItem( "CRMUserId", ActiveID); 

        // ====================================== // 
        // SAVE ACCOUNT TYPE // 
        // ====================================== 
        
        localStorage.setItem( "CRMAccountType", accountType ); 

        // ====================================== // 
        // SAVE ROLE // 
        // ====================================== 
        
        if (accountType === "admin") { 
            localStorage.setItem( "CRMRole", accountData.role || "admin" ); 
        } else { localStorage.setItem( "CRMRole", accountData.role || "employee" ); 

        } 
        
        // ====================================== // 
        // SAVE BUSINESS ID // 
        // ====================================== 
         const businessId = accountData.BuissnesId || accountData.BusinessId || accountData.businessId; 
         if (businessId) { localStorage.setItem( "CRMBuissnesId", businessId ); 

         } else { localStorage.removeItem( "CRMBuissnesId" ); } 
         
         // ====================================== // 
         // DEBUG INFORMATION // 
         // ====================================== 
         
         console.log( "CRM Login Account:", { 
            uid: uid, accountType: accountType, role: accountData.role || null, businessId: businessId || null, data: accountData } 
        ); 
        
        // ====================================== 
        // // REDIRECT // 
        // ====================================== 
        window.location.href = "index34.html"; } catch (error) { console.error( "CRM Login Error:", error ); 
            
            // ====================================== // FIREBASE ERRORS // ====================================== 
        
            switch (error.code) { case "auth/invalid-credential": showError( "El correo electrónico o la contraseña son incorrectos." ); break; case "auth/user-not-found": showError( "No encontramos una cuenta con este correo." ); break; case "auth/wrong-password": showError( "La contraseña es incorrecta." ); break; case "auth/invalid-email": showError( "Ingresa un correo electrónico válido." ); break; case "auth/too-many-requests": showError( "Demasiados intentos. Intenta nuevamente más tarde." ); break; case "auth/user-disabled": showError( "Esta cuenta ha sido deshabilitada." ); break; case "permission-denied": showError( "No tienes permisos para acceder a la información de esta cuenta." ); break; default: showError( "No fue posible iniciar sesión. Intenta nuevamente." ); break; } } finally { setLoading(false); } }
        
        );


// ==========================================
// FORGOT PASSWORD
// ==========================================

forgotPassword.addEventListener("click", async (event) => {

    event.preventDefault();

    const email =
        emailInput.value.trim();


    if (!email) {

        showError(
            "Ingresa tu correo electrónico primero."
        );

        emailInput.focus();

        return;
    }


    try {

        await sendPasswordResetEmail(
            auth,
            email
        );

        hideError();

        alert(
            "Te enviamos un correo para restablecer tu contraseña."
        );

    } catch (error) {

        console.error(
            "Password reset error:",
            error
        );

        showError(
            "No pudimos enviar el correo de recuperación."
        );
    }

});