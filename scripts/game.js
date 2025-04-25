import { Player, Bullet, Explosion, PowerUp } from "./classes.js"
import { createEnemies, createPowerUp, drawStars, loadImages } from "./utils.js"

document.addEventListener("DOMContentLoaded", () => {
	const canvas = document.getElementById("gameCanvas")
	const ctx = canvas.getContext("2d")
	const scoreElement = document.getElementById("score")
	const livesElement = document.getElementById("lives")
	const startButton = document.getElementById("startButton")
	const canvasContainer = document.getElementById("canvas-container")
	const powerUpSpawnChance = 0.005

	canvas.width = 600
	canvas.height = 800

	/**
	 * @type {Player}
	 */
	let player
	/**
	 * @type {Bullet[]}
	 */
	let bullets = []
	/**
	 * @type {Enemy[]}
	 */
	let enemies = []
	/**
	 * @type {Explosion[]}
	 */
	let explosions = []
	/**
	 * @type {PowerUp[]}
	 */
	let powerUps = []
	let score = 0
	let gameOver = false
	let isPaused = false
	let gameStarted = false
	let enemySpawnRate = 100
	let enemySpawnCounter = 0
	let lastPowerUpScore = 0
	let animationFrameId
	let gameImages = {}
	let imagesLoaded = false
	let maxEnemyCount = 5
	let currentBulletType = 1

	let activePowerUps = {
		speedBoost: { active: false, duration: 0 },
		weaponUpgrade: { active: false, duration: 0 },
		shield: { active: false, duration: 0 },
		scoreMultiplier: { active: false, duration: 0, value: 1 },
		fireRateUpgrade : { active: false, duration: 0, value: 1 },
		autoShoot: { active: false, duration: 0 }
	}


	const pauseOverlay = document.createElement("div")
	pauseOverlay.className = "pause-overlay"
	pauseOverlay.innerHTML =
		"PAUSED<br><span style='font-size: 24px; margin-top: 10px;'>Press Escape to resume</span>"
	pauseOverlay.style.display = "none"
	canvasContainer.appendChild(pauseOverlay)

	const loadingOverlay = document.createElement("div")
	loadingOverlay.className = "pause-overlay"
	loadingOverlay.innerHTML = "LOADING ASSETS..."
	canvasContainer.appendChild(loadingOverlay)

	const keys = {
		ArrowLeft: false,
		ArrowRight: false,
		a: false,
		d: false,
		" ": false,
		Escape: false
	}

	const imagesToLoad = [
		{ name: "player", src: "img/player1.png" },
		{ name: "enemy", src: "img/enemy1.png" },
		{ name: "bullet1", src: "img/bullet1.png" },
		{ name: "bullet2", src: "img/bullet2.png" },
		{ name: "bullet3", src: "img/bullet3.png" },
		{ name: "bullet4", src: "img/bullet4.png" },
		// TODO: Add images
	]

	loadImages(imagesToLoad)
		.then((loadedImages) => {
			gameImages = loadedImages

			imagesLoaded = true
			loadingOverlay.style.display = "none"

			draw()
		})
		.catch((error) => {
			console.error("Error loading images:", error)
			loadingOverlay.innerHTML = "ERROR LOADING ASSETS<br>Please check the console for details."
		})

	function initGame() {

		if (!imagesLoaded) return

		player = new Player(
			canvas.width / 2 - 25,
			canvas.height - 60,
			50,
			50,
			"#00FFFF",
			8,
			canvas.width,
			gameImages.player,
		)

		bullets = []
		enemies = []
		powerUps = []
		explosions = []
		score = 0
		gameOver = false
		isPaused = false
		currentBulletType = 1
		maxEnemyCount = 5

		activePowerUps = {
			speedBoost: { active: false, duration: 0 },
			weaponUpgrade: { active: false, duration: 0 },
			shield: { active: false, duration: 0 },
			scoreMultiplier: { active: false, duration: 0, value: 1 },
			fireRateUpgrade : { active: false, duration: 0, value: 1 },
			autoShoot: { active: false, duration: 0 }
		}

		enemySpawnRate = 100
		enemySpawnCounter = 0

		enemies = createEnemies(5, canvas.width, 40, gameImages.enemy)

		scoreElement.textContent = score
		livesElement.textContent = player.lives
	}



	function resetGame() {

		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId)
		}

		initGame()

		gameLoop()
	}

	function togglePause() {
		if (!gameStarted || gameOver) return

		isPaused = !isPaused

		if (isPaused) {
			pauseOverlay.style.display = "flex"
		} else {
			pauseOverlay.style.display = "none"

			if (!animationFrameId) {
				gameLoop()
			}
		}
	}

	window.addEventListener("keydown", (e) => {
		if (keys.hasOwnProperty(e.key)) {
			keys[e.key] = true

			console.debug(e.key)
			if (keys["Escape"] && gameStarted && !gameOver) {
				togglePause()
			}
		}
	})

	window.addEventListener("keyup", (e) => {
		if (keys.hasOwnProperty(e.key)) {
			keys[e.key] = false
		}
	})

	startButton.addEventListener("click", (e) => {
		if (imagesLoaded) {
			if (e.pointerType !== 'mouse') return
			gameStarted = true
			resetGame()
			startButton.textContent = "Restart Game"
		}
	})

	function downGradeBullet(bullet) {
		const type = bullet.type
		if (type > 1) {
			bullet.type--
			bullet.width = 15 * (bullet.type + 2)
			bullet.height = 30 * (bullet.type + 2)
			bullet.image = gameImages[`bullet${bullet.type}`]
		}
	}

	function shoot() {
		if (!imagesLoaded) return

		const bulletWidth = 15 * (currentBulletType + 2)
		const bulletHeight = 30 * (currentBulletType + 2)
		const bulletX = player.x + player.width / 2 - bulletWidth / 2
		const bulletY = player.y - bulletHeight

		const bulletImage = gameImages[`bullet${currentBulletType}`]

		
		bullets.push(new Bullet(bulletX, bulletY, bulletWidth, bulletHeight, "#FFFF00", 10, bulletImage, currentBulletType))

	}

	let shootCooldown = 0
	function handleShooting() {
		if (shootCooldown > 0) {
			shootCooldown--
		}

		if ((keys[" "] || activePowerUps.autoShoot.active) && shootCooldown === 0) {
			shoot()

			if (activePowerUps.fireRateUpgrade.active) { shootCooldown = 7 }
			else { shootCooldown = 15 }
		}
	}

	function increaseBulletType() {
		if (currentBulletType < 4) {
			currentBulletType++
			return false
		}
		return true
	}

	function applyPowerUpEffect(powerUpType) {

		switch (powerUpType) {
			case "extraLife":

				player.lives++
				livesElement.textContent = player.lives
				break

			case "fireRateUpgrade":
				activePowerUps.fireRateUpgrade.active = true
				activePowerUps.fireRateUpgrade.duration += 750
				break


			case "speedBoost":

				activePowerUps.speedBoost.active = true
				activePowerUps.speedBoost.duration += 750
				break

			case "weaponUpgrade":

				activePowerUps.weaponUpgrade.active = true
				activePowerUps.weaponUpgrade.duration += 1000
				if (increaseBulletType()) { activePowerUps.weaponUpgrade.duration += 500 }
				break

			case "shield":

				activePowerUps.shield.active = true
				activePowerUps.shield.duration += 1000
				break

			case "scoreMultiplier":

				activePowerUps.scoreMultiplier.active = true
				activePowerUps.scoreMultiplier.duration += 300
				activePowerUps.scoreMultiplier.value += 1
				activePowerUps.scoreMultiplier.value = Math.min(activePowerUps.scoreMultiplier.value, 3)
				break
			
			case "autoShoot":
				activePowerUps.autoShoot.active = true
				activePowerUps.autoShoot.duration += 500
				break
		}
	}

	function updatePowerUpDurations() {

		for (const [type, powerUp] of Object.entries(activePowerUps)) {
			if (powerUp.active) {
				powerUp.duration--

				if (powerUp.duration <= 0) {
					powerUp.active = false
					
					switch (type) {
						case "scoreMultiplier":
							powerUp.value = 1
							break;
						
						case "weaponUpgrade":
							currentBulletType = 1
							break;							
					
						default:
							break;
					}
				}
			}
		}
	}

	function update() {
		if (isPaused || !imagesLoaded) return

		updatePowerUpDurations()

		const playerSpeed = activePowerUps.speedBoost.active ? player.speed * 1.5 : player.speed

		if ((keys.ArrowLeft || keys.a) && player.isActive) {
			player.x -= playerSpeed
			if (player.x < 0) player.x = 0
		}
		if ((keys.ArrowRight || keys.d) && player.isActive) {
			player.x += playerSpeed
			if (player.x + player.width > canvas.width) player.x = canvas.width - player.width
		}

		handleShooting()

		bullets = bullets.filter((bullet) => bullet.update())

		let enemyReachedBottom = false
		enemies.forEach((enemy) => {
			if (enemy.update(canvas.height)) {
				enemyReachedBottom = true
			}
		})

		powerUps = powerUps.filter((powerUp) => powerUp.update(canvas.height))

		if (enemyReachedBottom && player.isActive) {
			player.lives--
			livesElement.textContent = player.lives

			if (player.lives <= 0) {
				gameOver = true
				player.isActive = false
			}
		}

		enemies = enemies.filter((enemy) => enemy.isActive)

		enemySpawnCounter++
		if (enemySpawnCounter >= enemySpawnRate) {
			enemies = enemies.concat(createEnemies(maxEnemyCount - enemies.length, canvas.width, 40, gameImages.enemy))
			enemySpawnCounter = 0


			if (enemySpawnRate > 3) {
				enemySpawnRate--
			}
		}

		if (score - lastPowerUpScore >= 60 * maxEnemyCount || Math.random() < powerUpSpawnChance) {
			powerUps.push(createPowerUp(canvas.width, 30, gameImages.powerUp))
			lastPowerUpScore = score
		}

		bullets.forEach((bullet) => {
			enemies.forEach((enemy) => {
				if (bullet.collidesWith(enemy)) {
					if (activePowerUps.weaponUpgrade.active) {
						downGradeBullet(bullet)
					} else {
						bullet.isActive = false
					}
					enemy.isActive = false
					const pointValue = activePowerUps.scoreMultiplier.active ? 10 * activePowerUps.scoreMultiplier.value : 10
					score += pointValue
					if (score % 1000 === 0) {
						maxEnemyCount++
					}
		
					scoreElement.textContent = score
					explosions.push(new Explosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width))
				}
			})
		})

		if (player.isActive) {
			powerUps.forEach((powerUp) => {
				if (player.collidesWith(powerUp)) {

					const powerUpType = powerUp.applyEffect(player)
					applyPowerUpEffect(powerUpType)
					powerUp.isActive = false
				}
			})

			enemies.forEach((enemy) => {
				if (player.collidesWith(enemy)) {
					enemy.isActive = false


					if (!activePowerUps.shield.active) {
						player.lives--
						livesElement.textContent = player.lives

						if (player.lives <= 0) {
							gameOver = true
							player.isActive = false


							explosions.push(
								new Explosion(player.x + player.width / 2, player.y + player.height / 2, player.width * 1.5),
							)
						}
					} else {

						activePowerUps.shield.active = false
						activePowerUps.shield.duration = 0
					}


					explosions.push(new Explosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width))
				}
			})

			explosions = explosions.filter((explosion) => explosion.update())
		}
	}

	function draw() {

		ctx.fillStyle = "#000"
		ctx.fillRect(0, 0, canvas.width, canvas.height)

		drawStars(ctx, canvas.width, canvas.height, 50)

		if (player && imagesLoaded) {
			player.draw(ctx)


			if (activePowerUps.shield.active) {
				ctx.strokeStyle = "#33FFFF"
				ctx.lineWidth = 2
				ctx.beginPath()
				ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width * 0.8, 0, Math.PI * 2)
				ctx.stroke()
			}
		}

		bullets.forEach((bullet) => bullet.draw(ctx))

		enemies.forEach((enemy) => enemy.draw(ctx))

		powerUps.forEach((powerUp) => powerUp.draw(ctx))

		explosions.forEach((explosion) => explosion.draw(ctx))

		drawPowerUpIndicators()

		if (gameOver) {
			ctx.fillStyle = "white"
			ctx.font = "40px Arial"
			ctx.textAlign = "center"
			ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2)
			ctx.font = "24px Arial"
			ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40)
			ctx.fillText('Click "Restart Game" to play again', canvas.width / 2, canvas.height / 2 + 80)
		}

		if (!gameStarted && imagesLoaded) {
			ctx.fillStyle = "white"
			ctx.font = "40px Arial"
			ctx.textAlign = "center"
			ctx.fillText("SPACE SHOOTER", canvas.width / 2, canvas.height / 2 - 40)
			ctx.font = "24px Arial"
			ctx.fillText('Click "Start Game" to play', canvas.width / 2, canvas.height / 2 + 20)
		}
	}

	function drawPowerUpIndicators() {
		const indicatorSize = 10
		const padding = 5
		let offsetY = 50

		ctx.textAlign = "left"
		ctx.font = "12px Arial"

		for (const [type, powerUp] of Object.entries(activePowerUps)) {
			if (powerUp.active) {

				switch (type) {
					case "speedBoost":
						ctx.fillStyle = "#33FF57"
						break
					case "weaponUpgrade":
						ctx.fillStyle = "#3357FF"
						break
					case "shield":
						ctx.fillStyle = "#F033FF"
						break
					case "scoreMultiplier":
						ctx.fillStyle = "#FFFF33"
						break
					default:
						ctx.fillStyle = "#FFFFFF"
				}


				ctx.fillRect(padding, offsetY, indicatorSize, indicatorSize)


				ctx.fillText(
					`${type}: ${Math.ceil(powerUp.duration / 60)}s`,
					padding + indicatorSize + 5,
					offsetY + indicatorSize - 2,
				)

				offsetY += indicatorSize + padding + 5
			}
		}
	}


	if (imagesLoaded) {
		draw()
	}
})
