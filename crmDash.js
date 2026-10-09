// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithEmailAndPassword,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { 
  getFirestore, 
  doc,
  getDoc,  
  updateDoc,
  arrayUnion,
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBnJFqgjwh1xWBOgDC1K7gNWqj1r_Owju0",
  authDomain: "save-a76e9.firebaseapp.com",
  projectId: "save-a76e9",
  storageBucket: "save-a76e9.firebasestorage.app",
  messagingSenderId: "519860252189",
  appId: "1:519860252189:web:62ddfd2c3caad1afb460f4",
  measurementId: "G-10DKR3Y58Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);




const Region = "MX"

const UserId = localStorage.getItem("CRMUserId");
const ActiveUserName = "Alfonso";
const BusinessType = "Consultants";






















function initializeUserDropdown() {

    const trigger = document.getElementById("UserDropdown");
    const menu = document.getElementById("UserDropdownMenu");

    if (!trigger || !menu) {
        console.error(
            "UserDropdown or UserDropdownMenu was not found."
        );
        return;
    }

    // Prevent duplicate initialization.
    if (trigger.dataset.initialized === "true") return;

    trigger.dataset.initialized = "true";

    // =========================================
    // RENDER USER INFORMATION
    // =========================================

    function updateUserInformation() {

        if (typeof getActiveData !== "function") {
            console.error("getActiveData() is not defined.");
            return;
        }

        const data = getActiveData() || {};

        const {
            Fname = "",
            Lname = "",
            ActiveURole = "",
            Bname = "",
            ActivePersonData = {},
            ActiveBusinessData = {}
        } = data;

        const fullName = [Fname, Lname]
            .filter(value => String(value || "").trim())
            .join(" ");

        const initials = [Fname, Lname]
            .filter(value => String(value || "").trim())
            .map(value => String(value).trim().charAt(0).toUpperCase())
            .join("");

        const email =
            ActivePersonData?.Email ||
            ActivePersonData?.email ||
            ActivePersonData?.EmailAddress ||
            ActivePersonData?.emailAddress ||
            "";

        const displayRole =
            ActiveURole ||
            ActivePersonData?.CRMRole ||
            ActivePersonData?.Role ||
            ActivePersonData?.role ||
            "";

        const businessName =
            Bname ||
            ActiveBusinessData?.BusinessName ||
            ActiveBusinessData?.businessName ||
            "";

        renderText("Accountholder", fullName, "Mi nombre");
        renderText("ActiveURole", displayRole, "Usuario");

        renderText(
            "DropdownName",
            fullName,
            businessName || "Usuario"
        );

        renderText("DropdownRole", displayRole, "Usuario");
        renderText("DropdownEmail", email, "Correo no disponible");

        renderText("UASI", initials, "U");
        renderText("DropdownUASI", initials, "U");
    }

    // =========================================
    // OPEN / CLOSE MENU
    // =========================================

    function setMenuOpen(open) {

        menu.hidden = !open;

        trigger.setAttribute(
            "aria-expanded",
            String(open)
        );
    }

    function toggleMenu() {
        setMenuOpen(menu.hidden);
    }

    trigger.addEventListener("click", toggleMenu);

    trigger.addEventListener("keydown", event => {

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleMenu();
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setMenuOpen(true);

            menu.querySelector("button")?.focus();
        }

        if (event.key === "Escape") {
            setMenuOpen(false);
        }
    });

    // =========================================
    // CLOSE WHEN CLICKING OUTSIDE
    // =========================================

    document.addEventListener("click", event => {

        if (!event.target.closest(".user-menu-container")) {
            setMenuOpen(false);
        }
    });

    // =========================================
    // ESCAPE KEY
    // =========================================

    document.addEventListener("keydown", event => {

        if (event.key === "Escape" && !menu.hidden) {
            setMenuOpen(false);
            trigger.focus();
        }
    });

    // =========================================
    // MENU ACTIONS
    // =========================================

    menu.querySelectorAll("[data-action]").forEach(button => {

        button.addEventListener("click", async () => {

            const action = button.dataset.action;

            setMenuOpen(false);

            switch (action) {

                case "profile":

                    if (typeof renderProfile === "function") {
                        renderProfile();
                    } else {
                        console.warn(
                            "Create renderProfile() to open the profile page."
                        );
                    }

                    break;

                case "settings":

                    if (typeof renderSettings === "function") {
                        renderSettings();
                    } else {
                        console.warn(
                            "Create renderSettings() to open settings."
                        );
                    }

                    break;

                case "notifications":

                    if (typeof renderNotifications === "function") {
                        renderNotifications();
                    } else {
                        console.warn(
                            "Create renderNotifications() to open notifications."
                        );
                    }

                    break;

                case "logout":

                    if (typeof logoutUser === "function") {
                        await logoutUser();
                    } else {
                        console.error(
                            "logoutUser() is not defined."
                        );
                    }

                    break;
            }
        });
    });

    // Render the account information immediately.
    updateUserInformation();

    // Allow other functions to refresh the dropdown after
    // the active user data has loaded or changed.
    window.refreshUserDropdown = updateUserInformation;
}

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeUserDropdown,
        { once: true }
    );

} else {

    initializeUserDropdown();
}

async function logoutUser() {

    try {

        await signOut(auth);

        window.location.href = "index30.html";

    } catch (error) {

        console.error("Error signing out:", error);

        alert(
            "No se pudo cerrar la sesión. Inténtalo nuevamente."
        );
    }
}













async function renderDashboard() {

    try {

        // =========================================
        // GET OWNER DATA
        // =========================================

        const OwnerRef = doc(
            db,
            "CRMOwner",
            UserId
        );

        const OwnerSnap = await getDoc(OwnerRef);


        // =========================================
        // GET USER DATA
        // =========================================

        const userRef = doc(
            db,
            "CRMUser",
            UserId
        );

        const userSnap = await getDoc(userRef);


        // =========================================
        // GET BUSINESS DATA
        // =========================================
        //
        // The Business ID should be stored in the
        // user's or owner's document.
        //
        // Example:
        // BusinessId: "FBIPogPr79Z9lrRYEc5yQ9JXlEo2"
        //

        let businessSnap = null;
        let businessData = null;

        // First get owner data
        const ownerData = OwnerSnap.exists()
            ? OwnerSnap.data()
            : null;

        // Get user data
        const userData = userSnap.exists()
            ? userSnap.data()
            : null;


        // =========================================
        // FIND BUSINESS ID
        // =========================================

        const BusinessId =
            ownerData?.BusinessId ||
            userData?.BusinessId ||
            localStorage.getItem("BusinessId");


        // =========================================
        // GET BUSINESS
        // =========================================

        if (BusinessId) {

            const businessRef = doc(
                db,
                "CRMBuissnes",
                BusinessId
            );

            businessSnap = await getDoc(businessRef);

            businessData = businessSnap.exists()
                ? businessSnap.data()
                : null;

        }


        // =========================================
        // GET DASHBOARD CONTENT
        // =========================================

        const dashboardRef = doc(
            db,
            "CRMCont",
            "Dashbord"
        );

        const dashboardSnap = await getDoc(
            dashboardRef
        );


        // =========================================
        // CONVERT DASHBOARD DOCUMENT
        // =========================================

        const dashboardData = dashboardSnap.exists()
            ? dashboardSnap.data()
            : null;


        // =========================================
        // RETURN ALL DATA
        // =========================================

        return {

            Owner: ownerData,

            user: userData,

            Buissnes: businessData,

            Dashbord: dashboardData

        };


    } catch (error) {

        console.error(
            "Error fetching CRM data:",
            error
        );

        return null;
    }
}

