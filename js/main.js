(function() {

    var cnv = document.querySelector('canvas');
    var ctx = cnv.getContext('2d');

    var gravity = 0.1;
    var catX = catY = hyp = 0;

    // Estados do jogo
    var START = 1, PLAY = 2, OVER = 3;
    var gameState = START;

    // Pontuação
    var score = 0;

    // Recorde
    var record = 0;
    if(localStorage.getItem("record") !== null) {
        record = localStorage.getItem("record");
    }

    // Objeto bola
    var ball = {
        radius: 30,
        vx: 0,
        vy: 0,
        x: cnv.width/2 - 10,
        y: 50,
        color: "#00f",
        touched: false,
        visible: false
    };

    // Mensagem inicial
    var messages = [];
    var startMessage = {
        text: "TOUCH TO START",
        y: cnv.height / 2 - 100,
        font: "bold 30px Sans-serif",
        color: "#f00",
        visible: true
    };

    messages.push(startMessage);

    // Placar final
    var scoreText = Object.create(startMessage);
    scoreText.visible = false;
    scoreText.y = (cnv.height/2 + 50);

    messages.push(scoreText);

    // Recorde
    var recordMessage = Object.create(startMessage);
    recordMessage.visible = false;
    recordMessage.y = (cnv.height / 2) + 100;

    messages.push(recordMessage);

    // Eventos
    cnv.addEventListener('mousedown', function(e) {
        catX = ball.x - e.offsetX;
        catY = ball.y - e.offsetY;
        hyp  = Math.sqrt(catX * catX + catY * catY);

        switch(gameState){
            case START:
                gameState = PLAY;
                startMessage.visible = false;
                startGame();
            break;
            case PLAY:
                if(hyp < ball.radius && !ball.touched){
                    ball.vx = Math.floor(Math.random()*21 - 10);
                    ball.vy = -(Math.floor(Math.random()*6 + 5));
                    ball.touched = true;
                    score++;
                }
            break;
        }
    }, false);

    cnv.addEventListener('mouseup', function(e) {
        if(gameState === PLAY){
            ball.touched = false;
        }
    }, false);

    function loop() {
        requestAnimationFrame(loop, cnv);
        if(gameState === PLAY) {
            update();
        }
        render();
    }

    function update(){
        // Ação da gravidade e deslocamento da bola
        ball.vy += gravity;
        ball.y += ball.vy;
        ball.x += ball.vx;

        // Quicar nas paredes
        if(ball.x + ball.radius > cnv.width || ball.x < ball.radius){
            if(ball.x < ball.radius){
                ball.x = ball.radius;
            } else {
                ball.x = cnv.width - ball.radius;
            }
            ball.vx *= -0.8;
        }

        // Quicar no teto
        if(ball.y < ball.radius && ball.vy < 0){
            ball.y = ball.radius;
            ball.vy *= -1;
        }

        // Game over
        if(ball.y - ball.radius > cnv.height) {
            gameState = OVER;
            ball.visible = false;

            setTimeout(function(){
                startMessage.visible = true;
                gameState = START;
            }, 1000);

            scoreText.text = "YOUR SCORE: " + score;
            scoreText.visible = true;

            if(score > record){
                record = score;
                localStorage.setItem("record", record);
            }

            recordMessage.text = "BEST SCORE: " + record;
            recordMessage.visible = true;
        }
    }

    function render(){
        ctx.clearRect(0, 0, cnv.width, cnv.height);

        // Renderização da bola
        if(ball.visible){
            ctx.fillStyle = ball.color;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
            ctx.closePath();
            ctx.fill();

            // Desenhar o placar
            ctx.font = "bold 15px Arial";
            ctx.fillStyle = "#000";
            ctx.fillText("SCORE: " + score, 10, 20);
        }
        
        // Renderizar mensagens
        for(var i in messages){
            var msg = messages[i];
            if(msg.visible){
                ctx.font = msg.font;
                ctx.fillStyle = msg.color;
                ctx.fillText(msg.text, 
                    (cnv.width - ctx.measureText(msg.text).width)/2, msg.y);
            }
        }
    }

    // Inicialização do jogo
    function startGame(){
        ball.vy = 0;
        ball.y = 50;
        ball.vx = Math.floor(Math.random()*21 - 10);
        ball.x = Math.floor(Math.random()*261 + 20);
        ball.visible = true;
        score = 0;
        scoreText.visible = false;
        recordMessage.visible = false;
    }

    loop();
}());