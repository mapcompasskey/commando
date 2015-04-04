ig.module(
	'game.main' 
)
.requires(
    'impact.debug.debug',
	'impact.game',
	'impact.font',
    'plugins.simple-camera',
    'game.entities.button',
    'game.entities.player',
    'game.entities.player-flying',
    'game.levels.area1',
    'game.levels.area2'
)
.defines(function(){
    
    //
    // --------------------------------------------------------------------------
    // Title Screen
    // --------------------------------------------------------------------------
    //
    GameTitle = ig.Game.extend({
        
        clearColor: '#ececec',
        tileSize: 10,
        gravity: 400,
        buttonStart: null,
        font: new ig.Font('media/04b03.font.png'),
        
        logo: {
            pos: {x: 0, y: 0},
            img: new ig.Image('media/commando-cody.png')
        },
        
        // initialize your game here
        init: function() {
            
            // bind keys
            ig.input.bind(ig.KEY.A, 'left');
            ig.input.bind(ig.KEY.D, 'right');
            ig.input.bind(ig.KEY.MOUSE1, 'click');
            
            // show collision boxes
            //ig.Entity._debugShowBoxes = true;
            
            // add Start button
            var settings = {action:'start', anchor:{bottom:10, right:10, offset:{x:0, y:0}}, width:50, height:19, imgSrc:'media/button-start.png'};
            this.buttonStart = ig.game.spawnEntity(EntityButton, 0, 0, settings);
            
            // spawn flying player
            ig.game.spawnEntity(EntityFlyingPlayer, (ig.system.width / 2), (ig.system.height / 2));
            
            // set game width
            this.resizeGame();
            
        },
        
        update: function() {
            
            this.parent();
            
            // if Start button is pressed
            this.buttonStart.update();
            if (ig.input.released('start'))
            {
                ig.system.setGame(GameStage);
            }
            
            // update camera
            if (this.player)
            {
                if (this.camera)
                {
                    // camera follows the player
                    this.camera.follow(this.player);
                }
                else
                {
                    // center screen on the player
                    this.screen.x = (this.player.pos.x - (ig.system.width / 2));
                    this.screen.y = (this.player.pos.y - (ig.system.height / 2));
                }
            }
            
        },
        
        draw: function() {
            
            this.parent();
            
            // draw logo
            this.logo.img.draw(this.logo.pos.x, this.logo.pos.y);
            
            // draw text
            //var text = 'You\'re a lowly slime.\nAdventures are raiding your home.\nFind a way to defeat them.';
            //text += '\n\nCLICK to jump.\nCLICK and HOLD to attack.';
            //this.font.draw(text, (ig.system.width / 2), 70, ig.Font.ALIGN.CENTER);
            
            // draw Start button
            this.buttonStart.draw(true);
            
        },
        
        // reposition entities
        resizeGame: function() {
        
            // has the game started
            if ( ! ig.system)
            {
                return;
            }
            
            // update logo position
            this.logo.pos.x = ((ig.system.width / 2) - (this.logo.img.width / 2));
            this.logo.pos.y = 50;
            
            // reposition Start button
            this.buttonStart.align();
            
        },
        
    });
    
    
    
    //
    // --------------------------------------------------------------------------
    // The Game Stage
    // --------------------------------------------------------------------------
    //
    GameStage = ig.Game.extend({
        
        clearColor: '#ececec',
        isPaused: false,
        tileSize: 10,
        gravity: 400,
        font: new ig.Font('media/04b03.font.png'),
        
        
        // initialize your game here
        init: function() {
            
            // bind keys
            ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
            ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
            ig.input.bind(ig.KEY.UP_ARROW, 'up');
            ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
            ig.input.bind(ig.KEY.X, 'jump');
            ig.input.bind(ig.KEY.Z, 'attack');
            ig.input.bind(ig.KEY.C, 'invincible');
            ig.input.bind(ig.KEY.P, 'pause');
            
            this.loadLevel(LevelArea1);
            
            // show collision boxes
            //ig.Entity._debugShowBoxes = true;
            
            // set game width
            this.resizeGame();
            
        },
        
        update: function() {
        
            this.parent();
            
            if (ig.input.pressed('pause'))
            {
                this.isPaused = !this.isPaused;
            }
            
            if (ig.game.isPaused)
            {
                return;
            }
            
            // update camera
            if (this.player)
            {
                if (this.camera)
                {
                    // camera follows the player
                    this.camera.follow(this.player);
                }
                else
                {
                    // center screen on the player
                    this.screen.x = (this.player.pos.x - (ig.system.width / 2));
                    this.screen.y = (this.player.pos.y - (ig.system.height / 2));
                }
            }
            
        },
        
        draw: function() {
        
            this.parent();
            
            // draw controls text
            var text = 'Arrow Keys to Move | X to Jump';
            var xPos = (10 - this.screen.x);
            var yPos = (ig.game.collisionMap.pxHeight - this.screen.y - 20);
            this.font.draw(text, xPos, yPos, ig.Font.ALIGN.LEFT);
            
        },
        
        loadLevel: function(data) {
            
            // remember the currently loaded level, so we can reload when the player dies.
            this.currentLevel = data;
            
            // call the parent implemenation. this creates the background maps and entities.
            this.parent(data);
            
            // setup camera plugin
            this.camera = new ig.SimpleCamera();
            this.camera.offset.x.min = 0;
            this.camera.offset.x.max = 0;
            this.camera.getMinMax();
            
            // spawn player
            ig.game.spawnEntity(EntityPlayer, (this.tileSize * 5), (this.tileSize * 54));
            
            // add Back button
            var settings = {action:'back', anchor:{top:10, right:5, offset:{x:0, y:0}}, width:43, height:19, imgSrc:'media/button-back.png'};
            this.buttonBack = ig.game.spawnEntity(EntityButton, 0, 0, settings);
            
        },
        
        // size the game to the browser
        resizeGame: function() {
            
            // has the game started
            if ( ! ig.system)
            {
                return;
            }
            
            if (this.camera)
            {
                this.camera.getMinMax();
            }
            
        },
        
    });
    
    
    
    //
    // --------------------------------------------------------------------------
    // ImpactJS Overrides
    // --------------------------------------------------------------------------
    //
    // override default parallax effect to force y-axis positiong from certain layers
    ig.BackgroundMap.inject({
        setScreenPos: function(x, y) {
            
            /*
            if (this.name == 'horizon')
            {
                this.scroll.x = x / 2;
                this.scroll.y = y + 300;
                return;
            }
            */
            
            this.scroll.x = x / this.distance;
            this.scroll.y = y / this.distance;
            
        }
    });
    
    
    
    //
    // --------------------------------------------------------------------------
    // Fullscreen / Mobile mode
    // --------------------------------------------------------------------------
    //
    ig.gameScale = 1;//(window.innerWidth < 640 ? 2 : 1);
    if (fullscreen || ig.ua.mobile)
    {
        // set the canvas element to the size of the window
        ig.gameCanvas = document.getElementById('canvas');
        ig.gameCanvas.style.width  = window.innerWidth + 'px';
        ig.gameCanvas.style.height = window.innerHeight + 'px';
        
        // on browser resize, update the canvas and game entities
        window.addEventListener('resize', function() {
        
            if ( ! ig.system)
            {
                return;
            }
            
            // resize the canvas
            if (ig.gameCanvas)
            {
                ig.gameCanvas.style.width  = window.innerWidth + 'px';
                ig.gameCanvas.style.height = window.innerHeight + 'px';
                ig.system.resize((window.innerWidth * ig.gameScale), (window.innerHeight * ig.gameScale));
            }
            
            if (ig.game.resizeGame)
            {
                ig.game.resizeGame();
            }
            
        }, false);
    }
    
    
    
    //
    // --------------------------------------------------------------------------
    // Initialize the Game
    // --------------------------------------------------------------------------
    //
    ig.main('#canvas', GameTitle, 1, 300, 180, 3);
    //ig.main('#canvas', GameStage, 1, 300, 180, 3);
    
});
