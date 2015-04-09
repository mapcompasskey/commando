ig.module(
    'game.entities.player-flying'
)
.requires(
    'game.entities.jetpack-smoke',
    'impact.entity'
)
.defines(function() {
    EntityFlyingPlayer = ig.Entity.extend({
        
        size: {x: 49, y: 20},
        offset: {x: 0, y: 0},
        maxVel: {x: 0, y: 0},
        friction: {x: 0, y: 0},
        gravityFactor: 0,
        animSheet: new ig.AnimationSheet('media/player-flying.png', 49, 20),
        
        angle: 0,
        originPos: {x: 0, y: 0},
        smokeTime: 0.1,
        smokeCounter: 0,
        
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        _wmIgnore: true,
        
        init: function(x, y, settings) {
        
            this.parent(x, y, settings);
            
            // center the sprite
            this.pos.x -= (this.size.x / 2);
            this.pos.y -= (this.size.y / 2);
            this.originPos = this.pos;
            
            // add the animations
            this.addAnim('idle', 1, [0], true);
            
        },
        
        update: function() {
            
            if (ig.game.isPaused)
            {
                return;
            }
            
            // add some smoke
            this.smokeCounter += ig.system.tick;
            if (this.smokeCounter > this.smokeTime)
            {
                this.smokeCounter = 0;
                this.addJetpackSmoke();
            }
            
            this.isMoving();
            this.parent();
            
        },
        
        // checking if idle or moving left/right
        isMoving: function() {
        
            // move in a circular path
            x = (this.originPos.x) + Math.cos(this.angle) * 10;
            y = (this.originPos.y) + Math.sin(this.angle) * 5;
            
            this.pos.x = x - 5;
            this.pos.y = y;
            this.angle += 0.02;
        },
        
        
        // add jetpack smoke
        addJetpackSmoke: function() {
        
            var xPos = (this.pos.x + (this.size.x / 2)) + (this.flip ? 6 : -16);
            var yPos = (this.pos.y + this.size.y - 15);
            var smoke = ig.game.spawnEntity(EntityJetpackSmoke, xPos, yPos, {speed: -100});
            
        },
        
    });
});