renderDashboard().then((data) => {

    // =========================================
    // CHECK DATA
    // =========================================

    if (!data) {
        console.log("No data found.");
        return;
    }


    // =========================================
    // GET DATA
    // =========================================

    const OwnerData = data?.Owner || null;
    const UserData = data?.user || null;
    const BusinessData = data?.Buissnes || null;
    const DashboardData = data?.Dashbord || null;
    const BusinessId = BusinessData.BusinessId 

    // =========================================
    // DEBUG
    // =========================================

    console.log("=================================");
 
    console.log("BUSINESS ID", BusinessId );
    console.log("OWNER DATA:", OwnerData);
    console.log("USER DATA:", UserData);
    console.log("BUSINESS DATA:", BusinessData);
    console.log("DASHBOARD DATA:", DashboardData);
    console.log("=================================");


    // =========================================
    // START / HOME
    // =========================================

    function renderStart(language = "MX") {

        const startElement =
            document.getElementById("Start");

        if (!startElement) return;

        const translations = {

            MX: "Inicio",

            US: "Home"

        };

        startElement.textContent =
            translations[language] || translations.MX;
    }


    // =========================================
    // GREETING
    // =========================================

    function renderGreeting( language = "MX", userName = "" ) {

        const greetingElement =
            document.getElementById("Greeting");

        if (!greetingElement) return;


        const hour =
            new Date().getHours();


        const greetings = {

            MX: {

                morning: "Buenos días",

                afternoon: "Buenas tardes",

                night: "Buenas noches"

            },

            US: {

                morning: "Good morning",

                afternoon: "Good afternoon",

                night: "Good evening"

            }

        };


        const selectedGreetings =
            greetings[language] || greetings.MX;


        let greeting;


        if (hour >= 5 && hour < 12) {

            greeting =
                selectedGreetings.morning;

        }

        else if (hour >= 12 && hour < 18) {

            greeting =
                selectedGreetings.afternoon;

        }

        else {

            greeting =
                selectedGreetings.night;

        }


        if (userName) {

            greeting += `, ${userName}`;

        }


        greetingElement.textContent =
            greeting;
    }


    // =========================================
    // ACTIVE ROLES
    // =========================================

    const ActiveUserRole =
        UserData?.role || null;


    const ActiveOwnerRole =
        OwnerData?.Role || null;





    // =========================================
    // DETERMINE ACTIVE ROLE
    // =========================================
    //
    // OWNER:
    // CRMOwner/{UserId}
    //
    // USER:
    // CRMUser/{UserId}
    //
    // =========================================

    let ActiveRole = null;


    if (ActiveOwnerRole === "owner") {

        ActiveRole = "owner";

    }

    else if (ActiveUserRole === "user") {

        ActiveRole = "user";

    }


    console.log(
        "Active Role:",
        ActiveRole
    );


    // =========================================
    // DETERMINE ACTIVE DATA
    // =========================================
    //
    // OWNER:
    // Business information comes from
    // CRMBuissnes/{BusinessId}
    //
    // USER:
    // Business information also comes from
    // CRMBuissnes/{BusinessId}
    //
    // User information comes from CRMUser
    //
    // =========================================


function getActiveData() {

    // =========================================
    // CHECK AVAILABLE INFORMATION
    // =========================================

    const hasInformation = data =>
        data &&
        typeof data === "object" &&
        !Array.isArray(data) &&
        Object.keys(data).length > 0;

    // Support different capitalization conventions
    const getValue = (data, ...keys) => {
        if (!hasInformation(data)) return "";

        for (const key of keys) {
            const value = data[key];

            if (
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
            ) {
                return value;
            }
        }

        return "";
    };

    // =========================================
    // ACTIVE BUSINESS DATA
    // =========================================

    let ActiveBusinessData = null;
    let ActivePersonData = null;

    if (ActiveRole === "owner") {

        ActiveBusinessData = hasInformation(BusinessData)
            ? BusinessData
            : null;

        ActivePersonData = hasInformation(OwnerData)
            ? OwnerData
            : hasInformation(UserData)
                ? UserData
                : null;

    } else if (ActiveRole === "user") {

        ActiveBusinessData = hasInformation(BusinessData)
            ? BusinessData
            : hasInformation(OwnerData?.business)
                ? OwnerData.business
                : hasInformation(OwnerData)
                    ? OwnerData
                    : null;

        ActivePersonData = hasInformation(UserData)
            ? UserData
            : null;
    }

    // =========================================
    // BUSINESS INFORMATION
    // =========================================

    const Btype = getValue(
        ActiveBusinessData,
        "BusinessType",
        "businessType"
    );

    const Bname = getValue(
        ActiveBusinessData,
        "BusinessName",
        "businessName",
        "Name",
        "name"
    );

    // =========================================
    // PERSON INFORMATION
    // =========================================

    const Fname =
        getValue(ActivePersonData, "FirstName", "firstName") ||
        getValue(ActiveBusinessData, "FirstName", "firstName");

    const Lname =
        getValue(ActivePersonData, "LastName", "lastName") ||
        getValue(ActiveBusinessData, "LastName", "lastName");

    const ActiveLUI =
        getValue(ActivePersonData, "uid", "UID", "UserId") ||
        getValue(ActiveBusinessData, "uid", "UID", "UserId");

    const ActiveURole =
        getValue(ActivePersonData, "CRMRole", "Role", "role") ||
        getValue(ActiveBusinessData, "CRMRole", "Role", "role") ||
        ActiveRole ||
        "";

    // =========================================
    // RETURN INFORMATION
    // =========================================

    return {
        ActiveBusinessData,
        ActivePersonData,
        Btype,
        Fname,
        Lname,
        ActiveLUI,
        Bname,
        ActiveURole
    };
}


// =========================================
// REUSABLE TEXT RENDERER
// =========================================

function renderText(elementId, value, fallback = "") {

    const element = document.getElementById(elementId);

    if (!element) {
        console.warn(
            `renderText: Element #${elementId} was not found.`
        );
        return;
    }

    const text =
        value !== null && value !== undefined
            ? String(value).trim()
            : "";

    element.textContent = text || fallback;
}


// =========================================
// RENDER ACTIVE INFORMATION
// =========================================

function renderActiveInformation() {

    const {
        ActiveBusinessData,
        ActivePersonData,
        Btype,
        Fname,
        Lname,
        ActiveLUI,
        Bname,
        ActiveURole
    } = getActiveData();

    // Display information
    renderText(
        "Buissnes-workspace",
        Bname,
        "Mi negocio"
    );


    renderText(
        "Accountholder",
        [Fname, Lname].filter(Boolean).join(" "),
        "Mi nombre"
    );


    renderText(
        "DropdownName",
        [Fname, Lname].filter(Boolean).join(" "),
        "Mi nombre"
    );

    if (ActiveUserRole === "user") {
        renderText("DropdownRole", "Usario", "Mi rol");
    }else{
        renderText("DropdownRole", "Dueño", "Mi rol");
    }


    function renderUserInitials(firstName, lastName) {

        const getInitial = name =>
            String(name || "")
                .trim()
                .charAt(0)
                .toUpperCase();

        const initials =
            getInitial(firstName) +
            getInitial(lastName);

        renderText("UASI", initials, "U");

        return initials;
    }

    renderUserInitials(Fname, Lname);

    // Optional HTML elements: rendered only if present
    renderText("BusinessType", Btype, "Sin categoría");
    renderText("ActiveUserId", ActiveLUI, "Sin ID");

    
    renderGreeting( Region, Fname);
    renderSubtitle( Btype, Region);

    // Debug information
    console.log("Active Role:", ActiveRole);
    console.log("Business Data:", ActiveBusinessData);
    console.log("Person Data:", ActivePersonData);
    console.log("Business Type:", Btype);
    console.log("Business Name:", Bname);
    console.log("First Name:", Fname);
    console.log("Last Name:", Lname);
    console.log("User ID:", ActiveLUI);
    console.log("User Role:", ActiveURole);




}


// =========================================
// EXECUTE
// =========================================

renderActiveInformation();


    // =========================================
    // SUBTITLE
    // =========================================

    function renderSubtitle(
        businessType,
        region
    ) {

        const subtitleElement =
            document.getElementById("subTitle");

        if (!subtitleElement) return;


        // Dashboard content
        const subtitleData =
            DashboardData?.SubTitle;


        if (!subtitleData) {

            console.log(
                "SubTitle not found in Dashboard"
            );

            return;
        }


        if (!businessType) {

            console.log(
                "Business Type is empty."
            );

            return;
        }


        const businessSubtitle =
            subtitleData[businessType];


        if (!businessSubtitle) {

            console.log(
                "Business type not found:",
                businessType
            );

            return;
        }


        const text =
            businessSubtitle[region];


        if (!text) {

            console.log(
                "Region not found:",
                region
            );

            return;
        }


        subtitleElement.textContent =
            text;
    }


    // =========================================
    // RENDER HEADER
    // =========================================

    renderStart(Region);



    // =========================================
    // PROSPECT MODAL
    // =========================================

    const prospectModal =
        document.getElementById(
            "prospectModal"
        );


    const newProspectButton =
        document.getElementById(
            "newProspectButton"
        );


    const closeProspectButton =
        document.getElementById(
            "closeProspectButton"
        );


    const cancelProspectButton =
        document.getElementById(
            "cancelProspectButton"
        );


    const prospectForm =
        document.getElementById(
            "prospectForm"
        );


    // =========================================
    // OPEN MODAL
    // =========================================

    function addProspect() {

        if (!prospectModal) {

            console.error(
                "prospectModal was not found."
            );

            return;
        }


        // Reset form
        if (prospectForm) {

            prospectForm.reset();

        }


        prospectModal.classList.add(
            "active"
        );
    }


    // =========================================
    // CLOSE MODAL
    // =========================================

    function closeProspectModal() {

        if (!prospectModal) {

            console.error(
                "prospectModal was not found."
            );

            return;
        }


        prospectModal.classList.remove(
            "active"
        );
    }


    // =========================================
    // ASSIGNER
    // =========================================



    // =========================================
    // EVENT LISTENER
    // NEW PROSPECT
    // =========================================

    if (newProspectButton) {

        newProspectButton.addEventListener(
            "click",
            addProspect
        );

    }


    // =========================================
    // EVENT LISTENER
    // CLOSE BUTTON
    // =========================================

    if (closeProspectButton) {

        closeProspectButton.addEventListener(
            "click",
            closeProspectModal
        );

    }


    // =========================================
    // EVENT LISTENER
    // CANCEL BUTTON
    // =========================================

    if (cancelProspectButton) {

        cancelProspectButton.addEventListener(
            "click",
            closeProspectModal
        );

    }


    // =========================================
    // CLOSE WHEN CLICKING OUTSIDE
    // =========================================

    if (prospectModal) {

        prospectModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    prospectModal
                ) {

                    closeProspectModal();

                }

            }
        );

    }


    // =========================================
    // ESC KEY
    // =========================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                prospectModal &&
                prospectModal.classList.contains(
                    "active"
                )
            ) {

                closeProspectModal();

            }

        }
    );


    function renderNumber(elementId, number = 0) {

        const element = document.getElementById(elementId);

        if (!element) return;

        element.textContent = number ?? 0;
    }

    // =========================================
    // CREATE / SAVE PROSPECT
    // =========================================


    if (prospectForm) { prospectForm.addEventListener("submit",
        async function (event) {
            event.preventDefault();

            // =========================================
            // 1. VALIDATE BUSINESS
            // =========================================

            if (!BusinessData) {
                console.error("Business data was not found.");
                alert("No se encontró la información de la empresa.");
                return;
            }

            const BusinessId =
                BusinessData?.BusinessId ||
                localStorage.getItem("BusinessId");

            if (!BusinessId) {
                console.error("Business ID was not found.");
                alert("No se encontró el ID de la empresa.");
                return;
            }

            // =========================================
            // 2. HELPER TO READ FORM VALUES
            // =========================================

            const getValue = (id) =>
                document.getElementById(id)?.value?.trim() || "";

            // =========================================
            // 3. REQUIRED FIELDS
            // =========================================

            const firstName = getValue("prospectFirstName");
            const lastName = getValue("prospectLastName");
            const phone = getValue("prospectPhone");

            if (!firstName || !phone) {
                alert("El nombre y el teléfono son obligatorios.");
                return;
            }

            // =========================================
            // 4. BASIC CLIENT INFORMATION
            // =========================================

            const business = getValue("prospectBusiness");
            const type = getValue("prospectType");
            const email = getValue("prospectEmail");

            const preferredContact =
                getValue("prospectPreferredContact");

            const initialContact =
                getValue("prospectContact");

            // =========================================
            // 5. FISCAL INFORMATION
            // =========================================

            const taxpayerType =
                getValue("detailTaxpayerType");

            const rfc =
                getValue("detailFiscalRFC").toUpperCase();

            const curp =
                getValue("detailCURP").toUpperCase();

            const taxRegime =
                getValue("detailTaxRegime");

            const economicActivity =
                getValue("detailEconomicActivity");

            const cfdiUsage =
                getValue("detailCFDIUsage");

            const clientStartDate =
                getValue("detailClientStartDate");

            const fiscalReviewDate =
                getValue("detailFiscalReviewDate");

            // =========================================
            // 6. OPPORTUNITY AND SERVICES
            // =========================================

            const service =
                getValue("prospectService");

            const status =
                getValue("prospectStatus") || "new";

            const priority =
                getValue("prospectPriority") || "normal";

            const estimatedValueInput =
                getValue("prospectValue");

            const closeDate =
                getValue("prospectCloseDate");

            const source =
                getValue("prospectSource");

            // =========================================
            // 7. ACCOUNTING OPERATIONS
            // =========================================

            const legalName =
                getValue("prospectLegalName");

            const billingEmail =
                getValue("prospectBillingEmail");

            const accountingFrequency =
                getValue("prospectAccountingFrequency");

            const serviceStartDate =
                getValue("prospectServiceStartDate");

            const accountingFeeInput =
                getValue("prospectAccountingFee");

            const hasEmployees =
                getValue("prospectHasEmployees");

            const issuesInvoices =
                getValue("prospectIssuesInvoices");

            const receivesInvoices =
                getValue("prospectReceivesInvoices");

            const eFirmaStatus =
                getValue("prospectEFirmaStatus");

            const eFirmaExpiration =
                getValue("prospectEFirmaExpiration");

            const accountant =
                getValue("prospectAccountant");

            const contractStatus =
                getValue("prospectContractStatus");

            // =========================================
            // 8. FOLLOW-UP AND ASSIGNMENT
            // =========================================

            const followUp =
                getValue("prospectFollowUp");

            const assignedTo =
                getValue("prospectAssignedTo");

















            const lastContact =
                getValue("prospectLastContact");

            const nextAction =
                getValue("prospectNextAction");

            // =========================================
            // 9. ADDRESS
            // =========================================

            const address = getValue("prospectAddress");
            const city = getValue("prospectCity");
            const state = getValue("prospectState");
            const zip = getValue("prospectZip");

            // =========================================
            // 10. NOTES
            // =========================================

            const notes = getValue("prospectNotes");

            // =========================================
            // 11. CREATE UNIQUE PROSPECT ID
            // =========================================

            const prospectId =
                crypto.randomUUID();

            const now =
                new Date().toISOString();

            // =========================================
            // 12. BUILD COMPLETE PROSPECT OBJECT
            // =========================================

            const prospect = {
                // Unique identifier
                ProspectId: prospectId,

                // Basic client information
                FirstName: firstName,
                LastName: lastName,
                FullName: `${firstName} ${lastName}`.trim(),
                BusinessName: business,
                ProspectType: type,
                Phone: phone,
                Email: email,
                PreferredContact: preferredContact,
                InitialContact: initialContact,

                // Fiscal information
                TaxpayerType: taxpayerType,
                RFC: rfc,
                CURP: curp,
                TaxRegime: taxRegime,
                EconomicActivity: economicActivity,
                CFDIUsage: cfdiUsage,
                ClientStartDate: clientStartDate,
                FiscalReviewDate: fiscalReviewDate,

                // Opportunity
                Service: service,
                Status: status,
                Priority: priority,
                EstimatedValue:
                    estimatedValueInput !== ""
                        ? Number(estimatedValueInput)
                        : 0,
                ExpectedCloseDate: closeDate,
                Source: source,

                // Accounting operations
                LegalName: legalName,
                BillingEmail: billingEmail,
                AccountingFrequency: accountingFrequency,
                ServiceStartDate: serviceStartDate,
                AccountingFee:
                    accountingFeeInput !== ""
                        ? Number(accountingFeeInput)
                        : 0,
                HasEmployees: hasEmployees,
                IssuesInvoices: issuesInvoices,
                ReceivesInvoices: receivesInvoices,
                EFirmaStatus: eFirmaStatus,
                EFirmaExpiration: eFirmaExpiration,
                Accountant: accountant,
                ContractStatus: contractStatus,

                // Follow-up
                FollowUp: followUp,
                AssignedTo: assignedTo,
                LastContact: lastContact,
                NextAction: nextAction,

                // Address
                Address: {
                    Street: address,
                    City: city,
                    State: state,
                    Zip: zip
                },

                // Notes
                Notes: notes,

                // System information
                CreatedBy: UserId || "",
                CreatedAt: now,
                UpdatedAt: now
            };

            // =========================================
            // 13. FIRESTORE BUSINESS DOCUMENT
            // =========================================

            const businessRef = doc(
                db,
                "CRMBuissnes",
                BusinessId
            );

            // =========================================
            // 14. SAVE PROSPECT
            // =========================================

            const submitButton =
                prospectForm.querySelector(
                    'button[type="submit"]'
                );

            if (submitButton) {
                submitButton.disabled = true;
            }

            try {
                await updateDoc(businessRef, {
                    Prospects: arrayUnion(prospect)
                });

                // Update local business data so the UI
                // can immediately use the new prospect.
                const existingProspects =
                    Array.isArray(BusinessData.Prospects)
                        ? BusinessData.Prospects
                        : [];

                BusinessData.Prospects = [
                    ...existingProspects,
                    prospect
                ];

                console.log(
                    "Prospect created successfully:",
                    prospect
                );

                alert("Prospecto creado correctamente.");

                prospectForm.reset();

                if (typeof closeProspectModal === "function") {
                    closeProspectModal();
                }

                // Refresh the list if this renderer exists.
                if (typeof renderlistProspects === "function") {
                    renderlistProspects();
                }

            } catch (error) {
                console.error(
                    "Error creating prospect:",
                    error
                );

                alert(
                    "No se pudo guardar el prospecto. " +
                    "Revisa tu conexión y los permisos de Firebase."
                );

            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                }
            }
        });
    }

    // =========================================
    // Render   PROSPECT
    // =========================================

    function renderProspectLabel(language = Region) {

        const startElement = document.getElementById("SL1");

        if (!startElement) return;

        const translations = {
            MX: "Prospectos",
            US: "Prospects"
        };

        startElement.textContent =
            translations[language] || translations.MX;
    }

    renderProspectLabel();


    function renderamountProspect() {

        // Get prospects
        const AProspects =
            Array.isArray(BusinessData?.Prospects)
                ? BusinessData.Prospects
                : [];


        // Count prospects
        const prospectAmount =
            AProspects.length;


        // Console
        console.log(
            "Total Prospects:",
            prospectAmount
        );


        // Return the amount
        return prospectAmount;
    }


    // Run function
    const totalProspects = renderamountProspect();





    renderamountProspect()
    renderNumber("S1A", totalProspects);


