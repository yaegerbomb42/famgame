export class EmberSystem {
    particles: Particle[] = [];
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    mouseX: number = 0;
    mouseY: number = 0;
    intensity: number = 1.0;

    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }

    setDimensions(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    setIntensity(level: number) {
        // level 0.0 to 2.0
        this.intensity = level;
    }

    updateMouse(x: number, y: number) {
        this.mouseX = x;
        this.mouseY = y;
    }

    spawn(x: number, y: number, type: 'FIRE' | 'SMOKE' | 'SPARK') {
        const p = new Particle(x, y, type);
        this.particles.push(p);
    }

    update() {
        // Spawn based on intensity
        const spawnCount = Math.floor(this.intensity * 5);
        for (let i = 0; i < spawnCount; i++) {
            this.spawn(Math.random() * this.width, this.height + 20, 'FIRE');
            if (Math.random() > 0.8) this.spawn(Math.random() * this.width, this.height + 20, 'SMOKE');
            if (Math.random() > 0.95) this.spawn(Math.random() * this.width, this.height + 20, 'SPARK');
        }

        // Also spawn from mouse if active
        if (this.mouseX > 0 && this.mouseY > 0) {
            for (let i = 0; i < 2; i++) {
                this.spawn(this.mouseX, this.mouseY, 'SPARK');
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update(this.mouseX, this.mouseY);
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        // Additive blending for fire
        this.ctx.globalCompositeOperation = 'screen';

        for (const p of this.particles) {
            p.draw(this.ctx);
        }

        this.ctx.globalCompositeOperation = 'source-over';
    }
}

class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    type: 'FIRE' | 'SMOKE' | 'SPARK';
    color: string;
    rotation: number;
    rotSpeed: number;

    constructor(x: number, y: number, type: 'FIRE' | 'SMOKE' | 'SPARK') {
        this.x = x;
        this.y = y;
        this.type = type;

        if (type === 'FIRE') {
            this.life = 1.0;
            this.maxLife = 1.0 + Math.random() * 0.5;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = -3 - Math.random() * 4;
            this.size = 20 + Math.random() * 40;
            this.color = `hsl(${Math.random() * 40 + 10}, 100%, 50%)`; // Orange/Red
        } else if (type === 'SMOKE') {
            this.life = 1.0;
            this.maxLife = 2.0;
            this.vx = (Math.random() - 0.5) * 1;
            this.vy = -1 - Math.random() * 2;
            this.size = 10 + Math.random() * 30;
            this.color = `hsla(0, 0%, ${Math.random() * 20 + 20}%, 0.4)`; // Gray
        } else {
            this.life = 1.0;
            this.maxLife = 0.5 + Math.random() * 0.5;
            this.vx = (Math.random() - 0.5) * 10;
            this.vy = (Math.random() - 0.5) * 10;
            this.size = 2 + Math.random() * 4;
            this.color = '#ffff00'; // Yellow
        }

        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.1;
    }

    update(_mouseX: number, _mouseY: number) {
        this.life -= 0.01;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotSpeed;

        // Wind/Turbulence
        this.vx += (Math.random() - 0.5) * 0.2;

        // Rise faster as it burns
        if (this.type === 'FIRE') this.vy -= 0.05;

        // Shrink
        this.size *= 0.99;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const alpha = Math.min(this.life, 1);
        ctx.globalAlpha = alpha;

        if (this.type === 'FIRE') {
            // Create gradient for each flame particle
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
            grad.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
            grad.addColorStop(0.4, 'rgba(255, 100, 0, 0.6)');
            grad.addColorStop(1, 'rgba(200, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'SMOKE') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        }

        ctx.restore();
    }
}
