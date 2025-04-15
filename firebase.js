import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, set, onValue, get } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
const backgroundSelectModal = new bootstrap.Modal(document.getElementById('backgroundSelectModal'), { backdrop: 'static', keyboard: false });
const authModal = new bootstrap.Modal(document.getElementById('authModal'), { backdrop: 'static', keyboard: false });

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyCF8RC21jNLLxy2auNAkUC3g6d4uekvwpQ",
  authDomain: "emsishotwar.firebaseapp.com",
  databaseURL: "https://emsishotwar-default-rtdb.firebaseio.com",
  projectId: "emsishotwar",
  storageBucket: "emsishotwar.firebasestorage.app",
  messagingSenderId: "78112019750",
  appId: "1:78112019750:web:7349c7e6cb27e4c77f9de7",
  measurementId: "G-5T24K08KD6"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

//Oturum kalıcılığını ayarla (tarayıcı kapatılıp açılsa bile oturum devam eder)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Oturum kalıcılığı ayarlandı: browserLocalPersistence");
  })
  .catch((error) => {
    console.error("Oturum kalıcılığı ayarlanamadı:", error);
  });

// Global değişkenler
window.database = database;
window.auth = auth;
window.ref = ref;
window.set = set;
window.get = get;
window.onValue = onValue;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.onAuthStateChanged = onAuthStateChanged;
window.signOut = signOut;

// Modüler kapsamda fonksiyonları tanımla
let currentUser = null;

// Kayıt ve Giriş bölümlerini göster/gizle
window.showRegister = function() {
  document.getElementById("register-section").style.display = "block";
  document.getElementById("login-section").style.display = "none";
  document.getElementById("authModalLabel").textContent = "Kayıt Ol";
};

window.showLogin = function() {
  document.getElementById("register-section").style.display = "none";
  document.getElementById("login-section").style.display = "block";
  document.getElementById("authModalLabel").textContent = "Giriş Yap";
};

// Kullanıcı adı benzersizliğini kontrol et
// Kayıt işlemi
window.registerUser = async function() {
  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  if (!username || !password) {
    alert("Lütfen kullanıcı adı ve şifre gir!");
    return;
  }

  // Şifre en az 6 karakter olmalı
  if (password.length < 6) {
    alert("Şifre en az 6 karakter olmalı!");
    return;
  }

  // Kullanıcı adı benzersiz mi kontrol et
  const unique = await window.isUsernameUnique(username);
  if (!unique) {
    alert("Bu kullanıcı adı zaten alınmış! Lütfen başka bir tane seç.");
    return;
  }

  try {
    // E-posta ile kullanıcı oluştur (Firebase Authentication otomatik olarak çakışmayı kontrol eder)
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Kullanıcı adını ve e-posta’yı veritabanına kaydet
    const usernameRef = ref(database, "usernames/" + username); // usernameRef'i burada tanımlıyoruz
    await set(usernameRef, {
      uid: userCredential.user.uid,
      email: email
    });

    alert("Kayıt başarılı! Şimdi giriş yapabilirsin.");
    showLogin();
  } catch (error) {
    console.error("Kayıt hatası:", error);
    if (error.code === "auth/email-already-in-use") {
      alert("Bu e-posta adresi zaten başka bir kullanıcıya ait!");
    } else {
      alert("Kayıt başarısız: " + error.message);
    }
  }
};

// Giriş işlemi
window.loginUser = async function() {
  const button = document.getElementById('loginButton');
  button.style.pointerEvents = 'none'; // Tıklanmayı engelle
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const usernameRef = ref(database, "usernames/" + username);
    const snapshot = await get(usernameRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();
      const email = userData.email;
      await signInWithEmailAndPassword(auth, email, password);
      alert("Giriş başarılı!");
      // Modal’ı kapatmak için (isteğe bağlı)
      hideModel("authModal");
      showModel("backgroundSelectModal"); // Arka plan seçimini göster
    } else {
      alert("Kullanıcı adı bulunamadı!");
    }
  } catch (error) {
    console.error("Giriş hatası:", error);
    alert("Giriş başarısız: " + error.message);
  }
};

// Çıkış işlemi
window.logoutUser = function() {
  debugger;
  signOut(auth)
    .then(() => {
      currentUser = null;
      alert("Çıkış yapıldı!");
      // Sayfayı yenile
      window.location.reload(); 
    })
    .catch((error) => {
      console.error("Çıkış hatası:", error);
      alert("Çıkış başarısız: " + error.message);
    });
};

