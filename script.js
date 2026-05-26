const siteHeader = document.getElementById("siteHeader");
const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");
const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
}

const setHeaderState = () => {
    if (!siteHeader) return;
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

const closeNav = () => {
    if (!navToggle || !siteNav) return;
    siteNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
    navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
};

if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
        const isOpen = siteNav.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
        navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
        navToggle.innerHTML = isOpen
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';
    });

    siteNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeNav();
        }
    });
}

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.14 }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
} else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
}

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const sendBtn = document.getElementById("sendBtn");

const firebaseConfig = {
    apiKey: "AIzaSyBGcbV4C95O7l6QoUPDI_ebE8PhksCa-hU",
    authDomain: "portfolio-c2d02.firebaseapp.com",
    projectId: "portfolio-c2d02",
    storageBucket: "portfolio-c2d02.firebasestorage.app",
    messagingSenderId: "6893797042",
    appId: "1:6893797042:web:62b3c5dad39bb36b9e53ab",
    measurementId: "G-GW9FW2P99B"
};

let addDoc;
let collection;
let serverTimestamp;
let db;
let contactStoreReady = false;

const setStatus = (message, state = "") => {
    if (!formStatus) return;
    formStatus.textContent = message;
    if (state) {
        formStatus.dataset.state = state;
    } else {
        delete formStatus.dataset.state;
    }
};

const createMailto = ({ name, email, message }) => {
    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    return `mailto:sm5963397@gmail.com?subject=${subject}&body=${body}`;
};

const prepareContactStore = async () => {
    try {
        const firebaseApp = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
        const firestore = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
        const app = firebaseApp.initializeApp(firebaseConfig);

        addDoc = firestore.addDoc;
        collection = firestore.collection;
        serverTimestamp = firestore.serverTimestamp;
        db = firestore.getFirestore(app);
        contactStoreReady = true;
    } catch {
        contactStoreReady = false;
    }
};

prepareContactStore();

if (contactForm && sendBtn) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("name")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const message = document.getElementById("message")?.value.trim();

        if (!name || !email || !message) {
            setStatus("Please fill in all fields.", "error");
            return;
        }

        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending';
        setStatus("Sending your message...");

        const mailto = createMailto({ name, email, message });

        if (!contactStoreReady) {
            setStatus("Contact service is unavailable. Opening your email app instead.", "error");
            window.location.href = mailto;
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
            return;
        }

        try {
            await addDoc(collection(db, "messages"), {
                name,
                email,
                message,
                source: "portfolio",
                createdAt: serverTimestamp()
            });

            setStatus("Message sent successfully. Thank you!", "success");
            contactForm.reset();
        } catch {
            setStatus("Message could not be saved. Opening your email app instead.", "error");
            window.location.href = mailto;
        } finally {
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
        }
    });
}
