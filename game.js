// DOM Elementleri
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const backgroundSelectModal = new bootstrap.Modal(document.getElementById('backgroundSelectModal'), { backdrop: 'static', keyboard: false });
const gameOverModal = new bootstrap.Modal(document.getElementById('gameOverModal'), { backdrop: 'static', keyboard: false });

// Oyun sayfasının arka planını koyu mavi yap
document.body.style.backgroundColor = 'rgba(12,109,164,255)';

// Yükleme ekranı için bir div ve video elementi oluştur
const loadingScreen = document.createElement('div');
loadingScreen.id = 'loadingScreen';
loadingScreen.style.position = 'fixed';
loadingScreen.style.top = '0';
loadingScreen.style.left = '0';
loadingScreen.style.width = '100%';
loadingScreen.style.height = '100%';
loadingScreen.style.backgroundColor = 'rgba(12,109,164,255)'; // Koyu mavi arka plan
loadingScreen.style.display = 'flex';
loadingScreen.style.justifyContent = 'center';
loadingScreen.style.alignItems = 'center';
loadingScreen.style.zIndex = '1000';

// Video elementi oluştur
const loadingVideo = document.createElement('video');
loadingVideo.src = 'img/yukleniyorMami.mp4';
loadingVideo.autoplay = true;
loadingVideo.muted = true;
loadingVideo.style.width = '300px';
loadingVideo.style.height = '300px';
loadingVideo.style.objectFit = 'cover';
loadingScreen.appendChild(loadingVideo);
document.body.appendChild(loadingScreen);

// Canvas'ı başlangıçta gizle
canvas.style.display = 'none';

// Oyunun başında skor ve canı açıkça ayarla
if (scoreDisplay) {
    scoreDisplay.textContent = `Skor: 0 | Can: 3`;
} else {
    console.error('score elementi bulunamadı!');
}

// Oyuncu resmi
const playerImage = new Image();
playerImage.src = 'img/barmen.png';

// Ses efektleri
const lifeLostSound = new Audio('img/gameheat.wav');
const gameOverSound = new Audio('img/arcadegameover.wav');
const shootSound = new Audio('img/bardaksesi.wav');
const mcSound = new Audio('img/mc.mp3');
const beerSound = new Audio('img/biraSes.mp3');

let isMcPlayed = false;

// Bira (can) resmi
const beerImage = new Image();
beerImage.src = 'img/bira.png';

// Oyuncu
const player = {
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    speed: 5,
    lives: 3,
    shake: false,
    shakeDuration: 0,
    originalX: 0
};

// Seçilen arka planı saklamak için değişken
let currentBackground = null;

