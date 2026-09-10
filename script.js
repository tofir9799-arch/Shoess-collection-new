import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyD8fVEBmZDsbT2HAkeghb9VwviW8Kqe-Ds",
  authDomain: "shoess-collection.firebaseapp.com",
  projectId: "shoess-collection",
  storageBucket: "shoess-collection.firebasestorage.app",
  messagingSenderId: "947805916030",
  appId: "1:947805916030:web:6a8efeb305c258a78f412f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elements
const productsBox = document.getElementById("products");
const search = document.getElementById("search");
const cartCount = document.getElementById("cartCount");
const modal = document.getElementById("modal");

let products = [];
let cart = [];
let currentProduct = {};
let activeCategory = "All";

// Products Load
async function loadProducts() {
  products = [];
  const snap = await getDocs(collection(db, "products"));

  snap.forEach(doc => {
    products.push({
      id: doc.id,
      ...doc.data()
    });
  });

  renderProducts();
}

// Render Products
function renderProducts() {
  productsBox.innerHTML = "";

  const keyword = search.value.toLowerCase();

  products
    .filter(p => {
      const category = p.category || "Sports";

      const matchCategory =
        activeCategory === "All" || category === activeCategory;

      const matchSearch =
        p.name.toLowerCase().includes(keyword);

      return matchCategory && matchSearch;
    })
    .forEach(p => {

      const status = p.status || "In Stock";

      productsBox.innerHTML += `
      <div class="card">

        <img src="${p.image}" alt="${p.name}">

        <div class="info">

          <h3>${p.name}</h3>

          <div class="price">₹${p.salePrice || p.price}</div>

          ${
            p.salePrice && p.salePrice != p.price
              ? `<div class="old-price">₹${p.price}</div>`
              : ""
          }

          <span class="stock ${
            status === "In Stock" ? "in" : "out"
          }">${status}</span>

          <div class="actions">

            <button class="cart-btn"
              onclick="addCart('${p.id}')">

              Cart

            </button>

            <button class="buy-btn"
              onclick="buyNow('${p.id}')">

              Buy Now

            </button>

          </div>

        </div>

      </div>`;
    });
}

// Search
search.addEventListener("input", renderProducts);

// Filter
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.onclick = () => {

    document.querySelector(".filter-btn.active")
      .classList.remove("active");

    btn.classList.add("active");

    activeCategory = btn.innerText;

    renderProducts();
  };
});

// Cart
window.addCart = id => {

  const p = products.find(x => x.id === id);

  if (!p) return;

  cart.push(p);

  cartCount.innerText = cart.length;

  alert(`${p.name} added to cart`);
};

// Buy Now
window.buyNow = id => {

  const p = products.find(x => x.id === id);

  if (!p) return;

  currentProduct = p;

  modal.classList.add("show");
};

// Close
window.closeModal = () => {
  modal.classList.remove("show");
};

// Place Order
window.sendOrder = async () => {

  const name = document
    .getElementById("custName")
    .value.trim();

  const phone = document
    .getElementById("custPhone")
    .value.trim();

  const address = document
    .getElementById("custAddress")
    .value.trim();

  const city = document
    .getElementById("custCity")
    .value.trim();

  const pin = document
    .getElementById("custPin")
    .value.trim();

  const payment = document
    .getElementById("payment")
    .value;

  if (!name || !phone || !address || !city || !pin) {

    alert("Please fill all details");

    return;
  }

  const orderId = "SC" + Date.now();

  await addDoc(collection(db, "orders"), {

    orderId,

    product: currentProduct.name,

    price: currentProduct.salePrice || currentProduct.price,

    name,

    phone,

    address,

    city,

    pin,

    payment,

    status: "Pending",

    date: new Date().toISOString()
  });

  alert("Order Placed Successfully!");

  modal.classList.remove("show");

  document.getElementById("custName").value = "";
  document.getElementById("custPhone").value = "";
  document.getElementById("custAddress").value = "";
  document.getElementById("custCity").value = "";
  document.getElementById("custPin").value = "";
};

// Start
loadProducts();