// =========================================
// COMPARE THIS MONTH VS LAST MONTH
// =========================================



async function compareMonthlyProspects(
    businessData
) {

    try {

        // =========================================
        // GET BUSINESS ID
        // =========================================

        const BusinessId =
            businessData?.BusinessId ||
            localStorage.getItem("BusinessId");


        if (!BusinessId) {

            console.error(
                "Business ID not found."
            );

            return null;
        }


        // =========================================
        // GET BUSINESS DOCUMENT
        // =========================================

        const businessRef =
            doc(
                db,
                "CRMBuissnes",
                BusinessId
            );


        const businessSnap =
            await getDoc(businessRef);


        if (!businessSnap.exists()) {

            console.error(
                "Business was not found."
            );

            return null;
        }


        const business =
            businessSnap.data();


        // =========================================
        // GET PROSPECTS
        // =========================================

        const prospects =
            Array.isArray(business.Prospects)
                ? business.Prospects
                : [];


        // =========================================
        // CURRENT DATE
        // =========================================

        const now =
            new Date();


        const currentYear =
            now.getFullYear();


        const currentMonth =
            now.getMonth();


        // =========================================
        // THIS MONTH
        // =========================================

        const thisMonthProspects =
            prospects.filter((prospect) => {

                // No CreatedAt = ignore prospect
                if (!prospect?.CreatedAt) {
                    return false;
                }


                const createdDate =
                    new Date(
                        prospect.CreatedAt
                    );


                // Invalid date = ignore prospect
                if (
                    isNaN(
                        createdDate.getTime()
                    )
                ) {
                    return false;
                }


                return (
                    createdDate.getFullYear() ===
                        currentYear &&

                    createdDate.getMonth() ===
                        currentMonth
                );

            });


        // =========================================
        // LAST MONTH
        // =========================================

        const lastMonthDate =
            new Date(
                currentYear,
                currentMonth - 1,
                1
            );


        const lastMonthYear =
            lastMonthDate.getFullYear();


        const lastMonth =
            lastMonthDate.getMonth();


        const lastMonthProspects =
            prospects.filter((prospect) => {

                // No CreatedAt = ignore prospect
                if (!prospect?.CreatedAt) {
                    return false;
                }


                const createdDate =
                    new Date(
                        prospect.CreatedAt
                    );


                // Invalid date = ignore prospect
                if (
                    isNaN(
                        createdDate.getTime()
                    )
                ) {
                    return false;
                }


                return (
                    createdDate.getFullYear() ===
                        lastMonthYear &&

                    createdDate.getMonth() ===
                        lastMonth
                );

            });


        // =========================================
        // COUNTS
        // =========================================

        const thisMonthCount =
            thisMonthProspects.length;


        const lastMonthCount =
            lastMonthProspects.length;


        // =========================================
        // PERCENTAGE CHANGE
        // =========================================

        let percentChange = 0;


        if (lastMonthCount > 0) {

            percentChange =
                (
                    (
                        thisMonthCount -
                        lastMonthCount
                    ) /
                    lastMonthCount
                ) * 100;

        }

        else if (
            lastMonthCount === 0 &&
            thisMonthCount > 0
        ) {

            // Cannot calculate normal
            // percentage growth from zero.

            percentChange = null;

        }

        else {

            // No prospects this month
            // and no prospects last month.

            percentChange = 0;

        }


        // =========================================
        // DETERMINE DIRECTION
        // =========================================

        let direction =
            "same";


        if (
            thisMonthCount >
            lastMonthCount
        ) {

            direction =
                "up";

        }

        else if (
            thisMonthCount <
            lastMonthCount
        ) {

            direction =
                "down";

        }


        // =========================================
        // HEALTH STATUS
        // =========================================

        let health =
            "healthy";


        if (
            lastMonthCount > 0 &&
            percentChange < -25
        ) {

            health =
                "low";

        }

        else if (
            lastMonthCount > 0 &&
            percentChange < -10
        ) {

            health =
                "warning";

        }

        else if (
            percentChange !== null &&
            percentChange >= 10
        ) {

            health =
                "growing";

        }


        // =========================================
        // RESULT
        // =========================================

        const result = {

            ThisMonth: {

                Count:
                    thisMonthCount,

                Prospects:
                    thisMonthProspects

            },


            LastMonth: {

                Count:
                    lastMonthCount,

                Prospects:
                    lastMonthProspects

            },


            Difference:
                thisMonthCount -
                lastMonthCount,


            PercentChange:
                percentChange !== null
                    ? Number(
                        percentChange.toFixed(2)
                    )
                    : null,


            Direction:
                direction,


            Health:
                health

        };


        // =========================================
        // CONSOLE
        // =========================================

        console.log(
            "Monthly Prospect Report:",
            result
        );


        return result;


    } catch (error) {

        console.error(
            "Error comparing monthly prospects:",
            error
        );

        return null;

    }

}