// Canvas boyutunu ayarla
function resizeCanvas() {
    const maxWidth = 800;
    const maxHeight = 600;
    const aspectRatio = maxWidth / maxHeight;

    let width = window.innerWidth * 0.9;
    let height = window.innerHeight * 0.9;

    if (width > maxWidth) width = maxWidth;
    if (height > maxHeight) height = maxHeight;

    if (width / height > aspectRatio) {
        width = height * aspectRatio;
    } else {
        height = width / aspectRatio;
    }

    canvas.width = width;
    canvas.height = height;

    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 60;
    player.originalX = player.x;

    // Canvas arka planını opak koyu gri yap
    ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Mermi resmi
const bulletImage = new Image();
bulletImage.src = 'img/shot.png';

let bullets = [];
const enemyImages = [
    new Image(), new Image(), new Image(), new Image(), new Image(),
    new Image(), new Image(), new Image(), new Image(), new Image(),
    new Image(), new Image(), new Image(), new Image(), new Image(),
    new Image(), new Image(), new Image(), new Image(), new Image(),
    new Image(), new Image(), new Image(), new Image(), new Image(),
    new Image(), new Image()
];
enemyImages[0].src = 'img/oguz.jpg';
enemyImages[1].src = 'img/alimert.jpg';
enemyImages[2].src = 'img/hekaka.jpg';
enemyImages[3].src = 'img/kaan.jpg';
enemyImages[4].src = 'img/yazgan.jpg';
enemyImages[5].src = 'img/osman.jpg';
enemyImages[6].src = 'img/ozan.jpg';
enemyImages[7].src = 'img/ziyaburak.jpg';
enemyImages[8].src = 'img/mertcan.jpg';
enemyImages[9].src = 'img/adnan.jpg';
enemyImages[10].src = 'img/kerimcan.jpg';
enemyImages[11].src = 'img/cagri.png';
enemyImages[12].src = 'img/alpertunga.jpg';
enemyImages[13].src = 'img/mami.jpg';
enemyImages[14].src = 'img/sefa.png';
enemyImages[15].src = 'img/ekrem.jpg';
enemyImages[16].src = 'img/okan.jpg';
enemyImages[17].src = 'img/sinan.jpg';
enemyImages[18].src = 'img/mesih.jpg';
enemyImages[19].src = 'img/zoy.jpg';
enemyImages[20].src = 'img/caca.jpg';
enemyImages[21].src = 'img/kelmamba.jpg';
enemyImages[22].src = 'img/ramazan.jpg';
enemyImages[23].src = 'img/hüso.jpg';
enemyImages[24].src = 'img/giray.jpg';
enemyImages[25].src = 'img/kivircik.jpg';
enemyImages[26].src = 'img/bavyeraOmer.jpg';
let enemies = [];
let score = 0;
let spawnInterval = 2000;
let enemySpeed = 0.5;
let lastSpawnTime = 0;
let gameOver = false;
let gameStarted = false;

let beers = [];
let lastBeerSpawnTime = 0;
const beerSpawnInterval = 15000;

let keys = { left: false, right: false, shoot: false };

function shootBullet() {
    const bulletWidth = 20;
    const bulletHeight = 30;
    bullets.push({
        x: player.x + player.width / 2 - bulletWidth / 2,
        y: player.y - bulletHeight,
        width: bulletWidth,
        height: bulletHeight,
        speed: 10,
        image: bulletImage
    });
    if (shootSound.paused || shootSound.currentTime === 0) {
        shootSound.currentTime = 0;
        shootSound.play().catch(error => console.error('Ses çalma hatası:', error));
    }
}

function createEnemy() {
    const size = 65;
    const x = Math.random() * (canvas.width - size);
    const existingImages = enemies.map(enemy => enemy.image.src);
    let availableImages = enemyImages.filter(img => !existingImages.includes(img.src));
    if (availableImages.length === 0) availableImages = enemyImages;
    const image = availableImages[Math.floor(Math.random() * availableImages.length)];
    enemies.push({
        x: x,
        y: -size,
        width: size,
        height: size,
        speed: enemySpeed + Math.random() * 0.3,
        image: image
    });
}

function createBeer() {
    const size = 30;
    const x = Math.random() * (canvas.width - size);
    beers.push({
        x: x,
        y: -size,
        width: size,
        height: size,
        speed: enemySpeed,
        image: beerImage
    });
}

function updateSpawnRate() {
    if (gameOver || !gameStarted) return;
    spawnInterval = Math.max(500, 2000 - Math.floor(score / 50) * 200);
    if (Date.now() - lastSpawnTime > spawnInterval && enemies.length < 10) {
        const enemiesToSpawn = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < enemiesToSpawn; i++) {
            if (enemies.length < 10) createEnemy();
        }
        lastSpawnTime = Date.now();
    }
}

function updateBeerSpawn() {
    if (gameOver || !gameStarted) return;
    if (score >= 300 && Date.now() - lastBeerSpawnTime > beerSpawnInterval && beers.length < 1) {
        createBeer();
        lastBeerSpawnTime = Date.now();
    }
}

function updateShake() {
    if (player.shake) {
        player.shakeDuration--;
        if (player.shakeDuration > 0) {
            player.x = player.originalX + (Math.random() - 0.5) * 10;
        } else {
            player.shake = false;
            player.x = player.originalX;
        }
    }
}

