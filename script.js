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

// --- Auth Handling (Admin Panel Login) ---
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.onclick = async () => {
        const email = document.getElementById('adminEmail').value;
        const pass = document.getElementById('adminPassword').value;
        try { await signInWithEmailAndPassword(auth, email, pass); } catch (e) { alert("Access Denied!"); }
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

// --- Save Logic (Admin Panel e data save korar jonno) ---
const saveBtn = document.getElementById('saveBtn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const name = document.getElementById('pName').value.trim();
        const pos = document.getElementById('pPos').value;
        const head = document.getElementById('pHead').value.trim();

        const modes = {
            sword: { tier: document.getElementById('tSword').value || "N/A", pts: parseInt(document.getElementById('pSword').value) || 0 },
            nethpot: { tier: document.getElementById('tNethpot').value || "N/A", pts: parseInt(document.getElementById('pNethpot').value) || 0 },
            crystal: { tier: document.getElementById('tCrystal').value || "N/A", pts: parseInt(document.getElementById('pCrystal').value) || 0 },
            mace: { tier: document.getElementById('tMace').value || "N/A", pts: parseInt(document.getElementById('pMace').value) || 0 },
            uhc: { tier: document.getElementById('tUHC').value || "N/A", pts: parseInt(document.getElementById('pUHC').value) || 0 }
        };

        const totalPoints = modes.sword.pts + modes.nethpot.pts + modes.crystal.pts + modes.mace.pts + modes.uhc.pts;

        if (!name || !pos) return alert("IGN and Position required!");

        try {
            await setDoc(doc(db, "players", name), {
                username: name,
                position: parseInt(pos),
                headUrl: head,
                modes: modes,
                totalPoints: totalPoints,
                timestamp: Date.now()
            });
            alert("Master Profile updated!");
            location.reload(); 
        } catch (e) { console.error(e); }
    };
}

// --- Short Name Dictionary (Hover korle jeta dekhabe) ---
const modeShortNames = {
    sword: "SWORD",
    nethpot: "NETHPOT",
    crystal: "CRYSTAL",
    mace: "MACE",
    uhc: "UHC"
};

// --- Tier Color Helper Function ---
function getTierColorClass(tier) {
    if (!tier || tier === "N/A" || tier === "Unranked") return "text-gray-600 bg-gray-900/50 border-gray-700/50";
    const normalizedTier = tier.toUpperCase();
    if (normalizedTier.startsWith('HT')) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    if (normalizedTier.startsWith('LT')) return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    return "text-gray-100 bg-gray-800 border-gray-700";
}

// --- Display Logic with Fixed Tooltip (peer & peer-hover) ---
const tierBody = document.getElementById('tier-body');
if (tierBody) {
    const q = query(collection(db, "players"), orderBy("position", "asc"));
    onSnapshot(q, (snapshot) => {
        tierBody.innerHTML = "";
        snapshot.forEach((doc) => {
            const p = doc.data();
            
            let rankClass = p.position === 1 ? "text-yellow-500 font-black text-2xl shadow-yellow-500" : "text-gray-600 font-bold";

            let modePillarsHTML = "";
            for (const modeKey in p.modes) {
                const mode = p.modes[modeKey];
                const iconSrc = `assets/${modeKey}.png`;
                const colorClass = getTierColorClass(mode.tier);
                
                // শর্ট নাম নেওয়া
                const shortName = modeShortNames[modeKey] || modeKey.toUpperCase();

                modePillarsHTML += `
                    <div class="relative flex flex-col items-center gap-1.5 text-center shrink-0 cursor-pointer">
                        
                        <img src="${iconSrc}" alt="${modeKey} icon" class="peer w-8 h-8 object-contain transition-transform duration-300 hover:scale-110 relative z-10" onerror="this.src='https://mctiers.com/assets/images/overall.png'">
                        
                        <div class="absolute bottom-[110%] left-1/2 -translate-x-1/2 mb-1 bg-gray-950/95 border border-blue-500/50 text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded shadow-2xl transition-all duration-200 opacity-0 pointer-events-none peer-hover:opacity-100 z-50 whitespace-nowrap">
                            ${shortName}
                        </div>

                        <span class="inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${colorClass} italic mt-1">
                            ${mode.tier}
                        </span>
                    </div>
                `;
            }

            tierBody.innerHTML += `
                <tr class="group hover:bg-white/[0.01] transition duration-500">
                    <td class="px-6 py-8 flex items-start space-x-6">
                        <span class="w-8 mt-6 text-center italic ${rankClass}">#${p.position}</span>
                        
                        <div class="w-24 h-24 bg-gray-900/40 rounded-3xl border border-gray-800 flex items-center justify-center p-2 relative shrink-0">
                            <img src="${p.headUrl}" class="w-full h-full object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,1)] group-hover:scale-110 transition duration-500">
                            <div class="absolute -top-1 -right-1 w-4 h-4 ${p.position === 1 ? 'bg-yellow-500 shadow-[0_0_8px_#eab308]' : 'bg-blue-600'} rounded-full border-2 border-[#05070a]"></div>
                        </div>

                        <div>
                            <span class="text-2xl font-black text-gray-100 uppercase italic tracking-tighter group-hover:text-blue-500 transition">${p.username}</span>
                            <div class="mt-5 flex items-center gap-3 flex-wrap">
                                ${modePillarsHTML}
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-8 text-right">
                        <div class="text-xs text-gray-500 font-black mb-1 uppercase tracking-widest">Total Score</div>
                        <span class="text-2xl font-black text-blue-400 tabular-nums">${p.totalPoints}</span>
                    </td>
                </tr>
            `;
        });
    });
}
