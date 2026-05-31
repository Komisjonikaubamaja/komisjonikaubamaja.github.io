// Firebase Imports
import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    collection,
    addDoc,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

/* -------------------------------- */
/* FIREBASE CONFIG                  */
/* -------------------------------- */

const firebaseConfig = {
    apiKey: "AIzaSyAsUhFB7YSlqwaIrNBK7N6Z-Ghs6J0-wI8",
    authDomain: "komisjonikaubamaja-ee.firebaseapp.com",
    projectId: "komisjonikaubamaja-ee",
    storageBucket: "komisjonikaubamaja-ee.firebasestorage.app",
    messagingSenderId: "529526657582",
    appId: "1:529526657582:web:1d2973a83f12a1cf3bc5bf",
    measurementId: "G-5PSEG6CB1K"
};

/* -------------------------------- */
/* INITIALIZE                       */
/* -------------------------------- */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();

/* -------------------------------- */
/* ELEMENTS                         */
/* -------------------------------- */

const loginBtn =
document.getElementById("loginBtn");

const loginBox =
document.getElementById("loginBox");

const adminPanel =
document.getElementById("adminPanel");

const adminEmail =
document.getElementById("adminEmail");

const publishBtn =
document.getElementById("publishBtn");

const successBox =
document.getElementById("success");

const errorBox =
document.getElementById("error");

/* -------------------------------- */
/* USER STATE                       */
/* -------------------------------- */

let currentUser = null;

/* -------------------------------- */
/* LOGIN                            */
/* -------------------------------- */

loginBtn.addEventListener(
    "click",
    async () => {

        try {

            await signInWithPopup(
                auth,
                provider
            );

        } catch (error) {

            console.error(error);

            errorBox.textContent =
                "Sisselogimine ebaõnnestus.";

        }

    }
);

/* -------------------------------- */
/* AUTH CHECK                       */
/* -------------------------------- */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {
            return;
        }

        currentUser = user;

        try {

            const adminRef =
                doc(
                    db,
                    "admins",
                    user.uid
                );

            const adminSnap =
                await getDoc(adminRef);

            if (!adminSnap.exists()) {

                document.body.innerHTML = `
                    <div style="
                        font-family:Inter,sans-serif;
                        padding:50px;
                        text-align:center;
                    ">
                        <h1>Ligipääs keelatud</h1>
                        <p>Sul puuduvad administraatori õigused.</p>
                    </div>
                `;

                return;
            }

            loginBox.classList.add(
                "hidden"
            );

            adminPanel.classList.remove(
                "hidden"
            );

            adminEmail.textContent =
                user.email;

        } catch (error) {

            console.error(error);

            errorBox.textContent =
                error.message;

        }

    }
);

/* -------------------------------- */
/* PUBLISH PRODUCT                  */
/* -------------------------------- */

publishBtn.addEventListener(
    "click",
    async () => {

        successBox.textContent = "";
        errorBox.textContent = "";

        try {

            const title =
                document.getElementById("title").value.trim();

            const price =
                Number(
                    document.getElementById("price").value
                );

            const category =
                document.getElementById("category").value;

            const image =
                document.getElementById("image").value.trim();

            const condition =
                document.getElementById("condition").value.trim();

            const description =
                document.getElementById("description").value.trim();

            const stock =
                Number(
                    document.getElementById("stock").value
                );

            /* Validation */

            if (!title) {
                throw new Error("Sisesta toote nimi.");
            }

            if (!price || price <= 0) {
                throw new Error("Sisesta korrektne hind.");
            }

            if (!image) {
                throw new Error("Sisesta pildi URL.");
            }

            /* Firestore */

            await addDoc(
                collection(db, "products"),
                {
                    title,
                    price,
                    category,
                    image,
                    condition,
                    description,
                    stock,

                    createdAt:
                        serverTimestamp(),

                    createdBy:
                        currentUser.uid,

                    createdByEmail:
                        currentUser.email
                }
            );

            successBox.textContent =
                "✅ Toode edukalt avaldatud.";

            /* Reset form */

            document.getElementById("title").value = "";
            document.getElementById("price").value = "";
            document.getElementById("image").value = "";
            document.getElementById("condition").value = "";
            document.getElementById("description").value = "";
            document.getElementById("stock").value = "1";

        } catch (error) {

            console.error(error);

            errorBox.textContent =
                error.message;

        }

    }
);

/* -------------------------------- */
/* OPTIONAL LOGOUT                  */
/* -------------------------------- */

window.logoutAdmin = async () => {

    await signOut(auth);

    location.reload();

};
