ig.module(
    'game.entities.cloud'
)
.requires(
    'impact.entity',
    'impact.entity-pool'
)
.defines(function() {
    EntityCloud = ig.Entity.extend({
        
        size: {x: 0, y: 0},
        offset: {x: 0, y: 0},
        maxVel: {x: 0, y: 0},
        friction: {x: 0, y: 0},
        jump: 0,
        speed: 0,
        img: null,
        cloud1: new ig.Image('media/cloud-1.png'),
        cloud2: new ig.Image('media/cloud-2.png'),
        cloud3: new ig.Image('media/cloud-3.png'),
        
        type: ig.Entity.TYPE.NONE,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.NONE,
        
        init: function(x, y, settings) {
        
            this.parent(x, y, settings);
            this.prepareEntity(settings);
            
        },
        
        // resurrect this entity from the entity pool (pooling enabled below)
        reset: function(x, y, settings) {
        
            this.parent(x, y, settings);
            this.prepareEntity(settings);
            
        },
        
        // reset parameters
        prepareEntity: function(settings) {
        
            this.speed = -30;
            this.img = this.cloud1;
            
            if (settings)
            {
                if (settings.cloud == 2)
                {
                    this.img = this.cloud2;
                }
                else if (settings.cloud == 3)
                {
                    this.speed = -150;
                    this.img = this.cloud3;
                }
            }
            
            this.maxVel.x = this.vel.x = this.speed;
            
        },
        
        update: function() {
        
            if (ig.game.isPaused)
            {
                return;
            }
            
            // kill the entity when it leaves the scene
            if ((this.pos.x + this.img.width) < -20)
            {
                this.pos.x = (ig.system.width + 20);
            }
            
            this.parent();
            
        },
        
        draw: function() {
        
            // draw image
            this.img.draw(this.pos.x, this.pos.y);
            
        },
        
    });
    
    ig.EntityPool.enableFor(EntityCloud);
});