// Skor kaydetme
window.saveScore = async function(score) {
  if (!currentUser) {
    alert("Önce giriş yapmalısın!");
    return;
  }

  try {
    // Mevcut skoru al
    const scoreRef = ref(database, "scores/" + currentUser);
    const snapshot = await get(scoreRef);
    let shouldUpdate = true;

    if (snapshot.exists()) {
      const currentScoreData = snapshot.val();
      const previousScore = currentScoreData.score;
      // Yeni skor önceki skordan büyük değilse güncelleme yapma
      if (score <= previousScore) {
        shouldUpdate = false;
        console.log(`Yeni skor (${score}) önceki skordan (${previousScore}) küçük veya eşit, güncelleme yapılmadı.`);
      }
    }

    if (shouldUpdate) {
      // Skoru güncelle
      await set(scoreRef, {
        score: score,
        timestamp: Date.now()
      });
      console.log("Skor kaydedildi:", score);
      window.displayScores(); // Skor kaydedildikten sonra listeyi güncelle
    }
  } catch (error) {
    console.error("Skor kaydedilemedi:", error);
    alert("Skor kaydedilemedi: " + error.message);
  }
}

// Skorları listeleme
// Skorları listeleme
window.displayScores = function() {
    const scoreList = document.getElementById("score-list");
    onValue(ref(database, "scores"), (snapshot) => {
        console.log("Skorlar alındı:", snapshot.val()); // Hata ayıklama için log
        const scores = snapshot.val() || {};
        scoreList.innerHTML = ""; // Listeyi temizle

        if (Object.keys(scores).length === 0) {
            const li = document.createElement("li");
            li.textContent = "Henüz skor yok.";
            scoreList.appendChild(li);
        } else {
            Object.keys(scores)
                .sort((a, b) => scores[b].score - scores[a].score) // Büyükten küçüğe sırala
                .forEach(user => {
                    const li = document.createElement("li");
                    li.innerHTML = `<span>${user}</span><span>${scores[user].score}</span>`;
                    scoreList.appendChild(li);
                });
        }
    }, (error) => {
        console.error("Skorlar alınamadı:", error);
        alert("Skorlar alınamadı: " + error.message);
    });
};

// Auth durumunu bir kere tanımla ve dinle
 function initializeAuthListener() {
  const authModal = new bootstrap.Modal(document.getElementById('authModal'), { backdrop: 'static', keyboard: false });
    
  // Modalın sayfa yüklendiğinde kapalı olduğundan emin ol
  hideModel("authModal");
    auth.onAuthStateChanged(async (user) => {
        console.log("onAuthStateChanged çağrıldı, kullanıcı:", user); // Hata ayıklama için log
        if (user) {
            // Kullanıcı oturum açık, kullanıcı adını al
            try {
                const snapshot = await get(ref(database, "usernames"));
                const usernames = snapshot.val() || {};
                console.log("Kullanıcı adları alındı:", usernames); // Hata ayıklama için log

                for (let username in usernames) {
                    if (usernames[username].uid === user.uid) {
                        currentUser = username;
                        console.log("Kullanıcı bulundu:", currentUser); // Hata ayıklama için log
                        debugger;
                        showModel("backgroundSelectModal"); // Arka plan seçimini göster
                        document.getElementById("current-user").textContent = currentUser;
                        if (authModal) hideModel("authModal"); // authModal.style.display = 'none';
                        break;
                    }
                }

                if (!currentUser) {
                    console.log("Kullanıcı adı bulunamadı, oturum açık ama eşleşme yok.");
                    await signOut(auth); 
                    showModel("authModal");
                }
            } catch (error) {
                console.error("Kullanıcı adı alma hatası:", error);
            }
        } else {
            // Kullanıcı oturum kapalı
            currentUser = null;
            console.log("Oturum kapalı, giriş ekranına yönlendiriliyor.");
            showModel("authModal");

        }
    });
}


function showModel(id) {
  document.getElementById(id).classList.add('show');
  document.getElementById(id).style.display = 'block';
  document.body.classList.add('modal-open');
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop fade show';
  document.body.appendChild(backdrop);
  
}

function hideModel(id) {

  // Modal'ı gizlemek için
  document.getElementById(id).classList.remove('show');
  document.getElementById(id).style.display = 'none';
  document.body.classList.remove('modal-open');
  const existingBackdrop = document.querySelector('.modal-backdrop');
  if (existingBackdrop) existingBackdrop.remove();
  
}


// Fonksiyonları global scope’a ekle
window.initializeAuthListener = initializeAuthListener;
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.saveScore = saveScore;
window.displayScores = displayScores;
window.showRegister = showRegister;
window.showLogin = showLogin;
