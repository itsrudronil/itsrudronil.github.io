import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, setDoc, doc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDAmbvBXIxr4StYtg5obkL7ScKadmAluXU",
  authDomain: "tiers-a0f66.firebaseapp.com",
  projectId: "tiers-a0f66",
  storageBucket: "tiers-a0f66.firebasestorage.app",
  messagingSenderId: "394254274051",
  appId: "1:394254274051:web:b5604e1ff286b90f870836"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ১. লগইন লজিক
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.onclick = async () => {
        const email = document.getElementById('adminEmail').value;
        const pass = document.getElementById('adminPassword').value;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            alert("Login Successful!");
        } catch (e) {
            alert("ভুল ইমেইল বা পাসওয়ার্ড!");
        }
    };
}

// ২. লগআউট লজিক
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.onclick = () => signOut(auth);
}

// ৩. অটো-চেক: ইউজার লগইন করা আছে কি না
const loginSection = document.getElementById('login-section');
const adminPanel = document.getElementById('admin-panel');

onAuthStateChanged(auth, (user) => {
    if (user) {
        if(loginSection) loginSection.classList.add('hidden');
        if(adminPanel) adminPanel.classList.remove('hidden');
    } else {
        if(loginSection) loginSection.classList.remove('hidden');
        if(adminPanel) adminPanel.classList.add('hidden');
    }
});

// ৪. প্লেয়ার সেভ করার লজিক (শুধুমাত্র লগইন থাকলে কাজ করবে)
const saveBtn = document.getElementById('saveBtn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const name = document.getElementById('pName').value.trim();
        const tier = document.getElementById('pTier').value.trim();
        const head = document.getElementById('pHead').value.trim();

        if (!name || !tier) return alert("সব তথ্য দিন!");

        try {
            await setDoc(doc(db, "players", name), {
                username: name,
                tier: tier,
                headUrl: head || `https://mc-heads.net/avatar/${name}`,
                timestamp: Date.now()
            });
            alert("Player Saved!");
            document.getElementById('pName').value = "";
            document.getElementById('pTier').value = "";
            document.getElementById('pHead').value = "";
        } catch (e) { alert("Error: Permission Denied!"); }
    };
}

// ৫. ইনডেক্স পেজে ডাটা দেখানো (আগের মতোই থাকবে)
const tierBody = document.getElementById('tier-body');
if (tierBody) {
    const q = query(collection(db, "players"), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
        tierBody.innerHTML = "";
        snapshot.forEach((doc) => {
            const p = doc.data();
            tierBody.innerHTML += `
                <tr class="border-b border-gray-800">
                    <td class="p-4 flex items-center space-x-4">
                        <img src="${p.headUrl}" class="w-12 h-12 rounded-lg border border-gray-700 shadow-lg object-cover" onerror="this.src='https://mc-heads.net/avatar/steve'">
                        <span class="font-bold text-gray-200">${p.username}</span>
                    </td>
                    <td class="p-4 text-right">
                        <span class="bg-blue-600/20 text-blue-400 px-3 py-1 rounded border border-blue-500/30 text-xs font-bold uppercase">${p.tier}</span>
                    </td>
                </tr>`;
        });
    });
}