// =============================================
// RUN MONTHLY PROSPECT REPORT
// =============================================

const prospectReport = compareMonthlyProspects(
        BusinessData
    );


// =============================================
// DEFAULT SCP1 TO 0
// =============================================

const SCP1 =
    document.getElementById(
        "SCP1"
    );


if (SCP1) {

    // If there is no report or no new
    // prospects this month, show 0.

    SCP1.textContent =
        prospectReport?.ThisMonth?.Count || 0;

}





function renderlistProspects() {

    const prospects =
        Array.isArray(BusinessData?.Prospects)
            ? BusinessData.Prospects
            : [];

    const container =
        document.getElementById("prospectList");

    if (!container) {
        console.error("prospectList was not found.");
        return;
    }

    container.innerHTML = "";

    if (prospects.length === 0) {

        container.innerHTML = `
            <div class="no-prospects">
                No prospects found.
            </div>
        `;

        return;
    }


    // ========================================
    // RENDER PROSPECTS
    // ========================================

    prospects.forEach((prospect) => {

        const prospectId =
            prospect?.ProspectId || "";


        // ------------------------------------
        // NAME
        // ------------------------------------

        const firstName =
            prospect?.FirstName || "";

        const lastName =
            prospect?.LastName || "";

        const fullName =
            prospect?.FullName ||
            `${firstName} ${lastName}`.trim() ||
            "Unnamed Prospect";


        // ------------------------------------
        // INITIALS
        // ------------------------------------

        let initials = "??";

        if (firstName && lastName) {

            initials =
                (
                    firstName.charAt(0) +
                    lastName.charAt(0)
                ).toUpperCase();

        } else if (firstName) {

            initials =
                firstName
                    .substring(0, 2)
                    .toUpperCase();

        } else if (lastName) {

            initials =
                lastName
                    .substring(0, 2)
                    .toUpperCase();
        }


        // ------------------------------------
        // BUSINESS
        // ------------------------------------

        const businessName =
            prospect?.BusinessName ||
            "No company";


        // ------------------------------------
        // TIME
        // ------------------------------------

        let timeAgo = "Unknown";

        if (prospect?.CreatedAt) {

            const createdDate =
                new Date(
                    prospect.CreatedAt
                );

            if (
                !isNaN(
                    createdDate.getTime()
                )
            ) {

                timeAgo =
                    getTimeAgo(
                        createdDate
                    );
            }
        }


        // ========================================
        // CREATE CARD
        // ========================================

        const lead =
            document.createElement("div");

        lead.className =
            "lead-card";


        // ========================================
        // STORE ID
        // ========================================

        lead.dataset.prospectId =
            prospectId;


        // ========================================
        // CLICK SELECTED PROSPECT
        // ========================================

        lead.addEventListener("click", function () {

            const selectedProspectId =
                prospect?.ProspectId;

            if (!selectedProspectId) {
                console.error("ProspectId is missing.");
                return;
            }

            // Save ProspectId
            localStorage.setItem(
                "ProspectId",
                selectedProspectId
            );

            // Set active prospect
            ActiveProspect = prospect;

            // Keep window references if you want them
            window.ActiveProspect = prospect;
            window.ActiveProspectId = selectedProspectId;

            console.log(
                "SELECTED ProspectId:",
                selectedProspectId
            );

            console.log(
                "ACTIVE PROSPECT:",
                ActiveProspect
            );

            // Render
            renderSelectedProspect(prospect);
        });


        // ========================================
        // AVATAR
        // ========================================

        const avatar =
            document.createElement("div");

        avatar.className =
            "lead-avatar teal-bg";

        avatar.textContent =
            initials;


        // ========================================
        // INFO
        // ========================================

        const info =
            document.createElement("div");

        info.className =
            "lead-info";


        const name =
            document.createElement("strong");

        name.textContent =
            fullName;


        const company =
            document.createElement("span");

        company.textContent =
            businessName;


        const time =
            document.createElement("small");

        time.textContent =
            timeAgo;


        info.appendChild(name);
        info.appendChild(company);
        info.appendChild(time);


        // ========================================
        // BUILD CARD
        // ========================================

        lead.appendChild(avatar);
        lead.appendChild(info);


        // ========================================
        // ADD TO LIST
        // ========================================

        container.appendChild(lead);

    });
}





