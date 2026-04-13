import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, setDoc, doc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ১. আপনার Firebase Config এখানে দিন
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

// --- Auth Handling ---
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.onclick = async () => {
        const email = document.getElementById('adminEmail').value;
        const pass = document.getElementById('adminPassword').value;
        try { await signInWithEmailAndPassword(auth, email, pass); } catch (e) { alert("Wrong Login!"); }
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
if(document.getElementById('logoutBtn')) { document.getElementById('logoutBtn').onclick = () => signOut(auth); }

// ২. Save Logic with Manual Position
const saveBtn = document.getElementById('saveBtn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const pos = document.getElementById('pPos').value;
        const name = document.getElementById('pName').value.trim();
        const tier = document.getElementById('pTier').value.trim();
        const mode = document.getElementById('pMode').value.trim();
        const head = document.getElementById('pHead').value.trim();

        if (!pos || !name || !tier) return alert("Position, Name and Tier are required!");

        try {
            await setDoc(doc(db, "players", name), {
                position: parseInt(pos), // নম্বর হিসেবে সেভ হবে
                username: name,
                tier: tier,
                mode: mode || "Overall",
                headUrl: head,
                timestamp: Date.now()
            });
            alert("Player set to position #" + pos);
            document.querySelectorAll('input').forEach(i => i.value = "");
        } catch (e) { console.error(e); }
    };
}

// ৩. Display Logic (Sorted by Position)
const tierBody = document.getElementById('tier-body');
if (tierBody) {
    const q = query(collection(db, "players"), orderBy("position", "asc"));
    onSnapshot(q, (snapshot) => {
        tierBody.innerHTML = "";
        snapshot.forEach((doc) => {
            const p = doc.data();
            
            // পজিশন কালার লজিক
            let rankClass = "text-gray-600";
            if (p.position === 1) rankClass = "text-yellow-500 text-xl font-black drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]";
            if (p.position === 2) rankClass = "text-gray-300 font-black";
            if (p.position === 3) rankClass = "text-orange-500 font-black";

            tierBody.innerHTML += `
                <tr class="group hover:bg-white/[0.02] transition duration-500">
                    <td class="px-8 py-6 flex items-center space-x-6">
                        <div class="flex items-center space-x-5">
                            <span class="w-8 text-center uppercase tracking-tighter ${rankClass}">
                                #${p.position}
                            </span>
                            
                            <div class="w-20 h-20 bg-gray-900/40 rounded-2xl border border-gray-800/60 flex items-center justify-center p-2 relative">
                                <img src="${p.headUrl}" 
                                     class="w-full h-full object-contain drop-shadow-[0_12px_15px_rgba(0,0,0,0.9)] transition-all group-hover:scale-110" 
                                     onerror="this.src='https://mc-heads.net/avatar/steve'">
                                <div class="absolute -top-1 -right-1 w-3 h-3 ${p.position === 1 ? 'bg-yellow-500' : 'bg-blue-600'} rounded-full border-2 border-[#0b0e14]"></div>
                            </div>
                        </div>

                        <div>
                            <span class="text-xl font-black text-gray-100 group-hover:text-blue-400 transition italic uppercase tracking-tighter">${p.username}</span>
                            <p class="text-[9px] text-blue-500/70 font-black uppercase tracking-widest mt-1 italic">${p.mode}</p>
                        </div>
                    </td>
                    <td class="px-8 py-6 text-right">
                        <span class="inline-block px-5 py-2 rounded-xl bg-gray-900/50 text-blue-400 text-xs font-black border border-blue-500/20 shadow-2xl">
                            ${p.tier}
                        </span>
                    </td>
                </tr>
            `;
        });
    });
}