function gameLoop() {
    if (gameOver || !gameStarted) return;

    // Seçilen arka planı canvas'a çiz
    if (currentBackground) {
        ctx.drawImage(currentBackground, 0, 0, canvas.width, canvas.height);
    }
    // Opak katman ekle
    ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateShake();

    if (keys.left && player.x > 0) {
        player.x -= player.speed;
        player.originalX = player.x;
    }
    if (keys.right && player.x < canvas.width - player.width) {
        player.x += player.speed;
        player.originalX = player.x;
    }

    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

    bullets.forEach((bullet, bulletIndex) => {
        bullet.y -= bullet.speed;
        ctx.drawImage(bullet.image, bullet.x, bullet.y, bullet.width, bullet.height);

        enemies.forEach((enemy, enemyIndex) => {
            if (
                bullet.y < enemy.y + enemy.height &&
                bullet.x + bullet.width > enemy.x &&
                bullet.x < enemy.x + enemy.width
            ) {
                if (enemy.image.src.includes('alpertunga.jpg')) {
                    bullets.splice(bulletIndex, 1);
                } else {
                    enemies.splice(enemyIndex, 1);
                    bullets.splice(bulletIndex, 1);
                    score += 10;
                    scoreDisplay.textContent = `Skor: ${score} | Can: ${player.lives}`;
                    updateSpawnRate();
                    if (score % 50 === 0) {
                        player.speed += 0.1;
                        enemySpeed += 0.2;
                    }
                    if (score >= 1000 && !isMcPlayed) {
                        mcSound.play().catch(error => console.error('MC şarkısı çalma hatası:', error));
                        isMcPlayed = true;
                    }
                }
            }
        });

        if (bullet.y + bullet.height < 0) {
            bullets.splice(bulletIndex, 1);
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;
        ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);

        if (
            enemy.y + enemy.height > player.y &&
            enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x
        ) {
            player.lives -= 1;
            enemies.splice(index, 1);
            player.shake = true;
            player.shakeDuration = 20;
            if (player.lives > 0) {
                lifeLostSound.play();
                scoreDisplay.textContent = `Skor: ${score} | Can: ${player.lives}`;
            } else {
                gameOverSound.play().catch(error => console.error('Oyun bitti sesi çalma hatası:', error));
                gameOver = true;
                showGameOverModal();
                resetGameState();
            }
        }

        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
        }
    });

    beers.forEach((beer, index) => {
        beer.y += beer.speed;
        ctx.drawImage(beer.image, beer.x, beer.y, beer.width, beer.height);

        if (
            beer.y + beer.height > player.y &&
            beer.x < player.x + player.width &&
            beer.x + beer.width > player.x
        ) {
            if (player.lives < 5) {
                player.lives += 1;
                scoreDisplay.textContent = `Skor: ${score} | Can: ${player.lives}`;
            }
            beers.splice(index, 1);
            beerSound.play().catch(error => console.error('Bira sesi çalma hatası:', error));
        }

        if (beer.y > canvas.height) {
            beers.splice(index, 1);
        }
    });

    updateSpawnRate();
    updateBeerSpawn();
    requestAnimationFrame(gameLoop);
}

function resetGameState() {
    enemies = [];
    bullets = [];
    beers = [];
    score = 0;
    spawnInterval = 2000;
    enemySpeed = 0.5;
    player.lives = 3;
    player.speed = 7;
    player.shake = false;
    player.shakeDuration = 0;
    isMcPlayed = false;
    scoreDisplay.textContent = `Skor: ${score} | Can: ${player.lives}`;
    resizeCanvas();
}

function startGame() {
    gameOver = false;
    gameStarted = true;
    enemies = [];
    bullets = [];
    beers = [];
    score = 0;
    spawnInterval = 2000;
    enemySpeed = 0.5;
    player.lives = 3;
    player.speed = 7;
    player.shake = false;
    player.shakeDuration = 0;
    isMcPlayed = false;
    keys.left = false;
    keys.right = false;
    keys.shoot = false;
    scoreDisplay.textContent = `Skor: ${score} | Can: ${player.lives}`;
    gameLoop();
}

