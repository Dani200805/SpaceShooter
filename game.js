// Beállítások
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//Modellek
const űrhajóKép = new Image();
űrhajóKép.src = 'img/spacefighter1.png'; 


const lövedékKép1 = new Image();
lövedékKép1.src = 'img/bullet1.png'; 

const lövedékKép2 = new Image();
lövedékKép2.src = 'img/bullet2.png';

const lövedékKép3 = new Image();
lövedékKép3.src = 'img/bullet3.png'; 


const ellenfélKép = new Image();
ellenfélKép.src = 'img/enemy1.png'; 

// Pontszámláló változó
let pontszám = 0;
let killCount = 0; // Lőtt ellenfelek száma
let töltényTípus = 1; // Kezdetben az első töltény típust használja

// Játékos űrhajó
class Úrhajo {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height - 60;
    this.width = 50;
    this.height = 50;
    this.speed = 7;
    this.dx = 0;
  }

  // Játékos mozgása
  move() {
    this.x += this.dx;

    // Határok kezelése
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
  }

  // Kirajzolás
  draw() {
    ctx.drawImage(űrhajóKép, this.x, this.y, this.width, this.height);
  }
}

// Lövedékek
class Lövedék {
  constructor(x, y, típus) {
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 20;
    this.speed = 10;
    this.típus = típus;
  }

  // Lövedék mozgatása
  move() {
    this.y -= this.speed;
  }

  // Kirajzolás
  draw() {
    let kép;
    if (this.típus === 1) {
      kép = lövedékKép1;
    } else if (this.típus === 2) {
      kép = lövedékKép2;
    } else if (this.típus === 3) {
      kép = lövedékKép3;
    }
    ctx.drawImage(kép, this.x, this.y, this.width, this.height);
  }
}

// Ellenfelek
class Ellenfel {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    this.speed = 3;
  }

  // Ellenfél mozgása
  move() {
    this.y += this.speed;
  }

  // Kirajzolás
  draw() {
    ctx.drawImage(ellenfélKép, this.x, this.y, this.width, this.height);
  }
}

// Játék állapot
let űrhajó = new Úrhajo();
let lövedékek = [];
let ellenfelek = [];
let gameOver = false;

// Keydown és keyup események
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') űrhajó.dx = -űrhajó.speed;
  if (e.key === 'ArrowRight') űrhajó.dx = űrhajó.speed;
  if (e.key === ' ' && !gameOver) fireBullet(); // Space bar - lövés
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') űrhajó.dx = 0;
});

// Lövedék kilövése
function fireBullet() {
  let bullet = new Lövedék(űrhajó.x + 22, űrhajó.y, töltényTípus);
  lövedékek.push(bullet);
}

// Ellenfelek létrehozása
function createEnemies() {
  if (Math.random() < 0.015) {  // Lassabb spawnolás
    let x = Math.random() * (canvas.width - 50);
    let y = -50;
    let enemy = new Ellenfel(x, y);
    ellenfelek.push(enemy);
  }
}

// Ütközés ellenőrzés
function checkCollisions() {
  for (let i = 0; i < ellenfelek.length; i++) {
    for (let j = 0; j < lövedékek.length; j++) {
      if (
        lövedékek[j].x < ellenfelek[i].x + ellenfelek[i].width &&
        lövedékek[j].x + lövedékek[j].width > ellenfelek[i].x &&
        lövedékek[j].y < ellenfelek[i].y + ellenfelek[i].height &&
        lövedékek[j].y + lövedékek[j].height > ellenfelek[i].y
      ) {
        // Ütközés - törlés
        ellenfelek.splice(i, 1);
        lövedékek.splice(j, 1);
        pontszám += 1; // Minden ellenfél 1 pontot ér
        killCount++;

        // Töltény váltás pontszám alapján
        if (pontszám >= 30) {
          if (killCount % 2 === 0) {
            töltényTípus = 3; // Harmadik típusú töltény minden második után
          }
        } else if (pontszám >= 20) {
          if (killCount % 3 === 0) {
            töltényTípus = 3; // Harmadik típusú töltény minden harmadik után
          }
        } else if (pontszám >= 10) {
          if (killCount % 4 === 0) {
            töltényTípus = 2; // Második típusú töltény minden negyedik után
          }
        }
        break;
      }
    }
  }
}

// Játék frissítése
function update() {
  if (gameOver) {
    // Játék vége
    ctx.fillStyle = 'black'; // A szöveg fekete
    ctx.font = '50px Arial';
    ctx.fillText('VÉGE A JÁTÉKNAK', canvas.width / 2 - 180, canvas.height / 2 - 30);
    ctx.font = '30px Arial';
    ctx.fillText('Pontszám: ' + pontszám, canvas.width / 2 - 100, canvas.height / 2 + 30);
    return;
  }

  // Fehér háttér kirajzolása
  ctx.fillStyle = 'white'; // Háttér színe fehér
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fehér négyzet a vászon teljes területén

  // Játékos mozgása
  űrhajó.move();
  űrhajó.draw();

  // Lövedékek mozgatása és kirajzolása
  for (let i = 0; i < lövedékek.length; i++) {
    lövedékek[i].move();
    lövedékek[i].draw();

    // Törlés, ha kijöttek a vászonról
    if (lövedékek[i].y < 0) lövedékek.splice(i, 1);
  }

  // Ellenfelek mozgása és kirajzolása
  for (let i = 0; i < ellenfelek.length; i++) {
    ellenfelek[i].move();
    ellenfelek[i].draw();

    // Játék vége, ha elérik a játékos alját
    if (ellenfelek[i].y + ellenfelek[i].height > canvas.height) {
      gameOver = true;
      break;
    }
  }

  // Új ellenfelek létrehozása
  createEnemies();

  // Ütközés ellenőrzése
  checkCollisions();

  // Pontszám kirajzolása
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText('Pontszám: ' + pontszám, 20, 30);

  // Következő frissítés
  requestAnimationFrame(update);
}

// Játék indítása
update();
