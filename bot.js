var lastAttempts = []
var TRAINING_ROUNDS = 50
var NUM_BEST_ATTEMPTS = 5

var stopTraining = false
var roundActive = false

var thoughtProcess = []
setInterval(function() {
    evaluate()
}, 100)

function startBot(firstRound, i) {
    // Needed info:
    //bird.y
    //bird.x

    //pipe.x
    //pipe.y

    //score
    //dead
    if (firstRound) {
        thoughtProcess = []
        for (let i = 0; i < 5; i++) {
            thoughtProcess.push(Math.random())
        }
    } else {
        thoughtProcess = lastAttempts[i].tp
        for (let i = 0; i < getRandomArbitrary(0, 3); i++) {
            thoughtProcess[getRandomArbitrary(0, thoughtProcess.length)] = Math.random()
        }
    }
    jumpBird()
    return thoughtProcess
}

function trainBot() {
    lastAttempts = JSON.parse(localStorage.getItem('nn'))
    if(!lastAttempts) {
        trainingRound(true)
        roundActive = true
    }
    var trainingInterval = setInterval(function () {
        if(!roundActive) {
            roundActive = true
            trainingRound(false)
        }
        if(stopTraining) {
            clearInterval(trainingInterval)
            console.log(lastAttempts)
        }
    }, 500)
}

function trainingRound(firstRound) {
    var tp = startBot(firstRound, 0)
    var lastScore = 0
    var i = 0
    var attempts = []
    var interval = setInterval(function() {
        if(!started) {
            if(i < TRAINING_ROUNDS) {
                console.log("Round " + i)
                console.log(tp)
                console.log(lastScore)
                attempts.push({score: lastScore, tp: tp})
                tp = startBot(firstRound, i)
                i++
            } else {
                attempts.sort((a, b) => (a.score < b.score) ? 1 : -1)
                attempts = attempts.filter((x) => {return x.score > 0})
                console.log(attempts[0])
                fillPersistentArray(attempts)
                clearInterval(interval);
                roundActive = false
            }
        } else {
            lastScore = counter.text
        }
    }, 100)
}

function evaluate() {
    if(started && pipe) {
        var should = shouldJump(bird.x, bird.y, pipe.x, pipe.y, thoughtProcess)
        if(should) {
            jumpBird()
        }
    } else if(!pipe && bird.rotation > 30) {
        jumpBird()
    }

}

function fillPersistentArray(attempts) {
    var output = []
    var numAttempts = attempts.length
    if(numAttempts > NUM_BEST_ATTEMPTS) { numAttempts = NUM_BEST_ATTEMPTS }
    attPerSection = Math.floor(TRAINING_ROUNDS / numAttempts)
    for (let i = 0; i < numAttempts; i++) {
        for (let j = 0; j < attPerSection; j++) {
            output.push(attempts[i])
        }
        if(i==0) {for(var k = 0; k < 2; k++) {output.push(attempts[i])}}
    }
    if (output.length == 0) {
        /*for (let i = 0; i < TRAINING_ROUNDS; i++) {
            var t = []
            for (let i = 0; i < 6; i++) {
                t.push(Math.random())
            }
            output.push({score: 0, tp: t})
        }*/
        output = lastAttempts
    }
    lastAttempts = output
    localStorage.setItem('nn', JSON.stringify(lastAttempts))
}

function shouldJump(bx, by, px, py, tp) {
    z = bx * tp[0] + by * tp[1] + px * tp[2] + py * tp[3] + tp[4]
    z = z/1000
    var val = 1/(1 + Math.exp(-z))
    return (val >= 0.8)
}

function jumpBird() {
    var e = jQuery.Event( "keydown", { keyCode: KEYCODE_SPACE } );
    jQuery( "body" ).trigger( e );
}

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * max) + min  
  }