function showGameOverModal() {
    mcSound.pause();
    mcSound.currentTime = 0;

    let message = '';
    if (score < 100) {
        message = 'Biraz daha shot atmalısın!';
    } else if (score >= 100 && score < 200) {
        message = 'Bu skorla gerçekten zoru başardın aşko :D :D';
    } else if (score >= 200 && score < 300) {
        message = '6 litre PIRIL 10 liraydı, 4 litre PIRIL 21,90 kuruş aklınızı başınıza alın. :D :D :D';
    } else if (score >= 300 && score < 400) {
        message = 'Aşko sen Woodstock da hiç shot içmedin mi ?';
    } else if (score >= 400 && score < 500) {
        message = 'Senden iyi bir performans bekliyorum. Shot ustası olmana az kaldı!';
    } else if (score >= 500 && score < 600) {
        message = 'Bu skorla mahalle maçında "Topu bana atın la!" diye bağırırsın!';
    } else if (score >= 600 && score < 700) {
        message = 'Al ulan motivasyon.. Yapma lan acıtasyon.. Her günüm atraksiyon.. Bitmedi kondisyon ';
    } else if (score >= 700 && score < 800) {
        message = 'Kötü rüyalar görüyorum hocam. Uçan shotlar görüyorum.. :D :D';
    } else if (score >= 800 && score < 900) {
        message = 'Bu skorla mahallede "Shot Abi" derler sana!';
    } else if (score >= 900 && score < 1000) {
        message = 'Bir adım ötesi gelse bir şarkı patlatırdım senin için :D :D';
    } else if (score >= 1000 && score < 1100) {
        message = 'Bu skorla "Eskiden her şey 1 liraydı" muhabbetini başlatırsın!';
    } else if (score >= 1100 && score < 1200) {
        message = 'Helal olsun, çay ocağından bedava tost kazandın!';
    } else if (score >= 1200 && score < 1300) {
        message = 'Bu performansla dolmuşta "Şoför bey bi güzellik yap" dersin, yapar!';
    } else if (score >= 1300 && score < 1400) {
        message = 'Tamamdır, annene "Oğlum shot işini çözdü" dedirtebildin!';
    } else if (score >= 1400 && score < 1500) {
        message = 'Bir MC Bulls olmasa da yine de efsane bir performans!';
    } else if (score >= 1500 && score < 1600) {
        message = 'Efsanesin, simitçi abiden "Çaylar benden" sözü aldın!';
    } else if (score >= 1600 && score < 1700) {
        message = 'Bu ne hız lan, BİM’in kasiyeri bile yetişemez sana!';
    } else if (score >= 1700 && score < 1800) {
        message = 'Shotlarınla adın Taksim meydanında anons edilir: "Bu adam kral!"';
    } else if (score >= 1800 && score < 1900) {
        message = 'Bu skorla "Eskiden her şey 1 liraydı" muhabbetini başlatırsın!';
    } else if (score >= 1900 && score < 2000) {
        message = 'Bir shot daha atarsan uzaya roket gönderirsin, dikkat et! :D :D';
    } else if (score >= 2000) {
        message = 'OHAAAA HELALL OLSUNN BE SANAA !!!';
    } else if (score >= 2400 && score < 2500) {
        message = 'Benden sana bir tane bira  :D';
    }

    document.getElementById('finalScoreDisplay').textContent = `Skorun: ${score}`;
    document.getElementById('gameOverMessage').textContent = message;

    backgroundSelectModal.hide();
    gameOverModal.show();

    console.log('Game Over modalı gösterildi. Skor:', score, 'Mesaj:', message);

    document.getElementById('closeModalButton').onclick = () => {
        gameOverModal.hide();
        backgroundSelectModal.show();
    };
}

// Enter tuşu ile arka plan seçimini tetikleme
document.addEventListener('keydown', (e) => {
    if (gameOver && e.key === 'Enter') {
        gameOverModal.hide();
        backgroundSelectModal.show();
    }
    if (gameOver || !gameStarted) return;
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === ' ' && !keys.shoot) {
        keys.shoot = true;
        shootBullet();
    }
});

document.addEventListener('keyup', (e) => {
    if (gameOver || !gameStarted) return;
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === ' ') keys.shoot = false;
});

// Arka plan değiştirme fonksiyonu
function changeBackground(bgUrl) {
    const bgImage = new Image();
    bgImage.src = bgUrl;
    bgImage.onload = () => {
        currentBackground = bgImage;
        document.body.style.background = `url('${bgUrl}') no-repeat center center fixed`;
        document.body.style.backgroundSize = 'cover';
        canvas.style.display = 'block';
        document.getElementById('gameTitle').style.display = 'block';
        document.getElementById('score').style.display = 'block';    
        document.getElementById('gameRules').style.display = 'block'; 
        startGame();
    };
}

