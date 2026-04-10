import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, setDoc, doc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- Firebase Config (আপনার কনসোল থেকে এগুলো পরিবর্তন করুন) ---
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ১. অ্যাডমিন প্যানেলে ডাটা সেভ করার লজিক (admin.html এর জন্য)
const saveBtn = document.getElementById('saveBtn');
if (saveBtn) {
    saveBtn.onclick = async () => {
        const name = document.getElementById('pName').value.trim();
        const tier = document.getElementById('pTier').value.trim();
        const head = document.getElementById('pHead').value.trim(); // আপনি যে কাস্টম ছবির লিঙ্ক দিবেন

        if (!name || !tier) {
            return alert("দয়া করে নাম এবং টিয়ার ইনপুট দিন!");
        }

        try {
            // Firestore-এ প্লেয়ারের ডাটা সেভ করা
            await setDoc(doc(db, "players", name), {
                username: name,
                tier: tier,
                headUrl: head || `https://mc-heads.net/avatar/${name}`, // লিঙ্ক না দিলে অটো-সার্চ
                timestamp: Date.now()
            });
            
            alert("Player added successfully!");
            // ইনপুট বক্স খালি করা
            document.getElementById('pName').value = "";
            document.getElementById('pTier').value = "";
            document.getElementById('pHead').value = "";
        } catch (e) {
            console.error("Error saving data: ", e);
            alert("কিছু একটা সমস্যা হয়েছে! কনসোল চেক করুন।");
        }
    };
}

// ২. হোমপেজে রিয়েল-টাইম ডাটা দেখানোর লজিক (index.html এর জন্য)
const tierBody = document.getElementById('tier-body');
if (tierBody) {
    // timestamp অনুযায়ী সাজানো (নতুন প্লেয়ার সবার উপরে থাকবে)
    const q = query(collection(db, "players"), orderBy("timestamp", "desc"));
    
    onSnapshot(q, (snapshot) => {
        tierBody.innerHTML = ""; // আগের ডাটা ক্লিয়ার করা
        
        snapshot.forEach((doc) => {
            const p = doc.data();
            
            // আপনার দেওয়া ছবির মতো গোল/বক্স ডিজাইন সেট করা হয়েছে এখানে
            const row = `
                <tr class="border-b border-gray-800 hover:bg-white/5 transition duration-200">
                    <td class="p-4 flex items-center space-x-4">
                        <div class="relative">
                            <img src="${p.headUrl}" 
                                 class="w-12 h-12 rounded-lg border-2 border-gray-700 shadow-xl object-cover"
                                 onerror="this.src='https://mc-heads.net/avatar/steve'">
                            <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#0b0e14] rounded-full"></div>
                        </div>
                        <span class="font-bold text-gray-200 text-lg tracking-wide">${p.username}</span>
                    </td>
                    <td class="p-4 text-right">
                        <span class="bg-blue-600/20 text-blue-400 px-4 py-1 rounded-full border border-blue-500/30 text-xs font-black uppercase tracking-widest shadow-sm">
                            ${p.tier}
                        </span>
                    </td>
                </tr>
            `;
            tierBody.innerHTML += row;
        });
    });
}
