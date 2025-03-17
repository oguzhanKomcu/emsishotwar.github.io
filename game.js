const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverModal = document.getElementById('gameOverModal');
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

// Can kaybı ses efekti
const lifeLostSound = new Audio('img/gameheat.wav');

// Oyun bitti ses efekti
const gameOverSound = new Audio('img/arcadegameover.wav');

// Mermi atış ses efekti
const shootSound = new Audio('img/bardaksesi.wav');

// Oyuncu
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 7,
    lives: 3,
    shake: false,
    shakeDuration: 0,
    originalX: canvas.width / 2 - 25
};

// Mermi resmi
const bulletImage = new Image();
bulletImage.src = 'img/shot.png';

// Mermiler
let bullets = [];

// Düşman resimleri
const enemyImages = [
    new Image(), // oguz.jpg
    new Image(), // alimert.jpg
    new Image(), // hekaka.jpg
    new Image(), // kaan.jpg
    new Image(), // yazgan.jpg
    new Image(), // osman.jpg
    new Image(), // ozan.jpg
    new Image(), // ziyaburak.jpg
    new Image(), // mertcan.jpg
    new Image(), // adnan.jpg
    new Image(), // kerimcan.jpg
    new Image(), // cagri.jpg
    new Image(), // alpertunga.jpg
    new Image(), // mami.jpg
    new Image(), // sefa.png
    new Image(),
    new Image()  // ekrem.png
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


let enemies = [];
let score = 0;
let spawnInterval = 2000;
let enemySpeed = 2;
let enemySpawnInterval;
let lastSpawnTime = 0;
let gameOver = false; // Oyun bitti durumunu takip etmek için

// Kontroller
let keys = {
    left: false,
    right: false,
    shoot: false
};

// Mermi oluştur
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

// Düşman oluştur (Aynı düşmandan bir tane olacak şekilde)
function createEnemy() {
    const size = 65;
    const x = Math.random() * (canvas.width - size);
    const existingImages = enemies.map(enemy => enemy.image.src);
    let availableImages = enemyImages.filter(img => !existingImages.includes(img.src));
    if (availableImages.length === 0) {
        availableImages = enemyImages;
    }
    const image = availableImages[Math.floor(Math.random() * availableImages.length)];
    enemies.push({
        x: x,
        y: -size,
        width: size,
        height: size,
        speed: enemySpeed + Math.random() * 1,
        image: image
    });
}

// Spawn sıklığını güncelle
function updateSpawnRate() {
    if (gameOver) return; // Oyun bittiyse spawn durdur
    spawnInterval = Math.max(500, 2000 - Math.floor(score / 50) * 200);
    if (Date.now() - lastSpawnTime > spawnInterval && enemies.length < 10) {
        const enemiesToSpawn = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < enemiesToSpawn; i++) {
            if (enemies.length < 10) {
                createEnemy();
            }
        }
        lastSpawnTime = Date.now();
    }
}

// Titreme animasyonunu güncelle
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

// Oyun döngüsü
function gameLoop() {
    if (gameOver) return; // Oyun bittiyse döngüyü durdur

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
                        player.speed += 1;
                        enemySpeed += 0.5;
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
                resetGameState(); // Oyun bittiğinde her şeyi sıfırla
                showGameOverModal();
            }
        }

        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
        }
    });

    updateSpawnRate();
    requestAnimationFrame(gameLoop);
}

// Oyunu sıfırla (Modal açıldığında her şeyi sıfırla)
function resetGameState() {
    enemies = [];
    bullets = [];
    score = 0;
    spawnInterval = 2000;
    enemySpeed = 2;
    player.x = canvas.width / 2 - 25;
    player.originalX = canvas.width / 2 - 25;
    player.lives = 3;
    player.speed = 7;
    player.shake = false;
    player.shakeDuration = 0;
    scoreDisplay.textContent = `Skor: ${score} | Can: ${player.lives}`;
    gameOverModal.style.display = 'none';
}

