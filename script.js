import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, setDoc, doc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ১. আপনার Firebase Config এখানে আপডেট করুন
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

// --- Admin Auth Logic ---
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.onclick = async () => {
        const email = document.getElementById('adminEmail').value;
        const pass = document.getElementById('adminPassword').value;
        try { await signInWithEmailAndPassword(auth, email, pass); alert("Logged In!"); } 
        catch (e) { alert("Login Error!"); }
    };
}

onAuthStateChanged(auth, (user) => {
    const loginSec = document.getElementById('login-section');
    const adminPan = document.getElementById('admin-panel');
    if (user) {
        if(loginSec) loginSec.classList.add('hidden');
        if(adminPan) adminPan.classList.remove('hidden');
    } else {
        if(loginSec) loginSec.classList.remove('hidden');
        if(adminPan) adminPan.classList.add('hidden');
    }
});

// ২. Player Save Function (Admin Panel এর জন্য)
const saveBtn = document.getElementById('saveBtn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const name = document.getElementById('pName').value.trim();
        const tier = document.getElementById('pTier').value.trim();
        const head = document.getElementById('pHead').value.trim();

        if (!name || !tier || !head) return alert("All fields are required!");

        try {
            await setDoc(doc(db, "players", name), {
                username: name,
                tier: tier,
                headUrl: head,
                timestamp: Date.now()
            });
            alert("Player added to rankings!");
            document.querySelectorAll('input').forEach(i => i.value = "");
        } catch (e) { console.error(e); }
    };
}

// ৩. Real-time Tier List Display (Home Page এর জন্য)
const tierBody = document.getElementById('tier-body');
if (tierBody) {
    const q = query(collection(db, "players"), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
        tierBody.innerHTML = "";
        snapshot.forEach((doc) => {
            const p = doc.data();
            
            // এই Row-টি আপনার ম্যানুয়াল PNG ছবিকে সুন্দরভাবে শো করবে
            tierBody.innerHTML += `
                <tr class="group">
                    <td class="px-8 py-5 flex items-center space-x-6">
                        <div class="w-20 h-20 avatar-box rounded-2xl border border-gray-800/50 flex items-center justify-center p-2 relative overflow-hidden">
                            <img src="${p.headUrl}" 
                                 class="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-110" 
                                 alt="Skin">
                        </div>
                        <div>
                            <span class="text-xl font-bold text-gray-100 tracking-tight group-hover:text-blue-400 transition">${p.username}</span>
                            <p class="text-[9px] text-gray-600 uppercase font-black tracking-[0.2em] mt-1">Cracked Verified</p>
                        </div>
                    </td>
                    <td class="px-8 py-5 text-right">
                        <span class="inline-block px-6 py-2 rounded-lg glass-badge text-blue-400 text-xs font-black shadow-lg border border-blue-500/20">
                            ${p.tier}
                        </span>
                    </td>
                </tr>
            `;
        });
    });
}
