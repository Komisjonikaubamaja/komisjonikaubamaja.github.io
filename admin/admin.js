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
    getDocs,
    deleteDoc,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

/* ==========================
   FIREBASE
========================== */

const firebaseConfig = {

    apiKey: "AIzaSyAsUhFB7YSlqwaIrNBK7N6Z-Ghs6J0-wI8",
    authDomain: "komisjonikaubamaja-ee.firebaseapp.com",
    projectId: "komisjonikaubamaja-ee",
    storageBucket: "komisjonikaubamaja-ee.firebasestorage.app",
    messagingSenderId: "529526657582",
    appId: "1:529526657582:web:1d2973a83f12a1cf3bc5bf",
    measurementId: "G-5PSEG6CB1K"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const provider =
new GoogleAuthProvider();

/* ==========================
   ELEMENTS
========================== */

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

const productsList =
document.getElementById("productsList");

/* ==========================
   USER
========================== */

let currentUser = null;

/* ==========================
   LOGIN
========================== */

loginBtn.addEventListener(
    "click",
    async () => {

        try {

            await signInWithPopup(
                auth,
                provider
            );

        } catch(error){

            errorBox.textContent =
            error.message;

        }

    }
);

/* ==========================
   ADMIN CHECK
========================== */

onAuthStateChanged(
    auth,
    async(user)=>{

        if(!user) return;

        currentUser = user;

        const adminRef =
        doc(
            db,
            "admins",
            user.uid
        );

        const adminSnap =
        await getDoc(adminRef);

        if(!adminSnap.exists()){

            document.body.innerHTML =
            "<h1>Ligipääs keelatud</h1>";

            return;

        }

        loginBox.classList.add("hidden");
        adminPanel.classList.remove("hidden");

        adminEmail.textContent =
        user.email;

        await loadStats();
        await loadProducts();

    }
);

/* ==========================
   ADD PRODUCT
========================== */

publishBtn.addEventListener(
    "click",
    async()=>{

        try{

            const title =
            document.getElementById("title")
            .value.trim();

            const price =
            Number(
                document.getElementById("price")
                .value
            );

            const category =
            document.getElementById("category")
            .value;

            const description =
            document.getElementById("description")
            .value.trim();

            const condition =
            document.getElementById("condition")
            .value.trim();

            const stock =
            Number(
                document.getElementById("stock")
                .value
            );

            const images =
            document.getElementById("images")
            .value
            .split("\n")
            .map(i=>i.trim())
            .filter(Boolean);

            if(!title)
                throw new Error("Toote nimi puudub");

            if(images.length === 0)
                throw new Error("Lisa vähemalt üks pilt");

            await addDoc(
                collection(db,"products"),
                {

                    title,
                    price,
                    category,
                    description,
                    condition,
                    stock,

                    image: images[0],

                    images,

                    createdAt:
                    serverTimestamp(),

                    createdBy:
                    currentUser.uid,

                    createdByEmail:
                    currentUser.email

                }
            );

            successBox.textContent =
            "✅ Toode lisatud";

            errorBox.textContent = "";

            document
            .querySelectorAll(
                "input,textarea"
            )
            .forEach(
                el=>{

                    if(
                        el.id !== "stock"
                    ){

                        el.value="";

                    }

                }
            );

            loadStats();
            loadProducts();

        }catch(error){

            errorBox.textContent =
            error.message;

        }

    }
);

/* ==========================
   STATS
========================== */

async function loadStats(){

    const snap =
    await getDocs(
        collection(db,"products")
    );

    let stock = 0;

    const categories =
    new Set();

    snap.forEach(doc=>{

        const data =
        doc.data();

        stock +=
        Number(
            data.stock || 0
        );

        categories.add(
            data.category
        );

    });

    document.getElementById(
        "totalProducts"
    ).textContent =
    snap.size;

    document.getElementById(
        "totalCategories"
    ).textContent =
    categories.size;

    document.getElementById(
        "totalStock"
    ).textContent =
    stock;

}

/* ==========================
   PRODUCTS
========================== */

async function loadProducts(){

    const snap =
    await getDocs(
        collection(db,"products")
    );

    let html = "";

    snap.forEach(docSnap=>{

        const product =
        docSnap.data();

        html += `

        <div class="admin-product">

            <img
                src="${product.image}"
                width="80"
            >

            <div>

                <strong>
                    ${product.title}
                </strong>

                <p>
                    ${product.price}€
                </p>

            </div>

            <button
                class="delete-btn"
                onclick="deleteProduct('${docSnap.id}')"
            >
                Kustuta
            </button>

        </div>

        `;

    });

    productsList.innerHTML =
    html || "Tooteid pole.";

}

/* ==========================
   DELETE
========================== */

window.deleteProduct =
async(id)=>{

    if(
        !confirm(
            "Kustuta toode?"
        )
    ) return;

    await deleteDoc(
        doc(
            db,
            "products",
            id
        )
    );

    loadStats();
    loadProducts();

};

/* ==========================
   LOGOUT
========================== */

window.logoutAdmin =
async()=>{

    await signOut(auth);

    location.reload();

};
