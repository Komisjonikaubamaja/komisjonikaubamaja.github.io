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
    updateDoc,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

/* ==========================
   FIREBASE STUFF
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
   ELEMENDID
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

const offersContainer =
document.getElementById("offersContainer");

const productsManager =
document.getElementById("productsManager");

const editModal =
document.getElementById("editModal");

const closeModalBtn =
document.getElementById("closeModalBtn");

const saveProductBtn =
document.getElementById("saveProductBtn");

const repairsContainer =
document.getElementById(
    "repairsContainer"
);

let editingProductId = null;

/* ==========================
   KASUTAJA
========================== */

let currentUser = null;
let allProducts = [];

/* ==========================
   SISSELOGIMINE
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
   ADMINISTRAATORI KONTROLL
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
        
        loadOffers();
        loadProductsManager();
        loadRepairs();
        await loadStats();
        await loadProducts();

    }
);

async function loadOffers(){

    try{

        const snapshot =
        await getDocs(
            collection(db,"offers")
        );

        if(snapshot.empty){

            offersContainer.innerHTML = `
                <div class="empty">
                    Pakkumisi pole.
                </div>
            `;

            return;
        }

        let html = "";

        snapshot.forEach(docSnap=>{

            const offer = docSnap.data();

            html += `

            <div class="offer-card">

                <div class="offer-header">

                    <div class="offer-name">
                        ${offer.name || "Nimi puudub"}
                    </div>

                    <div class="offer-category">
                        ${offer.category || "-"}
                    </div>

                </div>

                <div class="offer-info">

                    <div>
                        📧 ${offer.email || "-"}
                    </div>

                    <div>
                        📞 ${offer.phone || "-"}
                    </div>

                    <div>
                        💰 ${offer.price || 0}€
                    </div>

                </div>

                <div class="offer-description">
                    ${offer.description || ""}
                </div>

                ${
                    offer.image
                    ?
                    `
                    <img
                    src="${offer.image}"
                    style="
                        margin-top:15px;
                        max-width:250px;
                        border-radius:12px;
                    ">
                    `
                    :
                    ""
                }

                <div class="offer-actions">

                    <button
                    class="offer-btn review"
                    onclick="markReviewed('${docSnap.id}')">

                        Märgi vaadatuks

                    </button>

                    <button
                    class="offer-btn delete"
                    onclick="deleteOffer('${docSnap.id}')">

                        Kustuta

                    </button>

                    <button
                    class="offer-btn convert"
                    onclick="convertOffer('${docSnap.id}')">

                        Lisa tooteks

                    </button>

                </div>

            </div>

            `;

        });

        offersContainer.innerHTML = html;

    }

    catch(error){

        console.error(error);

        offersContainer.innerHTML =
        "Pakkumiste laadimine ebaõnnestus.";

    }

}

/* ==========================
   LISA TOODE
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
   STATISTIKA
========================== */

