import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc,
    updateDoc,
    increment,
    collection,
    getDocs
}
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

/* FIREBASE */

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
const db = getFirestore(app);

/* URL */

const params =
new URLSearchParams(window.location.search);

const productId =
params.get("id");

if(!productId){

    window.location.href =
    "https://komisjonikaubamaja.github.io/kataloog";

}

/* ELEMENTS */

const mainImage =
document.getElementById("mainImage");

const thumbnailRow =
document.getElementById("thumbnailRow");

const titleEl =
document.getElementById("productTitle");

const breadcrumbTitle =
document.getElementById("breadcrumbTitle");

const priceEl =
document.getElementById("productPrice");

const categoryEl =
document.getElementById("productCategory");

const conditionEl =
document.getElementById("productCondition");

const descriptionEl =
document.getElementById("productDescription");

const viewsEl =
document.getElementById("productViews");

const dateEl =
document.getElementById("productDate");

const statusEl =
document.getElementById("productStatus");

const similarContainer =
document.getElementById("similarProducts");

/* LOAD PRODUCT */

async function loadProduct(){

    try{

        const productRef =
        doc(db,"products",productId);

        const snapshot =
        await getDoc(productRef);

        if(!snapshot.exists()){

            window.location.href =
            "https://komisjonikaubamaja.github.io/kataloog";

            return;

        }

        const product =
        snapshot.data();

        /* VIEW COUNTER */

        await updateDoc(
            productRef,
            {
                views: increment(1)
            }
        );

        /* TITLE */

        document.title =
        product.title +
        " - Komisjonikaubamaja";

        titleEl.textContent =
        product.title || "Toode";

        breadcrumbTitle.textContent =
        product.title || "Toode";

        priceEl.textContent =
        (product.price || 0) + "€";

        categoryEl.textContent =
        product.category || "Muu";

        conditionEl.textContent =
        product.condition || "-";

        descriptionEl.textContent =
        product.description ||
        "Kirjeldus puudub.";

        viewsEl.textContent =
        (product.views || 0) + 1;

        /* STATUS */

        const status =
        product.status || "available";

        if(status === "sold"){

            statusEl.textContent =
            "Müüdud";

            statusEl.className =
            "status sold";

        }

        else{

            statusEl.textContent =
            "Saadaval";

            statusEl.className =
            "status available";

        }

        /* DATE */

        if(product.createdAt){

            const date =
            product.createdAt
            .toDate();

            dateEl.textContent =
            date.toLocaleDateString("et-EE");

        }

        /* IMAGES */

        let images = [];

        if(
            product.images &&
            Array.isArray(product.images) &&
            product.images.length
        ){

            images =
            product.images;

        }

        else if(product.image){

            images =
            [product.image];

        }

        else{

            images =
            ["https://placehold.co/1000x700"];
        }

        mainImage.src =
        images[0];

        thumbnailRow.innerHTML = "";

        images.forEach((url,index)=>{

            const thumb =
            document.createElement("img");

            thumb.src =
            url;

            thumb.className =
            index === 0
            ? "thumbnail active"
            : "thumbnail";

            thumb.addEventListener(
                "click",
                ()=>{

                    mainImage.src =
                    url;

                    document
                    .querySelectorAll(
                        ".thumbnail"
                    )
                    .forEach(img =>
                        img.classList.remove(
                            "active"
                        )
                    );

                    thumb.classList.add(
                        "active"
                    );

                }
            );

            thumbnailRow.appendChild(
                thumb
            );

        });

        /* SIMILAR PRODUCTS */

        loadSimilarProducts(
            product.category,
            productId
        );

    }

    catch(error){

        console.error(error);

        window.location.href =
        "https://komisjonikaubamaja.github.io/kataloog";

    }

}

/* SIMILAR */

async function loadSimilarProducts(
    category,
    currentId
){

    try{

        const snapshot =
        await getDocs(
            collection(
                db,
                "products"
            )
        );

        const products =
        snapshot.docs
        .map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
        .filter(product =>

            product.id !== currentId &&
            product.category === category

        )
        .sort(() =>
            0.5 - Math.random()
        )
        .slice(0,4);

        similarContainer.innerHTML =
        "";

        products.forEach(product => {

            const card =
            document.createElement("a");

            card.href =
            `toode.html?id=${product.id}`;

            card.className =
            "similar-card";

            card.innerHTML = `
                <img
                    src="${
                        product.image ||
                        "https://placehold.co/400x300"
                    }"
                >

                <div class="similar-content">

                    <h3>
                        ${
                            product.title ||
                            "Toode"
                        }
                    </h3>

                    <div class="similar-price">
                        ${
                            product.price || 0
                        }€
                    </div>

                </div>
            `;

            similarContainer
            .appendChild(card);

        });

    }

    catch(error){

        console.error(error);

    }

}

loadProduct();
