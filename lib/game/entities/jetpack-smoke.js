ig.module(
    'game.entities.jetpack-smoke'
)
.requires(
    'impact.entity',
    'impact.entity-pool'
)
.defines(function() {
    EntityJetpackSmoke = ig.Entity.extend({
        
        size: {x: 5, y: 5},
        offset: {x: 0, y: 0},
        maxVel: {x: 0, y: 0},
        friction: {x: 0, y: 0},
        speed: 0,
        jump: 0,
        animSheet: new ig.AnimationSheet('media/jetpack-smoke.png', 5, 5),
        
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        
        init: function(x, y, settings) {
        
            this.parent(x, y, settings);
            
            // add the animations
            this.addAnim('fade', 0.1, [0,1,2,3], true);
            this.prepareEntity(settings);
            
        },
        
        // resurrect this entity from the entity pool (pooling enabled below)
        reset: function(x, y, settings) {
        
            this.parent(x, y, settings);
            this.prepareEntity(settings);
            
        },
        
        // reset parameters
        prepareEntity: function(settings) {
        
            this.currentAnim = this.anims.fade.rewind();
            
            if (settings && settings.speed)
            {
                this.maxVel.x = settings.speed;
                this.vel.x = settings.speed;
            }
            
        },
        
        update: function() {
        
            if (ig.game.isPaused)
            {
                return;
            }
            
            // kill the entity when the animation ends
            if (this.currentAnim == this.anims.fade)
            {
                if (this.currentAnim.loopCount)
                {
                    this.kill();
                }
            }
            
            this.parent();
            
        },
        
    });
    
    ig.EntityPool.enableFor(EntityJetpackSmoke);
});