function renderSelectedProspect(prospect) {


if (!prospect) {
    console.error("No prospect selected.");
    return;
}

// ========================================
// SAVE SELECTED PROSPECT
// ========================================

window.ActiveProspect = prospect;
window.ActiveProspectId = prospect.ProspectId;

console.log("Rendering selected prospect:", prospect);
console.log("ProspectId:", prospect.ProspectId);

// ========================================
// HELPER FUNCTIONS
// ========================================

function setValue(id, value, fallback = "-") {
    const element = document.getElementById(id);

    if (!element) return;

    element.textContent =
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
            ? value
            : fallback;
}

function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function formatMoney(value) {
    const amount = Number(value);

    if (value === undefined || value === null || value === "" || Number.isNaN(amount)) {
        return "$0.00";
    }

    return amount.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN"
    });
}

function formatBoolean(value) {
    if (value === true || value === "true" || value === "Sí") {
        return "Sí";
    }

    if (value === false || value === "false" || value === "No") {
        return "No";
    }

    return value || "-";
}

// ========================================
// NORMALIZE PROSPECT DATA
// ========================================

const address =
    prospect.Address &&
    typeof prospect.Address === "object"
        ? prospect.Address
        : {};

const firstName = prospect.FirstName || "";
const lastName = prospect.LastName || "";

const fullName =
    prospect.FullName ||
    `${firstName} ${lastName}`.trim() ||
    "Cliente";

const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join("") || "CL";

const status = prospect.Status || "Nuevo";

// ========================================
// HEADER
// ========================================

setValue("detailAvatar", initials);
setValue("detailFullName", fullName);
setValue("detailBusinessName", prospect.BusinessName);
setValue("detailStatus", status);
setValue("detailProspectId", "ID-" + (prospect.ProspectId || "-"));

// ========================================
// CUSTOMER INFORMATION
// ========================================

setValue("detailName", fullName);
setValue("detailCompany", prospect.BusinessName);
setValue("detailProspectType", prospect.ProspectType);
setValue("detailPhone", prospect.Phone);
setValue("detailEmail", prospect.Email);
setValue("detailWhatsApp", prospect.WhatsApp);
setValue("detailPreferredContact", prospect.PreferredContact);
setValue("detailInitialContact", prospect.InitialContact);

setValue("detailCity", address.City || prospect.City);
setValue("detailState", address.State || prospect.State);
setValue("detailZipCode", address.Zip || prospect.Zip);
setValue("detailAddress", address.Street || prospect.Street);
setValue("detailRFC", prospect.RFC);
setValue("detailClientStatus", status);

// ========================================
// FISCAL INFORMATION
// ========================================

setValue("DTT", prospect.TaxpayerType);
setValue("DC", prospect.CURP);
setValue("DTR", prospect.TaxRegime);
setValue("DEA", prospect.EconomicActivity);
setValue("DCU", prospect.CFDIUsage);
setValue("DCSD", formatDate(prospect.ClientStartDate));
setValue("DFRD", formatDate(prospect.FiscalReviewDate));

// ========================================
// ACCOUNTING INFORMATION
// ========================================

setValue("detailLegalName", prospect.LegalName);
setValue("detailBillingEmail", prospect.BillingEmail);
setValue("detailAccountingFrequency", prospect.AccountingFrequency);
setValue("detailAccountingFee", formatMoney(prospect.AccountingFee));
setValue("detailServiceStartDate", formatDate(prospect.ServiceStartDate));
setValue("detailHasEmployees", formatBoolean(prospect.HasEmployees));
setValue("detailIssuesInvoices", formatBoolean(prospect.IssuesInvoices));
setValue("detailReceivesInvoices", formatBoolean(prospect.ReceivesInvoices));
setValue("detailEFirmaStatus", prospect.EFirmaStatus);
setValue("detailEFirmaExpiration", formatDate(prospect.EFirmaExpiration));
setValue("detailAccountant", prospect.Accountant);
setValue("detailContractStatus", prospect.ContractStatus);

// ========================================
// SALES / COMMERCIAL INFORMATION
// ========================================

const estimatedValue = prospect.EstimatedValue ?? 0;
const probability = Number(prospect.Probability ?? 0);
const weightedValue =
    Number(estimatedValue) * probability / 100;

setValue("detailService", prospect.Service);
setValue("detailEstimatedValue", formatMoney(estimatedValue));
setValue("detailPriority", prospect.Priority);
setValue("detailProbability", `${probability}%`);
setValue("detailWeightedValue", formatMoney(weightedValue));
setValue("detailExpectedClose", formatDate(prospect.ExpectedCloseDate));
setValue("detailFollowUp", formatDate(prospect.FollowUp));
setValue("detailLastContact", formatDate(prospect.LastContact));
setValue("detailSource", prospect.Source);
setValue("detailOpportunitySource", prospect.Source);
setValue("detailAssignedTo", prospect.AssignedTo);
setValue("detailCreatedAt", formatDate(prospect.CreatedAt));
setValue("detailNextAction", prospect.NextAction);

// ========================================
// SIDEBAR SUMMARY
// ========================================

setValue("detailSideValue", formatMoney(estimatedValue));
setValue("detailSideStatus", status);
setValue("detailSideProbability", `${probability}%`);
setValue("detailSideFollowUp", formatDate(prospect.FollowUp));
setValue("detailSideAssignedTo", prospect.AssignedTo);

// ========================================
// NEXT ACTION CARD
// ========================================

setValue(
    "detailNextActionTitle",
    prospect.NextAction || "Sin próxima acción"
);

setValue(
    "detailNextActionDate",
    formatDate(prospect.FollowUp)
);

// ========================================
// CONTACT ACTION BUTTONS
// ========================================

const callButton = document.getElementById("detailCallButton");
const emailButton = document.getElementById("detailEmailButton");
const whatsappButton = document.getElementById("detailWhatsAppButton");

if (callButton) {
    callButton.href = prospect.Phone
        ? `tel:${prospect.Phone}`
        : "javascript:void(0)";
}

if (emailButton) {
    emailButton.href = prospect.Email
        ? `mailto:${prospect.Email}`
        : "javascript:void(0)";
}

if (whatsappButton) {
    const whatsappNumber = (prospect.WhatsApp || prospect.Phone || "")
        .replace(/\D/g, "");

    whatsappButton.href = whatsappNumber
        ? `https://wa.me/${whatsappNumber}`
        : "javascript:void(0)";

    if (whatsappNumber) {
        whatsappButton.target = "_blank";
        whatsappButton.rel = "noopener noreferrer";
    }
}

// ========================================
// OPEN DETAIL MODAL
// ========================================

const modal = document.getElementById("prospectDetailModal");

if (modal) {
    modal.classList.add("active");
} else {
    console.warn("prospectDetailModal was not found.");
}

// ========================================
// DEBUG
// ========================================

console.log("ACTIVE PROSPECT ID:", window.ActiveProspectId);
console.log("ACTIVE PROSPECT:", window.ActiveProspect);


}


















// =========================================
// SEARCH
// =========================================


