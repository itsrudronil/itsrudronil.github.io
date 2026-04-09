import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, setDoc, doc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Config
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

// ১. অ্যাডমিন প্যানেলে ডাটা সেভ করা
const saveBtn = document.getElementById('saveBtn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const name = document.getElementById('pName').value;
        const tier = document.getElementById('pTier').value;
        const head = document.getElementById('pHead').value;

        if (!name || !tier) return alert("Missing Info!");

        try {
            await setDoc(doc(db, "players", name), {
                username: name,
                tier: tier,
                headUrl: head || `https://mc-heads.net/avatar/${name}`,
                timestamp: Date.now()
            });
            alert("Player Added!");
            location.reload();
        } catch (e) { alert("Error: " + e); }
    };
}

// ২. হোমপেজে ডাটা শো করা
const tierBody = document.getElementById('tier-body');
if (tierBody) {
    const q = query(collection(db, "players"), orderBy("timestamp", "desc"));
    onSnapshot(q, (snapshot) => {
        tierBody.innerHTML = "";
        snapshot.forEach((doc) => {
            const p = doc.data();
            tierBody.innerHTML += `
                <tr class="border-b border-gray-800">
                    <td class="p-4 flex items-center space-x-3">
                        <img src="${p.headUrl}" class="w-10 h-10 rounded shadow-lg" onerror="this.src='https://mc-heads.net/avatar/steve'">
                        <span class="font-bold">${p.username}</span>
                    </td>
                    <td class="p-4 text-right">
                        <span class="bg-blue-900/40 text-blue-400 px-3 py-1 rounded border border-blue-800 text-xs">${p.tier}</span>
                    </td>
                </tr>
            `;
        });
    });
}