async function loadStats(){

    const snap =
    await getDocs(
        collection(db,"products")
    );
    const repairsSnap =
    await getDocs(
        collection(db,"repairs")
    );

    document.getElementById(
        "totalRepairs"
    ).textContent =
    repairsSnap.size;

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
   TOOTED
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
   KUSTUTAMINE
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
   VÄLJA LOGIMINE
========================== */

window.logoutAdmin =
async()=>{

    await signOut(auth);

    location.reload();

};

window.markReviewed = async(id)=>{

    await updateDoc(
        doc(db,"offers",id),
        {
            status:"reviewed"
        }
    );

    loadOffers();

};
window.deleteOffer = async(id)=>{

    if(!confirm("Kustutada pakkumine?"))
        return;

    await deleteDoc(
        doc(db,"offers",id)
    );

    loadOffers();

};
window.convertOffer = async(id)=>{

    const snap =
    await getDoc(
        doc(db,"offers",id)
    );

    if(!snap.exists()) return;

    const offer =
    snap.data();

    await addDoc(
        collection(db,"products"),
        {
            title:
                offer.category +
                " pakkumine",

            category:
                offer.category,

            description:
                offer.description,

            image:
                offer.image || "",

            price:
                offer.price || 0,

            condition:
                "Kasutatud",

            status:
                "available",

            views:0,

            createdAt:
                serverTimestamp()
        }
    );

    alert(
        "Toode lisatud kataloogi."
    );

};
async function loadProductsManager(){

    const snapshot =
    await getDocs(
        collection(db,"products")
    );

    allProducts =
    snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
    }));

    renderProducts(allProducts);

}
window.deleteProduct = async(id)=>{

    if(!confirm("Kas kustutada toode?"))
        return;

    await deleteDoc(
        doc(db,"products",id)
    );

    loadProductsManager();
};
window.markSold = async(id)=>{

    await updateDoc(
        doc(db,"products",id),
        {
            status:"sold"
        }
    );

    loadProductsManager();
};
window.hideProduct = async(id)=>{

    await updateDoc(
        doc(db,"products",id),
        {
            status:"hidden"
        }
    );

    loadProductsManager();
};
window.editProduct = async(id)=>{

    try{

        const snap =
        await getDoc(
            doc(db,"products",id)
        );

        if(!snap.exists())
            return;

        const product =
        snap.data();

        editingProductId = id;

        document.getElementById(
            "editTitle"
        ).value =
        product.title || "";

        document.getElementById(
            "editPrice"
        ).value =
        product.price || "";

        document.getElementById(
            "editStock"
        ).value =
        product.stock ?? 1;

        document.getElementById(
            "editCategory"
        ).value =
        product.category || "";

        document.getElementById(
            "editCondition"
        ).value =
        product.condition || "";

        document.getElementById(
            "editStatus"
        ).value =
        product.status || "available";

        document.getElementById(
            "editDescription"
        ).value =
        product.description || "";

        document.getElementById(
            "editImages"
        ).value =
        product.images
        ?
        product.images.join("\n")
        :
        (
            product.image
            ?
            product.image
            :
            ""
        );

        editModal.classList.remove(
            "hidden"
        );

    }

    catch(error){

        console.error(error);

    }

};
closeModalBtn.addEventListener(
    "click",
    ()=>{
        editModal.classList.add(
            "hidden"
        );
    }
);
saveProductBtn.addEventListener(
    "click",
    async()=>{

        if(!editingProductId)
            return;

        try{

            const title =
            document.getElementById(
                "editTitle"
            ).value.trim();

            const price =
            Number(
                document.getElementById(
                    "editPrice"
                ).value
            );

            const stock =
            Number(
                document.getElementById(
                    "editStock"
                ).value
            );

            const category =
            document.getElementById(
                "editCategory"
            ).value.trim();

            const condition =
            document.getElementById(
                "editCondition"
            ).value.trim();

            const status =
            document.getElementById(
                "editStatus"
            ).value;

            const description =
            document.getElementById(
                "editDescription"
            ).value.trim();

            const images =
            document
            .getElementById(
                "editImages"
            )
            .value
            .split("\n")
            .map(url=>url.trim())
            .filter(Boolean);

            await updateDoc(
                doc(
                    db,
                    "products",
                    editingProductId
                ),
                {
                    title,
                    price,
                    stock,
                    category,
                    condition,
                    status,
                    description,

                    images,

                    image:
                    images[0] || ""
                }
            );

            editModal.classList.add(
                "hidden"
            );

            loadProductsManager();

        }

        catch(error){

            console.error(error);

            alert(
                "Salvestamine ebaõnnestus."
            );

        }

    }
);
function renderProducts(products){

    productsManager.innerHTML = "";

    if(products.length === 0){

        productsManager.innerHTML =
        "<p>Tooteid ei leitud.</p>";

        return;
    }

    products.forEach(product => {

        const card =
        document.createElement("div");

        card.className =
        "admin-product";

        card.innerHTML = `

        <div class="admin-product-header">

            <div>

                <div class="admin-product-title">
                    ${product.title}
                </div>

                <div>
                    ${product.category || ""}
                </div>

            </div>

            <div class="admin-product-price">
                ${product.price || 0}€
            </div>

        </div>

        <div>
            Staatus:
            ${product.status || "available"}
        </div>

        <div>
            Laos:
            ${product.stock ?? 1}
        </div>

        <div class="admin-product-actions">

            <button
            class="admin-action-btn btn-edit"
            onclick="editProduct('${product.id}')">
                Muuda
            </button>

            <button
            class="admin-action-btn btn-sold"
            onclick="markSold('${product.id}')">
                Märgi müüdud
            </button>

            <button
            class="admin-action-btn btn-hide"
            onclick="hideProduct('${product.id}')">
                Peida
            </button>

            <button
            class="admin-action-btn btn-delete"
            onclick="deleteProduct('${product.id}')">
                Kustuta
            </button>

        </div>

        `;

        productsManager.appendChild(card);

    });

}
const productSearch =
document.getElementById("productSearch");