function initializeGlobalSearch() {

    const searchInput = document.getElementById("globalSearchInput");
    const resultsContainer = document.getElementById("globalSearchResults");

    if (!searchInput || !resultsContainer) {
        console.error("Global search elements were not found.");
        return;
    }

    if (searchInput.dataset.initialized === "true") return;
    searchInput.dataset.initialized = "true";

    // =========================================
    // GET FIELD VALUE
    // =========================================

    function getField(record, ...keys) {

        if (!record || typeof record !== "object") return "";

        for (const key of keys) {

            const value = record[key];

            if (value !== null && value !== undefined && value !== "") {
                return String(value);
            }
        }

        return "";
    }

    // =========================================
    // NORMALIZE SEARCH TEXT
    // =========================================

    function normalize(value) {

        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    // =========================================
    // GET LOADED CRM RECORDS
    // =========================================

    function getSearchRecords() {

        const business =
            typeof BusinessData !== "undefined"
                ? BusinessData
                : {};

        const prospects = Array.isArray(business?.Prospects)
            ? business.Prospects
            : [];

        const clients = Array.isArray(business?.Clients)
            ? business.Clients
            : [];

        const customers = Array.isArray(business?.Customers)
            ? business.Customers
            : [];

        return [
            ...prospects.map(record => ({
                ...record,
                _searchType: "Prospecto"
            })),

            ...clients.map(record => ({
                ...record,
                _searchType: "Cliente"
            })),

            ...customers.map(record => ({
                ...record,
                _searchType: "Cliente"
            }))
        ];
    }

    // =========================================
    // SEARCH RECORDS
    // =========================================

    function searchRecords(query) {

        const searchTerm = normalize(query);

        if (!searchTerm) return [];

        const records = getSearchRecords();

        return records.filter(record => {

            const firstName = getField(
                record, "FirstName", "firstName", "Nombre"
            );

            const lastName = getField(
                record, "LastName", "lastName", "Apellido"
            );

            const fullName = getField(
                record, "FullName", "fullName", "Name", "name"
            );

            const phone = getField(
                record,
                "Phone",
                "phone",
                "PhoneNumber",
                "phoneNumber",
                "Telefono",
                "Teléfono",
                "BusinessPhone"
            );

            const rfc = getField(
                record, "RFC", "rfc"
            );

            const company = getField(
                record,
                "BusinessName",
                "businessName",
                "Company",
                "company",
                "Empresa",
                "Name",
                "name"
            );

            const email = getField(
                record,
                "Email",
                "email",
                "EmailAddress",
                "emailAddress"
            );

            const searchableFields = [
                firstName,
                lastName,
                `${firstName} ${lastName}`,
                fullName,
                phone,
                rfc,
                company,
                email
            ];

            return searchableFields.some(field =>
                normalize(field).includes(searchTerm)
            );
        });
    }

    // =========================================
    // RENDER RESULTS
    // =========================================

    function renderResults(records) {

        resultsContainer.replaceChildren();
        resultsContainer.hidden = false;

        if (records.length === 0) {

            const empty = document.createElement("div");
            empty.className = "search-empty";
            empty.textContent = "No se encontraron resultados.";

            resultsContainer.appendChild(empty);
            return;
        }

        records.slice(0, 10).forEach(record => {

            const firstName = getField(
                record, "FirstName", "firstName"
            );

            const lastName = getField(
                record, "LastName", "lastName"
            );

            const name =
                getField(
                    record, "FullName", "fullName", "Name", "name"
                ) ||
                [firstName, lastName].filter(Boolean).join(" ") ||
                getField(record, "BusinessName", "businessName") ||
                "Registro sin nombre";

            const company = getField(
                record,
                "BusinessName",
                "businessName",
                "Company",
                "company",
                "Empresa"
            );

            const phone = getField(
                record,
                "Phone",
                "phone",
                "PhoneNumber",
                "phoneNumber",
                "Telefono",
                "Teléfono",
                "BusinessPhone"
            );

            const email = getField(
                record, "Email", "email", "EmailAddress"
            );

            const rfc = getField(record, "RFC", "rfc");

            const item = document.createElement("button");
            item.type = "button";
            item.className = "global-search-result";

            const avatar = document.createElement("span");
            avatar.className = "search-result-avatar";
            avatar.textContent = name.charAt(0).toUpperCase();

            const details = document.createElement("span");
            details.className = "search-result-details";

            const title = document.createElement("strong");
            title.textContent = name;

            const subtitle = document.createElement("small");

            subtitle.textContent = [
                record._searchType,
                company && company !== name ? company : "",
                phone,
                email,
                rfc
            ].filter(Boolean).join(" · ");

            details.append(title, subtitle);
            item.append(avatar, details);

            item.addEventListener("click", () => {

                // Save the selected record ID if available.
                const recordId = getField(
                    record, "ProspectId", "ClientId", "id", "ID"
                );

                if (record._searchType === "Prospecto") {

                    if (recordId) {
                        localStorage.setItem("ProspectId", recordId);
                    }

                    if (typeof renderSelectedProspect === "function") {
                        renderSelectedProspect(record);
                    } else {
                        console.warn(
                            "renderSelectedProspect() is not defined."
                        );
                    }

                } else {

                    // Connect your client detail renderer here.
                    if (typeof renderSelectedClient === "function") {
                        renderSelectedClient(record);
                    } else {
                        console.info(
                            "Selected client:", record
                        );
                    }
                }

                resultsContainer.hidden = true;
                searchInput.value = "";
            });

            resultsContainer.appendChild(item);
        });
    }

    // =========================================
    // SEARCH AS USER TYPES
    // =========================================

    searchInput.addEventListener("input", () => {

        const query = searchInput.value.trim();

        if (!query) {
            resultsContainer.replaceChildren();
            resultsContainer.hidden = true;
            return;
        }

        renderResults(searchRecords(query));
    });

    // =========================================
    // CTRL + K / CMD + K
    // =========================================

    document.addEventListener("keydown", event => {

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "k"
        ) {
            event.preventDefault();
            searchInput.focus();
            searchInput.select();
        }

        if (event.key === "Escape") {
            resultsContainer.hidden = true;
            searchInput.blur();
        }
    });

    // Close results when clicking outside.
    document.addEventListener("click", event => {

        if (!event.target.closest(".search-container")) {
            resultsContainer.hidden = true;
        }
    });

    // Refresh search results after CRM data is reloaded.
    window.refreshGlobalSearch = () => {
        const query = searchInput.value.trim();

        if (query) {
            renderResults(searchRecords(query));
        }
    };
}


// =========================================
// INITIALIZE
// =========================================

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeGlobalSearch,
        { once: true }
    );

} else {

    initializeGlobalSearch();
}











