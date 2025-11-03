import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Firebase 초기화 설정 (API Key는 보안상 직접 노출에 주의해야 합니다.)
const firebaseConfig = {
    apiKey: "AIzaSyB6Pn4hvYaER8GMduVmKKQEHtLimZoKqss",
    authDomain: "banggame-f2ae8.firebaseapp.com",
    projectId: "banggame-f2ae8",
    storageBucket: "banggame-f2ae8.firebasestorage.app",
    messagingSenderId: "494771436388",
    appId: "1:494771436388:web:30af5ee540176b8d501871",
    measurementId: "G-8H40NRTSEK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================
// 🚀 Top 20 랭킹 불러오기 (캐시 + 1회만 호출)
// ==========================
let rankingsLoaded = false;
let cachedRankings = [];
let firestoreReadCount = 0;

/**
 * Firestore에서 Top 20 랭킹을 불러오거나 캐시된 데이터를 반환합니다.
 * @param {function} callback 
 */
export async function loadTop20Rankings(callback) {
    if (rankingsLoaded) {
        console.log(`📊 Firestore 읽기 호출 횟수: ${firestoreReadCount}`);
        callback(cachedRankings);
        return;
    }

    try {
        const q = query(
            collection(db, "rankings"),
            orderBy("score", "desc"),
            limit(20)
        );

        const snapshot = await getDocs(q);
        firestoreReadCount++;
        const rankings = [];
        snapshot.forEach(doc => rankings.push(doc.data()));

        cachedRankings = rankings;
        rankingsLoaded = true;

        callback(rankings);
    } catch (err) {
        console.error("❌ 랭킹 불러오기 실패:", err);
        callback([]);
    }
}

// ==========================
// 🎨 Canvas & 랭킹 화면 그리기
// ==========================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width = 850;
const HEIGHT = canvas.height = 1500;


const imageSources = {
    ranking: "img/top20.jpg" 
};

const images = {};
let imagesLoaded = 0;
const totalImages = Object.keys(imageSources).length;

for (const key in imageSources) {
    const img = new Image();
    img.src = imageSources[key];
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) showTop20RankingScreen();
    };
    images[key] = img;
}


function showTop20RankingScreen() {
    // 배경 그리기
    ctx.drawImage(images.ranking, 0, 0, WIDTH, HEIGHT);
    

    ctx.font = "bold 40px Galmuri11";
    ctx.fillStyle = "#00003E";
    ctx.textAlign = "center";
    ctx.fillText("Top 20 랭킹 로딩 중...", WIDTH / 2, HEIGHT / 2);
    ctx.textAlign = "left"; 


    loadTop20Rankings((rankings) => {

        ctx.drawImage(images.ranking, 0, 0, WIDTH, HEIGHT);
        drawTop20Ranking(rankings);
    });
}

/**
 * 실제 화면에 Top 20 랭킹 텍스트를 그립니다.
 * @param {Array<Object>} rankings - 랭킹 데이터 배열.
 */
function drawTop20Ranking(rankings) {


    // 랭킹 목록
    rankings.forEach((entry, index) => {
        const rank = index + 1;
        const displayScore = `${entry.score}점`;
        const displayName = `${rank}. ${entry.department}, ${entry.name}`;
        
        ctx.font = "bold 35px Galmuri11";
        ctx.fillStyle = "#00003E";

        // 이름, 부서
        ctx.fillText(
            displayName,
            WIDTH / 2 - 300, 
            380 + index * 50
        );

        // 점수
        ctx.fillText(
            displayScore,
            WIDTH / 2 + 150, 
           380 + index * 50
        );
    });
}