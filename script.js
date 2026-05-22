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

// --- Auth Handling (Admin Panel) ---
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

// --- Save Logic (5 Gamemodes) ---
const saveBtn = document.getElementById('saveBtn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const name = document.getElementById('pName').value.trim();
        const pos = document.getElementById('pPos').value;
        const head = document.getElementById('pHead').value.trim();

        // 5 Modes Data - IDs must match admin.html
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

// --- Display Logic with MCTIERS Style Symbols ---

// হেল্পার ফাংশন: টিয়ার অনুযায়ী কালার সেট করার জন্য
function getTierColorClass(tier) {
    if (!tier || tier === "N/A" || tier === "Unranked") return "text-gray-600 bg-gray-900/50 border-gray-700/50";
    const normalizedTier = tier.toUpperCase();
    if (normalizedTier.startsWith('HT')) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"; // Gold for High Tier
    if (normalizedTier.startsWith('LT')) return "text-slate-400 bg-slate-400/10 border-slate-400/20"; // White/Grey for Low Tier
    return "text-gray-100 bg-gray-800 border-gray-700"; // Default
}

const tierBody = document.getElementById('tier-body');
if (tierBody) {
    const q = query(collection(db, "players"), orderBy("position", "asc"));
    onSnapshot(q, (snapshot) => {
        tierBody.innerHTML = "";
        snapshot.forEach((doc) => {
            const p = doc.data();
            
            // ১ নম্বর র‍্যাঙ্কের জন্য বিশেষ কালার
            let rankClass = p.position === 1 ? "text-yellow-500 font-black text-2xl shadow-yellow-500" : "text-gray-600 font-bold";

            // প্রতিটি গেমমোডের জন্য 'পিল্লার' (Icon+Tier) তৈরি করা
            let modePillarsHTML = "";
            for (const modeKey in p.modes) {
                const mode = p.modes[modeKey];
                
                // আপনার assets ফোল্ডার থেকে ছবি নেওয়া (ধরে নিচ্ছি ছবিগুলো .png ফরম্যাটে আছে)
                const iconSrc = `assets/${modeKey}.png`;
                const colorClass = getTierColorClass(mode.tier);

                modePillarsHTML += `
                    <div class="flex flex-col items-center gap-1.5 text-center shrink-0">
                        <img src="${iconSrc}" alt="${modeKey} icon" class="w-8 h-8 object-contain" onerror="this.src='https://mctiers.com/assets/images/overall.png'">
                        <span class="inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${colorClass} italic">
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
