import { Enemy, PowerUp } from "./classes.js"

/**
 * @param {number} min 
 * @param {number} max 
 * @returns {number} A random integer between min and max (inclusive)
 */
export function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * @param {number} TARGET_FPS
 * @param {number} count
 * @param {number} canvasWidth
 * @param {number} enemySize
 * @param {HTMLImageElement} enemyImage
 */
export function createEnemies(TARGET_FPS, count, canvasWidth, enemySize, enemyImage) {
    console.debug("Creating enemies", count)
    const enemies = []
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#F033FF", "#FF33A8"]

    for (let i = 0; i < count; i++) {
        const x = getRandomInt(0, canvasWidth - enemySize)
        const y = getRandomInt(-200, -50)
        const color = colors[getRandomInt(0, colors.length - 1)]
        const speed = getRandomInt(2, 4)

        enemies.push(new Enemy(x, y, enemySize, enemySize, color, speed * TARGET_FPS, enemyImage))
    }

    return enemies
}

/**
 * @param {number} TARGET_FPS
 * @param {number} canvasWidth
 * @param {number} powerUpSize
 * @param {HTMLImageElement[]} powerUpImages
 */
export function createPowerUp(TARGET_FPS, canvasWidth, powerUpSize, powerUpImages) {
    const powerUpTypes = ["extraLife", "speedBoost", "weaponUpgrade", "shield", "scoreMultiplier", "fireRateUpgrade", "autoShoot"]
    
    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]

    const x = getRandomInt(0, canvasWidth - powerUpSize)
    const y = getRandomInt(-200, -50)

    const speed = getRandomInt(2, 4)

    const image = powerUpImages ? powerUpImages[type] : null

    return new PowerUp(x, y, powerUpSize, type, speed * TARGET_FPS, image)
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} canvasWidth 
 * @param {number} canvasHeight 
 * @param {number} starCount 
 */
export function drawStars(ctx, canvasWidth, canvasHeight, starCount) {
    ctx.fillStyle = "white"
    for (let i = 0; i < starCount; i++) {
        const x = Math.random() * canvasWidth
        const y = Math.random() * canvasHeight
        const size = Math.random() * 2
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
    }
}

/**
 * @param {*} imageList 
 * @returns 
 */
export function loadImages(imageList) {
    return new Promise((resolve, reject) => {
        const images = {}
        let loadedCount = 0
        const totalImages = imageList.length

        if (totalImages === 0) {
            resolve(images)
            return
        }

        imageList.forEach((imageInfo) => {
            const img = new Image()

            img.onload = () => {
                images[imageInfo.name] = img
                loadedCount++

                if (loadedCount === totalImages) {
                    resolve(images)
                }
            }

            img.onerror = (err) => {
                console.error(`Failed to load image: ${imageInfo.src}\n`, err)
                reject(new Error(`Failed to load image: ${imageInfo.src}`))
            }

            img.src = imageInfo.src
        })
    })
}
