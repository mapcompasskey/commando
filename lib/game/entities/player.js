ig.module(
    'game.entities.player'
)
.requires(
    'game.entities.jetpack-smoke',
    'impact.entity'
)
.defines(function() {
    EntityPlayer = ig.Entity.extend({
        
        size: {x: 20, y: 35},
        offset: {x: 15, y: 15},
        maxVel: {x: 200, y: 400},
        friction: {x: 0, y: 0},
        flip: false,
        speed: 150,
        jump: 300,
        health: 6,
        isInvincible: false,
        animSheet: new ig.AnimationSheet('media/player.png', 50, 50),
        
        smokeTime: 0.05,
        timerSmoke: null,
        smokeCounter: 0,
        smokeCounterMax: 4,
        
        walking: false,
        jumping: false,
        falling: false,
        hurting: false,
        crouching: false,
        attacking: false,
        dying: false,
        
        type: ig.Entity.TYPE.A, // add to friendly group
        checkAgainst: ig.Entity.TYPE.NONE, // check collisions against nothing
        collides: ig.Entity.COLLIDES.PASSIVE,
        
        init: function(x, y, settings) {
        
            this.parent(x, (y - this.size.y), settings);
            
            // add the animations
            this.addAnim('idle', 1, [0], true);
            this.addAnim('crouch', 1, [0], true);
            this.addAnim('walk', 0.25, [2,3,4,1], false);
            this.addAnim('jump', 1, [5], true);
            this.addAnim('fall', 1, [5], true);
            this.addAnim('hurt', 1, [0], true);
            this.addAnim('dead', 1, [0], true);
            this.addAnim('attack', 1, [0], true);
            
            // game instance of this entity
            ig.game.player = this;
            
        },
        
        update: function() {
            
            if (ig.game.isPaused)
            {
                return;
            }
            
            this.checkStatus();
            this.checkPosition();
            this.parent();
            
        },
        
        checkStatus: function() {
        
            // update direction facing
            if ( ! this.hurting && ! this.dying)
            {
                if (ig.input.state('left'))
                {
                    this.flip = true;
                }
                else if (ig.input.state('right'))
                {
                    this.flip = false;
                }
            }
            
            // toggle invincibility
            if (ig.input.pressed('invincible'))
            {
                this.isInvincible = this.isInvincible ? false : true;
            }
            
            // check entity status
            this.isHurting();
            this.isCrouching();
            this.isAttacking();
            this.isJumping();
            this.isMoving();
            this.animate();
            
        },
        
        // check if hurting
        isHurting: function() {
            
            // if dying, kill this entity when the animation ends
            if (this.dying)
            {
                if (this.currentAnim == this.anims.dead)
                {
                    if (this.currentAnim.loopCount)
                    {
                        this.kill();
                    }
                }
            }
            
            // if hurting, stop hurting when the animation ends
            if (this.hurting)
            {
                if (this.currentAnim == this.anims.hurt)
                {
                    if (this.currentAnim.loopCount)
                    {
                        this.hurting = false;
                    }
                }
            }
            
        },
        
        // check if crouching
        isCrouching: function() {
            
            if (this.hurting || this.dying || this.jumping || this.falling || this.attacking)
            {
                return;
            }
            
            // if standing on something and just pressed "DOWN" button
            if ( ! this.crouching)
            {
                if (this.standing && ig.input.state('down'))
                {
                    this.crouching = true;
                    this.vel.x = 0;
                    this.updateCollisionBox();
                    return;
                }
            }
            // else, if crouching and no longer pressing "DOWN" button
            else
            {
                if ( ! ig.input.state('down'))
                {
                    this.crouching = false;
                    this.updateCollisionBox();
                }
            }
            
        },
        
        // check if attacking
        isAttacking: function() {
            
            if (this.hurting || this.dying || this.crouching)
            {
                this.attacking = false;
                return;
            }
            
        },
        
        // check if jumping
        isJumping: function() {
            
            if (this.hurting || this.dying || this.crouching)
            {
                this.jumping = false;
                this.falling = false;
                return;
            }
            
            // add some smoke
            if (this.timerSmoke)
            {
                if (this.timerSmoke.delta() > 0)
                {
                    this.addJetpackSmoke();
                    if (this.smokeCounter >= this.smokeCounterMax)
                    {
                        this.smokeCounter = 0;
                        this.timerSmoke = null;
                    }
                    else
                    {
                        this.timerSmoke = new ig.Timer(this.smokeTime);
                    }
                }
            }
            
            // if standing on something and just pressed "JUMP" button
            if (this.standing && ig.input.pressed('jump'))
            {
                this.jumping = true;
                this.vel.y = -this.jump;
                return;
            }
            
            // if jumping again in the air
            if (this.jumping && ig.input.pressed('jump'))
            {
                this.vel.y = -this.jump;
                this.falling = false;
                
                this.smokeCounter = 0;
                this.addJetpackSmoke();
                this.timerSmoke = new ig.Timer(this.smokeTime);
                
                return;
            }
            
            // reduce jumping height
            if ((this.jumping || this.falling) && ig.input.released('jump'))
            {
                this.vel.y = (this.vel.y / 2);
            }
            
            // if falling
            if (this.vel.y > 0 && ! this.standing)
            {
                this.falling = true;
                return;
            }
            
            // if standing on something while jumping/falling
            if ((this.jumping || this.falling) && this.standing)
            {
                this.jumping = false;
                this.falling = false;
            }
        },
        
        // checking if idle or moving left/right
        isMoving: function() {
        
            if (this.hurting || this.dying || this.crouching)
            {
                this.walking = false;
                return;
            }
            
            if (ig.input.state('left'))
            {
                this.walking = true;
                this.vel.x = -this.speed;
            }
            else if (ig.input.state('right'))
            {
                this.walking = true;
                this.vel.x = this.speed;
            }
            else
            {
                this.walking = false;
                this.vel.x = 0;
            }
            
        },
        
        // update entity animation
        animate: function() {
            
            // update entitiy opacity
            if (this.hurting || this.isInvincible)
            {
                this.currentAnim.alpha = 0.5;
            }
            else if (this.currentAnim.alpha < 1)
            {
                this.currentAnim.alpha = 1;
            }
            
            // update animation state
            if (this.dying)
            {
                if (this.currentAnim != this.anims.dead)
                {
                    this.currentAnim = this.anims.dead.rewind();
                }
            }
            else if (this.hurting)
            {
                if (this.currentAnim != this.anims.hurt)
                {
                    this.currentAnim = this.anims.hurt.rewind();
                }
            }
            else if (this.crouching)
            {
                if (this.currentAnim != this.anims.crouch)
                {
                    this.currentAnim = this.anims.crouch.rewind();
                }
            }
            else if (this.attacking)
            {
                if (this.currentAnim != this.anims.attack)
                {
                    this.currentAnim = this.anims.attack.rewind();
                }
            }
            else if (this.falling)
            {
                if (this.currentAnim != this.anims.fall)
                {
                    this.currentAnim = this.anims.fall.rewind();
                }
            }
            else if (this.jumping)
            {
                if (this.currentAnim != this.anims.jump)
                {
                    this.currentAnim = this.anims.jump.rewind();
                }
            }
            else if (this.walking)
            {
                if (this.currentAnim != this.anims.walk)
                {
                    this.currentAnim = this.anims.walk.rewind();
                }
            }
            else
            {
                if (this.currentAnim != this.anims.idle)
                {
                    this.currentAnim = this.anims.idle.rewind();
                }
            }
            
            // update facing direction
            this.currentAnim.flip.x = this.flip;
            
        },
        
        
        // add jetpack smoke
        addJetpackSmoke: function() {
        
            var xPos = (this.pos.x + (this.size.x / 2)) + (this.flip ? 6 : -10);
            var yPos = (this.pos.y + this.size.y - 10);
            ig.game.spawnEntity(EntityJetpackSmoke, xPos, yPos);
            this.smokeCounter++;
            
        },
        
        // check if this entity needs repositioned
        checkPosition: function() {
            
            // if this entity has moved off the map
            if (this.pos.x < ig.game.camera.offset.x.min)
            {
                this.pos.x = (ig.game.collisionMap.pxWidth - ig.game.camera.offset.x.max - (this.size.x * 2));
            }
            else if ((this.pos.x + this.size.x) > (ig.game.collisionMap.pxWidth - ig.game.camera.offset.x.max))
            {
                this.pos.x = (ig.game.camera.offset.x.min + this.size.x);
            }
            
            // if this entity has fallen off the map
            if (this.pos.y > ig.game.collisionMap.pxHeight)
            {
                this.pos.y = 0;
            }
            
        },
        
        // update the size of the collision box
        updateCollisionBox: function() {
        
            /*
            if (this.crouching) {
                this.size.x = 4;
                this.size.y = 10;
                this.offset.x = 28;
                this.offset.y = 30;
                this.pos.y += 6;
            } else {
                this.size.x = 4;
                this.size.y = 16;
                this.offset.x = 28;
                this.offset.y = 24;
                this.pos.y -= 6;
            }
            */
            
        },
        
        // called when overlapping with an entity whose .checkAgainst property matches this entity
        receiveDamage: function(amount, from) {
        
            if (this.hurting || this.dying || this.isInvincible)
            {
                return;
            }
            
            /*
            // reduce health
            this.health -= amount;
            
            // if dead
            if (this.health <= 0)
            {
                this.vel.x = 0;
                this.vel.y = 0;
                this.maxVel.x = 0;
                this.maxVel.y = 0;
                this.dying = true;
                return true;
            }
            
            // update state
            this.hurting = true;
            
            // apply knockback
            this.vel.x = (from.pos.x > this.pos.x) ? -200 : 200;
            this.vel.y = -150;
            */
            
            return true;
            
        }
        
    });
});