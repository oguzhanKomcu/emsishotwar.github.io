const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverModal = new bootstrap.Modal(document.getElementById('gameOverModal'), { backdrop: 'static', keyboard: false });
const backgroundSelectModal = new bootstrap.Modal(document.getElementById('backgroundSelectModal'), { backdrop: 'static', keyboard: false });
const finalScoreDisplay = document.getElementById('finalScore');
const closeModalButton = document.getElementById('closeModal');

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

    ctx.fillStyle = '#000';
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
    new Image(), new Image(), new Image(), new Image(), new Image()
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

    ctx.fillStyle = '#000';
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
                        player.speed += 0.5;
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
                gameOverSound.play();
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
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    mcSound.pause();
    mcSound.currentTime = 0;
    finalScoreDisplay.textContent = score;
    gameOverModal.show();
}

document.addEventListener('keydown', (e) => {
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

// "Tamam" butonuna basıldığında arka plan seçim modalını aç
closeModalButton.addEventListener('click', () => {
    gameOverModal.hide();
    backgroundSelectModal.show(); // Oyun bittiğinde arka plan seçim modalını aç
});

// Arka plan değiştirme fonksiyonu
function changeBackground(bgUrl) {
    document.body.style.background = `url('${bgUrl}') no-repeat center center fixed`;
    document.body.style.backgroundSize = 'cover';
}

// Arka plan seçim butonlarına tıklama olayını ekle
document.querySelectorAll('.select-bg-btn').forEach(button => {
    button.addEventListener('click', () => {
        const bgUrl = button.getAttribute('data-bg');
        changeBackground(bgUrl);
        backgroundSelectModal.hide();
        startGame();
    });
});

// Resim ve ses yüklenmesini kontrol et
let imagesLoaded = 0;
let soundsLoaded = 0;
const totalImages = enemyImages.length + 3; // enemyImages + bulletImage + playerImage + beerImage
const totalSounds = 5;

function checkAllLoaded() {
    if (imagesLoaded === totalImages && soundsLoaded === totalSounds) {
        backgroundSelectModal.show(); // Resimler ve sesler yüklendiğinde arka plan seçim modalını aç
    }
}

enemyImages.forEach((img, index) => {
    img.onload = () => {
        imagesLoaded++;
        console.log(`Resim yüklendi: ${img.src}`);
        checkAllLoaded();
    };
    img.onerror = () => console.error(`Resim yüklenemedi: ${img.src}`);
});

bulletImage.onload = () => {
    imagesLoaded++;
    console.log(`Resim yüklendi: ${bulletImage.src}`);
    checkAllLoaded();
};
bulletImage.onerror = () => console.error(`Mermi resmi yüklenemedi: ${bulletImage.src}`);

playerImage.onload = () => {
    imagesLoaded++;
    console.log(`Resim yüklendi: ${playerImage.src}`);
    checkAllLoaded();
};
playerImage.onerror = () => console.error(`Oyuncu resmi yüklenemedi: ${playerImage.src}`);

beerImage.onload = () => {
    imagesLoaded++;
    console.log(`Resim yüklendi: ${beerImage.src}`);
    checkAllLoaded();
};
beerImage.onerror = () => console.error(`Bira resmi yüklenemedi: ${beerImage.src}`);

lifeLostSound.onloadeddata = () => {
    soundsLoaded++;
    console.log('Can kaybı sesi yüklendi.');
    checkAllLoaded();
};
lifeLostSound.onerror = () => console.error('Can kaybı sesi yüklenemedi: ' + lifeLostSound.src);

gameOverSound.onloadeddata = () => {
    soundsLoaded++;
    console.log('Oyun bitti sesi yüklendi.');
    checkAllLoaded();
};
gameOverSound.onerror = () => console.error('Oyun bitti sesi yüklenemedi: ' + gameOverSound.src);

shootSound.onloadeddata = () => {
    soundsLoaded++;
    console.log('Mermi atış sesi yüklendi.');
    checkAllLoaded();
};
shootSound.onerror = () => console.error('Mermi atış sesi yüklenemedi: ' + shootSound.src);

mcSound.onloadeddata = () => {
    soundsLoaded++;
    console.log('MC şarkısı yüklendi.');
    checkAllLoaded();
};
mcSound.onerror = () => console.error('MC şarkısı yüklenemedi: ' + mcSound.src);

beerSound.onloadeddata = () => {
    soundsLoaded++;
    console.log('Bira sesi yüklendi.');
    checkAllLoaded();
};
beerSound.onerror = () => console.error('Bira sesi yüklenemedi: ' + beerSound.src);
