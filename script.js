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

// --- Admin Authentication Logic ---
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.onclick = async () => {
        const email = document.getElementById('adminEmail').value;
        const pass = document.getElementById('adminPassword').value;
        try { await signInWithEmailAndPassword(auth, email, pass); } catch (e) { alert("Invalid Staff Credentials!"); }
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

if(document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').onclick = () => signOut(auth);
}

// ২. Save Logic
const saveBtn = document.getElementById('saveBtn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const name = document.getElementById('pName').value.trim();
        const tier = document.getElementById('pTier').value.trim();
        const mode = document.getElementById('pMode').value.trim();
        const head = document.getElementById('pHead').value.trim();

        if (!name || !tier) return alert("IGN and Tier are required!");

        try {
            await setDoc(doc(db, "players", name), {
                username: name,
                tier: tier,
                mode: mode || "Overall",
                headUrl: head,
                timestamp: Date.now()
            });
            alert("Entry Verified & Published!");
            document.querySelectorAll('input').forEach(i => i.value = "");
        } catch (e) { console.error(e); }
    };
}

// ৩. Display Logic with Rank next to Avatar
const tierBody = document.getElementById('tier-body');
if (tierBody) {
    const q = query(collection(db, "players"), orderBy("timestamp", "asc"));
    onSnapshot(q, (snapshot) => {
        tierBody.innerHTML = "";
        let rank = 1;

        snapshot.forEach((doc) => {
            const p = doc.data();
            
            // পজিশন ব্যাজের কালার
            let rankBadge = "bg-gray-800 text-gray-400";
            if (rank === 1) rankBadge = "bg-yellow-500/20 text-yellow-500 border border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.2)]";
            if (rank === 2) rankBadge = "bg-slate-400/20 text-slate-300 border border-slate-400/40";
            if (rank === 3) rankBadge = "bg-orange-600/20 text-orange-500 border border-orange-600/40";

            tierBody.innerHTML += `
                <tr class="group hover:bg-blue-600/[0.03] transition duration-500">
                    <td class="px-8 py-6 flex items-center space-x-6">
                        <div class="flex items-center space-x-4">
                            <span class="w-8 text-center text-sm font-black uppercase tracking-tighter ${rank === 1 ? 'text-yellow-500 text-lg' : 'text-gray-600'}">
                                #${rank}
                            </span>
                            
                            <div class="w-20 h-20 bg-gray-900/40 rounded-2xl border border-gray-800/60 flex items-center justify-center p-2 relative">
                                <img src="${p.headUrl}" 
                                     class="w-full h-full object-contain drop-shadow-[0_12px_15px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:scale-110" 
                                     onerror="this.src='https://mc-heads.net/avatar/steve'">
                                <div class="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-[#0b0e14] shadow-lg"></div>
                            </div>
                        </div>

                        <div>
                            <span class="text-xl font-black text-gray-100 group-hover:text-blue-400 transition italic tracking-tight uppercase">${p.username}</span>
                            <div class="flex items-center mt-1.5">
                                <span class="bg-blue-600/10 text-blue-500 text-[9px] px-2 py-0.5 rounded border border-blue-500/20 font-black uppercase tracking-[0.15em] italic">${p.mode}</span>
                            </div>
                        </div>
                    </td>
                    <td class="px-8 py-6 text-right">
                        <span class="inline-block px-5 py-2 rounded-xl bg-gray-900/50 text-blue-400 text-xs font-black border border-blue-500/30 uppercase tracking-widest shadow-xl">
                            ${p.tier}
                        </span>
                    </td>
                </tr>
            `;
            rank++;
        });
    });
}