// Oyunu yeniden başlat (Modal kapandığında çalışır)
function startGame() {
    gameOver = false;
    enemies = [];
    bullets = [];
    score = 0;
    spawnInterval = 2000;
    enemySpeed = 2;
    player.x = canvas.width / 2 - 25;
    player.originalX = canvas.width / 2 - 25;
    player.lives = 3;
    player.speed = 7;
    player.shake = false;
    player.shakeDuration = 0;
    scoreDisplay.textContent = `Skor: ${score} | Can: ${player.lives}`;
    gameLoop();
}

// Oyun bitti modalını göster
function showGameOverModal() {
    finalScoreDisplay.textContent = score;
    gameOverModal.style.display = 'block';
}

// Klavye kontrolleri (Boşluk ve Enter'ı modal kapatma için devre dışı bırak)
document.addEventListener('keydown', (e) => {
    if (gameOver) return; // Oyun bittiyse klavye kontrollerini devre dışı bırak
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === ' ' && !keys.shoot) {
        keys.shoot = true;
        shootBullet();
    }
});

document.addEventListener('keyup', (e) => {
    if (gameOver) return; // Oyun bittiyse klavye kontrollerini devre dışı bırak
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === ' ') keys.shoot = false;
    // Klavye ile modal kapatma engellendi
});

// Fare ile modal kapatma ve oyunu yeniden başlatma
closeModalButton.addEventListener('click', () => {
    gameOverModal.style.display = 'none';
    startGame(); // Modal kapandığında oyunu yeniden başlat
});

// Resimlerin yüklenmesini bekle
let imagesLoaded = 0;
const totalImages = enemyImages.length + 2;
enemyImages.forEach((img, index) => {
    img.onload = () => {
        imagesLoaded++;
        console.log(`Resim yüklendi: ${img.src}`);
        if (imagesLoaded === totalImages) {
            setTimeout(() => {
                enemySpawnInterval = setInterval(() => updateSpawnRate(), spawnInterval);
                gameLoop();
            }, 2000);
        }
    };
    img.onerror = () => {
        console.error(`Resim yüklenemedi: ${img.src}. Dosya yolunu kontrol edin!`);
    };
});

bulletImage.onload = () => {
    imagesLoaded++;
    console.log(`Resim yüklendi: ${bulletImage.src}`);
    if (imagesLoaded === totalImages) {
        setTimeout(() => {
            enemySpawnInterval = setInterval(() => updateSpawnRate(), spawnInterval);
            gameLoop();
        }, 2000);
    }
};
bulletImage.onerror = () => {
    console.error(`Mermi resmi yüklenemedi: ${bulletImage.src}. Dosya yolunu kontrol edin!`);
};

playerImage.onload = () => {
    imagesLoaded++;
    console.log(`Resim yüklendi: ${playerImage.src}`);
    if (imagesLoaded === totalImages) {
        setTimeout(() => {
            enemySpawnInterval = setInterval(() => updateSpawnRate(), spawnInterval);
            gameLoop();
        }, 2000);
    }
};
playerImage.onerror = () => {
    console.error(`Oyuncu resmi yüklenemedi: ${playerImage.src}. Dosya yolunu kontrol edin!`);
};

// Seslerin yüklenmesini kontrol et
lifeLostSound.onloadeddata = () => {
    console.log('Can kaybı sesi yüklendi.');
};
lifeLostSound.onerror = () => {
    console.error('Can kaybı sesi yüklenemedi: ' + lifeLostSound.src);
};

gameOverSound.onloadeddata = () => {
    console.log('Oyun bitti sesi yüklendi.');
};
gameOverSound.onerror = () => {
    console.error('Oyun bitti sesi yüklenemedi: ' + gameOverSound.src);
};

shootSound.onloadeddata = () => {
    console.log('Mermi atış sesi yüklendi.');
};
shootSound.onerror = () => {
    console.error('Mermi atış sesi yüklenemedi: ' + shootSound.src);
};