if(productSearch){

    productSearch.addEventListener(
        "input",
        ()=>{

            const term =
            productSearch.value
            .toLowerCase()
            .trim();

            const filtered =
            allProducts.filter(product =>

                (product.title || "")
                .toLowerCase()
                .includes(term)

            );

            renderProducts(filtered);

        }
    );

}
async function loadRepairs(){

    try{

        const snapshot =
        await getDocs(
            collection(db,"repairs")
        );

        if(snapshot.empty){

            repairsContainer.innerHTML = `
                <div class="empty">
                    Remondipäringuid pole.
                </div>
            `;

            return;
        }

        let html = "";

        snapshot.forEach(docSnap=>{

            const repair =
            docSnap.data();

            html += `

            <div class="offer-card">

                <div class="offer-header">

                    <div class="offer-name">
                        ${repair.name || "-"}
                    </div>

                    <div class="offer-category">
                        ${repair.category || "-"}
                    </div>

                </div>

                <div class="offer-info">

                    <div>
                        📧 ${repair.email || "-"}
                    </div>

                    <div>
                        📞 ${repair.phone || "-"}
                    </div>

                    <div>
                        📱 ${repair.device || "-"}
                    </div>

                </div>

                <div class="offer-description">

                    <strong>
                        ${repair.problem || ""}
                    </strong>

                    <br><br>

                    ${repair.description || ""}

                </div>

                <div style="margin-top:15px;">

                    Staatus:
                    <strong>
                        ${repair.status || "new"}
                    </strong>

                </div>

                <div class="offer-actions">

                    <button
                    class="offer-btn review"
                    onclick="startRepair('${docSnap.id}')">

                        Töös

                    </button>

                    <button
                    class="offer-btn convert"
                    onclick="finishRepair('${docSnap.id}')">

                        Valmis

                    </button>

                    <button
                    class="offer-btn delete"
                    onclick="deleteRepair('${docSnap.id}')">

                        Kustuta

                    </button>

                </div>

            </div>

            `;

        });

        repairsContainer.innerHTML =
        html;

    }

    catch(error){

        console.error(error);

    }

}
window.startRepair =
async(id)=>{

    await updateDoc(
        doc(db,"repairs",id),
        {
            status:"in_progress"
        }
    );

    loadRepairs();

};

window.finishRepair =
async(id)=>{

    await updateDoc(
        doc(db,"repairs",id),
        {
            status:"completed"
        }
    );

    loadRepairs();

};

window.deleteRepair =
async(id)=>{

    if(
        !confirm(
            "Kas kustutada remondipäring?"
        )
    ) return;

    await deleteDoc(
        doc(db,"repairs",id)
    );

    loadRepairs();

};