// Arka plan seçim butonlarına tıklama olayını ekle
document.querySelectorAll('.select-bg-btn').forEach(button => {
    button.addEventListener('click', () => {
        const bgUrl = button.getAttribute('data-bg');
        changeBackground(bgUrl);
        backgroundSelectModal.hide();
    });
});

// Arka plan seçim modalının arka planını koyu mavi yap
document.getElementById('backgroundSelectModal').style.backgroundColor = 'rgb(12, 109, 164)';

// Resim ve ses yüklenmesini kontrol et
let imagesLoaded = 0;
let soundsLoaded = 0;
const totalImages = enemyImages.length + 3; // enemyImages + bulletImage + playerImage + beerImage
const totalSounds = 5;
let assetsLoaded = false;

function checkAssetsLoaded() {
    if (imagesLoaded === totalImages && soundsLoaded === totalSounds) {
        assetsLoaded = true;
        console.log('Tüm varlıklar yüklendi.');
    }
}

function checkAllLoaded() {
    if (assetsLoaded) {
        loadingVideo.pause();
        loadingScreen.style.display = 'none';
        document.getElementById('gameTitle').style.display = 'none';
        document.getElementById('score').style.display = 'none'; 
        document.getElementById('gameRules').style.display = 'none'; 
        backgroundSelectModal.show();
    }
}

loadingVideo.addEventListener('ended', () => {
    console.log('Video bitti.');
    checkAllLoaded();
});

enemyImages.forEach((img, index) => {
    img.onload = () => {
        imagesLoaded++;
        console.log(`Resim yüklendi: ${img.src}`);
        checkAssetsLoaded();
    };
    img.onerror = () => console.error(`Resim yüklenemedi: ${img.src}`);
});

bulletImage.onload = () => {
    imagesLoaded++;
    console.log(`Resim yüklendi: ${bulletImage.src}`);
    checkAssetsLoaded();
};
bulletImage.onerror = () => console.error(`Mermi resmi yüklenemedi: ${bulletImage.src}`);

playerImage.onload = () => {
    imagesLoaded++;
    console.log(`Resim yüklendi: ${playerImage.src}`);
    checkAssetsLoaded();
};
playerImage.onerror = () => console.error(`Oyuncu resmi yüklenemedi: ${playerImage.src}`);

beerImage.onload = () => {
    imagesLoaded++;
    console.log(`Resim yüklendi: ${beerImage.src}`);
    checkAssetsLoaded();
};
beerImage.onerror = () => console.error(`Bira resmi yüklenemedi: ${beerImage.src}`);

lifeLostSound.onloadeddata = () => {
    soundsLoaded++;
    console.log('Can kaybı sesi yüklendi.');
    checkAssetsLoaded();
};
lifeLostSound.onerror = () => console.error('Can kaybı sesi yüklenemedi: ' + lifeLostSound.src);

gameOverSound.onloadeddata = () => {
    soundsLoaded++;
    console.log('Oyun bitti sesi yüklendi.');
    checkAssetsLoaded();
};
gameOverSound.onerror = () => console.error('Oyun bitti sesi yüklenemedi: ' + gameOverSound.src);

shootSound.onloadeddata = () => {
    soundsLoaded++;
    console.log('Mermi atış sesi yüklendi.');
    checkAssetsLoaded();
};
shootSound.onerror = () => console.error('Mermi atış sesi yüklenemedi: ' + shootSound.src);

mcSound.onloadeddata = () => {
    soundsLoaded++;
    console.log('MC şarkısı yüklendi.');
    checkAssetsLoaded();
};
mcSound.onerror = () => console.error('MC şarkısı yüklenemedi: ' + mcSound.src);

beerSound.onloadeddata = () => {
    soundsLoaded++;
    console.log('Bira sesi yüklendi.');
    checkAssetsLoaded();
};
beerSound.onerror = () => console.error('Bira sesi yüklenemedi: ' + beerSound.src);
