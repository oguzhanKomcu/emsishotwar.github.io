const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

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
    new Image(), // oguz.JPG
    new Image(), // alimert.JPG
    new Image(), // hekaka.JPG
    new Image(), // kaan.JPG
    new Image(), // yazgan.JPG
    new Image(), // osman.JPG
    new Image(), // ozan.JPG
    new Image(), // ziyaburak.JPG
    new Image(), // mertcan.JPG
    new Image(), // adnan.JPG
    new Image(), // kerimcan.JPG
    new Image(), // cagri.JPG
    new Image(), // alpertunga.JPG
    new Image(), // mami.JPG
    new Image(), // sefa.png
    new Image(),
    new Image() // ekrem.png
];
enemyImages[0].src = 'img/oguz.JPG';
enemyImages[1].src = 'img/alimert.JPG';
enemyImages[2].src = 'img/hekaka.JPG'; 
enemyImages[3].src = 'img/kaan.JPG'; 
enemyImages[4].src = 'img/yazgan.JPG'; 
enemyImages[5].src = 'img/osman.JPG'; 
enemyImages[6].src = 'img/ozan.JPG'; 
enemyImages[7].src = 'img/ziyaburak.JPG'; 
enemyImages[8].src = 'img/mertcan.JPG'; 
enemyImages[9].src = 'img/adnan.JPG'; 
enemyImages[10].src = 'img/kerimcan.JPG'; 
enemyImages[11].src = 'img/cagri.png'; 
enemyImages[12].src = 'img/alpertunga.JPG'; 
enemyImages[13].src = 'img/mami.JPG'; 
enemyImages[14].src = 'img/sefa.png';
enemyImages[15].src = 'img/ekrem.JPG';
enemyImages[16].src = 'img/okan.JPG';

let enemies = [];
let score = 0;
let spawnInterval = 2000; // Başlangıç spawn süresi (3 saniye)
const minSpawnInterval = 1000; // Minimum spawn süresi (1 saniye)
const maxEnemies = 5; // Aynı anda ekranda olabilecek maksimum düşman sayısı
const enemiesPerSpawn = 2; // Her spawn işleminde oluşturulacak düşman sayısı
let enemySpeed = 2; // Düşman hızı
let enemySpawnInterval;
let lastSpawnTime = 0;

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

// Düşman oluştur
function createEnemy() {
    const size = 65;
    const x = Math.random() * (canvas.width - size);
    const image = enemyImages[Math.floor(Math.random() * enemyImages.length)];
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
    spawnInterval = Math.max(minSpawnInterval, 3000 - Math.floor(score / 50) * 200);
    if (Date.now() - lastSpawnTime > spawnInterval && enemies.length < maxEnemies) {
        for (let i = 0; i < enemiesPerSpawn; i++) {
            if (enemies.length < maxEnemies) {
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
                if (enemy.image.src.includes('alpertunga.JPG')) {
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
                alert(`Oyun Bitti! Skorun: ${score}`);
                resetGame();
            }
        }

        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
        }
    });

    updateSpawnRate();
    requestAnimationFrame(gameLoop);
}

// Oyunu sıfırla
function resetGame() {
    enemies = [];
    bullets = [];
    score = 0;
    spawnInterval = 3000;
    enemySpeed = 2;
    player.x = canvas.width / 2 - 25;
    player.originalX = canvas.width / 2 - 25;
    player.lives = 3;
    player.speed = 7;
    player.shake = false;
    player.shakeDuration = 0;
    scoreDisplay.textContent = `Skor: ${score} | Can: ${player.lives}`;
    updateSpawnRate();
}

// Klavye kontrolleri
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === ' ' && !keys.shoot) {
        keys.shoot = true;
        shootBullet();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === ' ') keys.shoot = false;
});

// Resimlerin yüklenmesini bekle
let imagesLoaded = 0;
const totalImages = enemyImages.length + 2;
enemyImages.forEach((img) => {
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            setTimeout(() => {
                enemySpawnInterval = setInterval(() => updateSpawnRate(), spawnInterval);
                gameLoop();
            }, 2000);
        }
    };
    img.onerror = () => {
        console.error('Resim yüklenemedi: ' + img.src);
    };
});

bulletImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        setTimeout(() => {
            enemySpawnInterval = setInterval(() => updateSpawnRate(), spawnInterval);
            gameLoop();
        }, 2000);
    }
};
bulletImage.onerror = () => {
    console.error('Mermi resmi yüklenemedi: ' + bulletImage.src);
};

playerImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        setTimeout(() => {
            enemySpawnInterval = setInterval(() => updateSpawnRate(), spawnInterval);
            gameLoop();
        }, 2000);
    }
};
playerImage.onerror = () => {
    console.error('Oyuncu resmi yüklenemedi: ' + playerImage.src);
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