function getTimeAgo(date) {

    const now = new Date();

    const difference =
        now.getTime() -
        date.getTime();


    if (difference < 0) {

        return "Just now";
    }


    const minutes =
        Math.floor(
            difference /
            (1000 * 60)
        );


    if (minutes < 1) {

        return "Just now";
    }


    if (minutes === 1) {

        return "1 minute ago";
    }


    if (minutes < 60) {

        return `${minutes} minutes ago`;
    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (hours === 1) {

        return "1 hour ago";
    }


    if (hours < 24) {

        return `${hours} hours ago`;
    }


    const days =
        Math.floor(
            hours / 24
        );


    if (days === 1) {

        return "1 day ago";
    }


    if (days < 30) {

        return `${days} days ago`;
    }


    const months =
        Math.floor(
            days / 30
        );


    if (months === 1) {

        return "1 month ago";
    }


    if (months < 12) {

        return `${months} months ago`;
    }


    const years =
        Math.floor(
            months / 12
        );


    if (years === 1) {

        return "1 year ago";
    }


    return `${years} years ago`;
}

function renderProspectDetails(prospectId) {

    // ----------------------------------------
    // VALIDATE PROSPECT ID
    // ----------------------------------------

    if (!prospectId) {

        console.error(
            "No ProspectId was provided."
        );

        return;
    }


    // ----------------------------------------
    // GET PROSPECTS
    // ----------------------------------------

    const prospects =
        Array.isArray(BusinessData?.Prospects)
            ? BusinessData.Prospects
            : [];


    // ----------------------------------------
    // FIND PROSPECT
    // ----------------------------------------

    const prospect =
        prospects.find(
            item =>
                item?.ProspectId === prospectId
        );


    // ----------------------------------------
    // PROSPECT NOT FOUND
    // ----------------------------------------

    if (!prospect) {

        console.error(
            "Prospect not found:",
            prospectId
        );

        return;
    }


    // ----------------------------------------
    // SAVE ACTIVE PROSPECT
    // ----------------------------------------

    window.ActiveProspectId =
        prospectId;


    localStorage.setItem(
        "ProspectId",
        prospectId
    );


    // ----------------------------------------
    // NAME
    // ----------------------------------------

    const firstName =
        prospect?.FirstName || "";

    const lastName =
        prospect?.LastName || "";

    const fullName =
        prospect?.FullName ||
        `${firstName} ${lastName}`.trim() ||
        "Cliente";


    // ----------------------------------------
    // INITIALS
    // ----------------------------------------

    let initials = "??";

    if (firstName && lastName) {

        initials =
            (
                firstName.charAt(0) +
                lastName.charAt(0)
            ).toUpperCase();

    } else if (firstName) {

        initials =
            firstName
                .substring(0, 2)
                .toUpperCase();

    } else if (lastName) {

        initials =
            lastName
                .substring(0, 2)
                .toUpperCase();
    }


    // ----------------------------------------
    // BASIC INFORMATION
    // ----------------------------------------

    const businessName =
        prospect?.BusinessName ||
        "-";

    const phone =
        prospect?.Phone ||
        prospect?.PhoneNumber ||
        "-";

    const email =
        prospect?.Email ||
        prospect?.EmailAddress ||
        "-";

    const city =
        prospect?.City ||
        "-";

    const address =
        prospect?.Address ||
        prospect?.Street ||
        "-";


    // ----------------------------------------
    // SALES INFORMATION
    // ----------------------------------------

    const estimatedValue =
        prospect?.EstimatedValue ?? 0;

    const expectedClose =
        prospect?.ExpectedCloseDate ||
        "-";

    const followUp =
        prospect?.FollowUp ||
        "-";

    const source =
        prospect?.Source ||
        "-";

    const assignedTo =
        prospect?.AssignedTo ||
        "-";

    const status =
        prospect?.Status ||
        "Nuevo";

    const createdAt =
        prospect?.CreatedAt ||
        "-";


    // ----------------------------------------
    // FORMAT MONEY
    // ----------------------------------------

    let formattedValue = "$0";

    if (
        typeof estimatedValue === "number"
    ) {

        formattedValue =
            new Intl.NumberFormat(
                "es-MX",
                {
                    style: "currency",
                    currency: "MXN",
                    minimumFractionDigits: 0
                }
            ).format(
                estimatedValue
            );

    } else if (estimatedValue) {

        formattedValue =
            estimatedValue;
    }


    // ----------------------------------------
    // FORMAT CREATED DATE
    // ----------------------------------------

    let formattedCreatedAt = "-";

    if (createdAt) {

        const date =
            new Date(createdAt);

        if (
            !isNaN(
                date.getTime()
            )
        ) {

            formattedCreatedAt =
                date.toLocaleDateString(
                    "es-MX",
                    {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }
                );
        }
    }


    // ----------------------------------------
    // HELPER
    // ----------------------------------------

    function setText(
        elementId,
        value
    ) {

        const element =
            document.getElementById(
                elementId
            );

        if (!element) return;

        element.textContent =
            value ?? "-";
    }


    // ----------------------------------------
    // RENDER HEADER
    // ----------------------------------------

    setText(
        "detailAvatar",
        initials
    );

    setText(
        "detailFullName",
        fullName
    );

    setText(
        "detailBusinessName",
        businessName
    );

    setText(
        "detailStatus",
        status
    );


    // ----------------------------------------
    // RENDER CONTACT INFORMATION
    // ----------------------------------------

    setText(
        "detailName",
        fullName
    );

    setText(
        "detailCompany",
        businessName
    );

    setText(
        "detailPhone",
        phone
    );

    setText(
        "detailEmail",
        email
    );

    setText(
        "detailCity",
        city
    );

    setText(
        "detailAddress",
        address
    );


    // ----------------------------------------
    // RENDER SALES INFORMATION
    // ----------------------------------------

    setText(
        "detailEstimatedValue",
        formattedValue
    );

    setText(
        "detailExpectedClose",
        expectedClose
    );

    setText(
        "detailFollowUp",
        followUp
    );

    setText(
        "detailSource",
        source
    );

    setText(
        "detailAssignedTo",
        assignedTo
    );

    setText(
        "detailCreatedAt",
        formattedCreatedAt
    );


    // ----------------------------------------
    // RENDER SIDE SUMMARY
    // ----------------------------------------

    setText(
        "detailSideValue",
        formattedValue
    );

    setText(
        "detailSideStatus",
        status
    );

    setText(
        "detailSideFollowUp",
        followUp
    );


    // ----------------------------------------
    // RENDER DOCUMENTS
    // ----------------------------------------

    renderProspectDocuments(
        prospect
    );


    // ----------------------------------------
    // RENDER NOTES
    // ----------------------------------------

    renderProspectNotes(
        prospect
    );


    // ----------------------------------------
    // RENDER TIMELINE
    // ----------------------------------------

    renderProspectTimeline(
        prospect
    );


    // ----------------------------------------
    // OPEN DETAIL MODAL
    // ----------------------------------------

    const modal =
        document.getElementById(
            "prospectDetailModal"
        );

    if (modal) {

        modal.classList.add(
            "active"
        );
    }


    // ----------------------------------------
    // DEBUG
    // ----------------------------------------

    console.log(
        "Active Prospect:",
        prospect
    );

    console.log(
        "ProspectId:",
        prospectId
    );

    localStorage.setItem("ProspectId", prospect.ProspectId);
}
const editProspectButton =
    document.getElementById("editProspectButton");

const saveProspectButton =
    document.getElementById("saveProspectButton");

const cancelEditProspectButton =
    document.getElementById("cancelEditProspectButton");


// Currently selected prospect
let ActiveProspect = null;
let OriginalProspect = null;



// ---------------------------------------------------------
// EDIT PROSPECT
// ---------------------------------------------------------

editProspectButton?.addEventListener(
    "click",
    () => {

        // ----------------------------------------
        // GET SAVED PROSPECT ID
        // ----------------------------------------

        const ProspectId =
            localStorage.getItem("ProspectId");

        console.log(
            "EDIT ProspectId:",
            ProspectId
        );


        // ----------------------------------------
        // VALIDATE ID
        // ----------------------------------------

        if (!ProspectId) {

            console.warn(
                "No hay ProspectId guardado."
            );

            return;
        }


        // ----------------------------------------
        // GET PROSPECTS
        // ----------------------------------------

        const prospects =
            Array.isArray(BusinessData?.Prospects)
                ? BusinessData.Prospects
                : [];


        // ----------------------------------------
        // FIND ACTIVE PROSPECT
        // ----------------------------------------

        const prospect =
            prospects.find(
                item =>
                    item?.ProspectId ===
                    ProspectId
            );


        if (!prospect) {

            console.error(
                "No se encontró el prospecto:",
                ProspectId
            );

            return;
        }


        // ----------------------------------------
        // SET ACTIVE PROSPECT
        // ----------------------------------------

        ActiveProspect =
            prospect;

        window.ActiveProspect =
            prospect;

        window.ActiveProspectId =
            ProspectId;


        console.log(
            "ACTIVE PROSPECT:",
            ActiveProspect
        );


        // ----------------------------------------
        // SAVE ORIGINAL
        // ----------------------------------------

        OriginalProspect = {
            ...prospect
        };


        // ----------------------------------------
        // ENABLE EDITING
        // ----------------------------------------

        enableProspectEditing();


        // ----------------------------------------
        // BUTTONS
        // ----------------------------------------

        editProspectButton.style.display =
            "none";


        if (saveProspectButton) {

            saveProspectButton.style.display =
                "inline-flex";

        }


        if (cancelEditProspectButton) {

            cancelEditProspectButton.style.display =
                "inline-flex";

        }

    }
);


// ---------------------------------------------------------
// ENABLE EDITING
// ---------------------------------------------------------

function enableProspectEditing() {

    if (!ActiveProspect) return;

    // Prevent accidentally editing the same field twice.
    // This function expects createEditableField to replace the element's
    // display content with an input while editing.

    // =========================================================
    // CUSTOMER INFORMATION
    // =========================================================

    createEditableField(
        "detailName",
        "FullName",
        ActiveProspect.FullName || ""
    );

    createEditableField(
        "detailCompany",
        "BusinessName",
        ActiveProspect.BusinessName || ""
    );

    createEditableField(
        "detailProspectType",
        "ProspectType",
        ActiveProspect.ProspectType || ""
    );

    createEditableField(
        "detailPhone",
        "Phone",
        ActiveProspect.Phone || "",
        "tel"
    );

    createEditableField(
        "detailEmail",
        "Email",
        ActiveProspect.Email || "",
        "email"
    );

    createEditableField(
        "detailWhatsApp",
        "WhatsApp",
        ActiveProspect.WhatsApp || "",
        "tel"
    );

    createEditableField(
        "detailPreferredContact",
        "PreferredContact",
        ActiveProspect.PreferredContact || ""
    );

    createEditableField(
        "detailInitialContact",
        "InitialContact",
        ActiveProspect.InitialContact || ""
    );

    createEditableField(
        "detailCity",
        "City",
        ActiveProspect.Address?.City || ActiveProspect.City || ""
    );

    createEditableField(
        "detailState",
        "State",
        ActiveProspect.Address?.State || ActiveProspect.State || ""
    );

    createEditableField(
        "detailAddress",
        "Address",
        ActiveProspect.Address?.Street || ActiveProspect.Address || ""
    );

    createEditableField(
        "detailZipCode",
        "Zip",
        ActiveProspect.Address?.Zip || ActiveProspect.Zip || ActiveProspect.ZipCode || ""
    );

    createEditableField(
        "detailClientStatus",
        "Status",
        ActiveProspect.Status || ""
    );


    // =========================================================
    // FISCAL INFORMATION
    // =========================================================

    createEditableField(
        "detailRFC",
        "RFC",
        ActiveProspect.RFC || ""
    );

    createEditableField(
        "detailTaxpayerType",
        "TaxpayerType",
        ActiveProspect.TaxpayerType || ""
    );

    createEditableField(
        "detailCURP",
        "CURP",
        ActiveProspect.CURP || ""
    );

    createEditableField(
        "detailTaxRegime",
        "TaxRegime",
        ActiveProspect.TaxRegime || ""
    );

    createEditableField(
        "detailEconomicActivity",
        "EconomicActivity",
        ActiveProspect.EconomicActivity || ""
    );

    createEditableField(
        "detailCFDIUsage",
        "CFDIUsage",
        ActiveProspect.CFDIUsage || ""
    );

    createEditableField(
        "detailClientStartDate",
        "ClientStartDate",
        ActiveProspect.ClientStartDate || "",
        "date"
    );

    createEditableField(
        "detailFiscalReviewDate",
        "FiscalReviewDate",
        ActiveProspect.FiscalReviewDate || "",
        "date"
    );


    // =========================================================
    // ACCOUNTING OPERATIONS
    // =========================================================

    createEditableField(
        "detailLegalName",
        "LegalName",
        ActiveProspect.LegalName || ""
    );

    createEditableField(
        "detailBillingEmail",
        "BillingEmail",
        ActiveProspect.BillingEmail || "",
        "email"
    );

    createEditableField(
        "detailAccountingFrequency",
        "AccountingFrequency",
        ActiveProspect.AccountingFrequency || ""
    );

    createEditableField(
        "detailAccountingFee",
        "AccountingFee",
        ActiveProspect.AccountingFee ?? "",
        "number"
    );

    createEditableField(
        "detailServiceStartDate",
        "ServiceStartDate",
        ActiveProspect.ServiceStartDate || "",
        "date"
    );

    createEditableField(
        "detailHasEmployees",
        "HasEmployees",
        ActiveProspect.HasEmployees ?? ""
    );

    createEditableField(
        "detailIssuesInvoices",
        "IssuesInvoices",
        ActiveProspect.IssuesInvoices ?? ""
    );

    createEditableField(
        "detailReceivesInvoices",
        "ReceivesInvoices",
        ActiveProspect.ReceivesInvoices ?? ""
    );

    createEditableField(
        "detailEFirmaStatus",
        "EFirmaStatus",
        ActiveProspect.EFirmaStatus || ""
    );

    createEditableField(
        "detailEFirmaExpiration",
        "EFirmaExpiration",
        ActiveProspect.EFirmaExpiration || "",
        "date"
    );

    createEditableField(
        "detailAccountant",
        "Accountant",
        ActiveProspect.Accountant || ""
    );

    createEditableField(
        "detailContractStatus",
        "ContractStatus",
        ActiveProspect.ContractStatus || ""
    );


    // =========================================================
    // SALES / OPPORTUNITY
    // =========================================================

    createEditableField(
        "detailService",
        "Service",
        ActiveProspect.Service || ""
    );

    createEditableField(
        "detailEstimatedValue",
        "EstimatedValue",
        ActiveProspect.EstimatedValue ?? "",
        "number"
    );

    createEditableField(
        "detailPriority",
        "Priority",
        ActiveProspect.Priority || ""
    );

    createEditableField(
        "detailProbability",
        "Probability",
        ActiveProspect.Probability ?? "",
        "number"
    );

    createEditableField(
        "detailExpectedClose",
        "ExpectedCloseDate",
        ActiveProspect.ExpectedCloseDate || "",
        "date"
    );

    createEditableField(
        "detailFollowUp",
        "FollowUp",
        ActiveProspect.FollowUp || "",
        "date"
    );

    createEditableField(
        "detailLastContact",
        "LastContact",
        ActiveProspect.LastContact || "",
        "date"
    );

    createEditableField(
        "detailSource",
        "Source",
        ActiveProspect.Source || ""
    );

    createEditableField(
        "detailOpportunitySource",
        "Source",
        ActiveProspect.Source || ""
    );

    createEditableField(
        "detailAssignedTo",
        "AssignedTo",
        ActiveProspect.AssignedTo || ""
    );

    createEditableField(
        "detailNextAction",
        "NextAction",
        ActiveProspect.NextAction || ""
    );


    // =========================================================
    // NOTES
    // =========================================================

    // The notes section is a list, not an editable field.
    // Use the existing Notes property in the dedicated editor if present.
    const notesInput = document.getElementById("prospectNoteInput");

    if (notesInput) {
        notesInput.value = ActiveProspect.Notes || "";
    }


    // =========================================================
    // EDIT MODE BUTTONS
    // =========================================================

    const editButton = document.getElementById("editProspectButton");
    const saveButton = document.getElementById("saveProspectButton");
    const cancelButton = document.getElementById("cancelEditProspectButton");

    if (editButton) editButton.style.display = "none";
    if (saveButton) saveButton.style.display = "inline-flex";
    if (cancelButton) cancelButton.style.display = "inline-flex";

}




// ---------------------------------------------------------
// CREATE INPUT
// ---------------------------------------------------------

function createEditableField(
    elementId,
    fieldName,
    value,
    type = "text"
) {

    const element =
        document.getElementById(elementId);


    if (!element) return;


    // Don't create twice
    if (
        element.querySelector(
            ".prospect-edit-input"
        )
    ) {
        return;
    }


    element.dataset.originalValue =
        value;


    element.innerHTML = "";


    let input;


    if (type === "textarea") {

        input =
            document.createElement("textarea");

        input.rows = 4;

    } else {

        input =
            document.createElement("input");

        input.type = type;

    }


    input.className =
        "prospect-edit-input";


    input.value =
        value;


    input.dataset.field =
        fieldName;


    input.style.width =
        "100%";


    input.style.boxSizing =
        "border-box";


    element.appendChild(input);

}


// ---------------------------------------------------------
// SAVE PROSPECT
// ---------------------------------------------------------

saveProspectButton?.addEventListener(
    "click",
    async () => {

        if (!ActiveProspect) {

            console.warn(
                "No hay un prospecto seleccionado."
            );

            return;
        }


        if (!BusinessId) {

            console.error(
                "No existe BusinessId."
            );

            return;
        }


        try {

            saveProspectButton.disabled =
                true;


            saveProspectButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Guardando...
            `;


            // ---------------------------------------------
            // GET UPDATED VALUES
            // ---------------------------------------------

            const updatedProspect = {
                ...ActiveProspect
            };


            const editableFields =
                document.querySelectorAll(
                    ".prospect-edit-input"
                );


            editableFields.forEach(
                input => {

                    const field =
                        input.dataset.field;


                    if (!field) return;


                    let value =
                        input.value.trim();


                    if (
                        field ===
                        "EstimatedValue"
                    ) {

                        value =
                            value === ""
                                ? 0
                                : Number(value);

                    }


                    if (
                        field ===
                        "Probability"
                    ) {

                        value =
                            value === ""
                                ? 0
                                : Number(value);

                    }


                    updatedProspect[field] =
                        value;

                }
            );


            // ---------------------------------------------
            // FIND PROSPECT IN ARRAY
            // ---------------------------------------------

            const businessRef =
                doc(
                    db,
                    "CRMBuissnes",
                    BusinessId
                );


            const businessSnap =
                await getDoc(
                    businessRef
                );


            if (!businessSnap.exists()) {

                throw new Error(
                    "No se encontró el negocio."
                );

            }


            const businessData =
                businessSnap.data();


            const prospects =
                Array.isArray(
                    businessData.Prospects
                )
                    ? [...businessData.Prospects]
                    : [];


            const prospectIndex =
                prospects.findIndex(
                    prospect =>
                        prospect.ProspectId ===
                        ActiveProspect.ProspectId
                );


            if (prospectIndex === -1) {

                throw new Error(
                    "No se encontró el ProspectId."
                );

            }


            // ---------------------------------------------
            // UPDATE PROSPECT
            // ---------------------------------------------

            prospects[prospectIndex] = {
                ...prospects[prospectIndex],
                ...updatedProspect,
                UpdatedAt:
                    new Date().toISOString()
            };


            // ---------------------------------------------
            // SAVE FIRESTORE
            // ---------------------------------------------

            await updateDoc(
                businessRef,
                {
                    Prospects: prospects
                }
            );


            // ---------------------------------------------
            // UPDATE ACTIVE PROSPECT
            // ---------------------------------------------

            ActiveProspect =
                prospects[prospectIndex];


            // ---------------------------------------------
            // EXIT EDIT MODE
            // ---------------------------------------------

            disableProspectEditing();


            editProspectButton.style.display =
                "inline-flex";


            if (saveProspectButton) {

                saveProspectButton.style.display =
                    "none";

            }


            if (cancelEditProspectButton) {

                cancelEditProspectButton.style.display =
                    "none";

            }


            console.log(
                "Prospect updated:",
                ActiveProspect
            );


            // ---------------------------------------------
            // RENDER AGAIN
            // ---------------------------------------------

            if (
                typeof renderProspectDetail ===
                "function"
            ) {

                renderProspectDetail(
                    ActiveProspect
                );

            }


        } catch (error) {

            console.error(
                "Error updating prospect:",
                error
            );

            alert(
                "No se pudieron guardar los cambios."
            );


        } finally {

            saveProspectButton.disabled =
                false;


            saveProspectButton.innerHTML = `
                <i class="fa-solid fa-floppy-disk"></i>
                Guardar cambios
            `;

        }

    }
);


// ---------------------------------------------------------
// CANCEL EDIT
// ---------------------------------------------------------

cancelEditProspectButton?.addEventListener(
    "click",
    () => {

        if (
            !ActiveProspect ||
            !OriginalProspect
        ) {
            return;
        }


        ActiveProspect = {
            ...OriginalProspect
        };


        disableProspectEditing();


        editProspectButton.style.display =
            "inline-flex";


        if (saveProspectButton) {

            saveProspectButton.style.display =
                "none";

        }


        if (cancelEditProspectButton) {

            cancelEditProspectButton.style.display =
                "none";

        }


        if (
            typeof renderProspectDetail ===
            "function"
        ) {

            renderProspectDetail(
                ActiveProspect
            );

        }

    }
);


// ---------------------------------------------------------
// DISABLE EDIT MODE
// ---------------------------------------------------------

function disableProspectEditing() {

    const inputs =
        document.querySelectorAll(
            ".prospect-edit-input"
        );


    inputs.forEach(
        input => {

            const container =
                input.parentElement;


            if (!container) return;


            const value =
                input.value;


            container.textContent =
                value;

        }
    );

}

renderlistProspects()

const closeProspectDetail =
    document.getElementById("closeProspectDetail");

const prospectDetailModal =
    document.getElementById("prospectDetailModal");


closeProspectDetail?.addEventListener(
    "click",
    () => {

        if (!prospectDetailModal) return;

        prospectDetailModal.classList.remove("active");

    }
);



})