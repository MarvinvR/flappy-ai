var attempts = []
var lastAttempts = []
var TRAINING_ROUNDS = 100
var NUM_BEST_ATTEMPTS = 5

var env

var stopTraining = false
var roundActive = false


function startBot(instance, firstRound) {
    var thoughtProcess = []
    // Needed info:
    //bird.y
    //bird.x

    //pipe.x
    //pipe.y

    //score
    //dead
    if (firstRound) {
        thoughtProcess = []
        for (let i = 0; i < 3; i++) {
            thoughtProcess.push(Math.random())
        }
    } else {
        thoughtProcess = lastAttempts[getRandomArbitrary(0, TRAINING_ROUNDS)].tp
        for (let i = 0; i < getRandomArbitrary(0, 2); i++) {
            var randomIndex = getRandomArbitrary(0, thoughtProcess.length)
            var value =  thoughtProcess[randomIndex]
            thoughtProcess[randomIndex] = (value * 3 + Math.random())/4
        }
    }
    instance.handleJumpStart()
    return thoughtProcess
}

function trainBot() {
    lastAttempts = JSON.parse(localStorage.getItem('nn'))
    env.forEach(e => {
        if(!lastAttempts) {
            trainingRound(e, true)
        } else {
            trainingRound(e, false)
        }
    })
    var pollInterval = setInterval( () => {
        if(stopTraining) {
            clearInterval(pollInterval)
        }
        if(attempts.length == TRAINING_ROUNDS) {
            fillPersistentArray()
            attempts = []
            /*env.forEach(e => {
                trainingRound(e, false)
            })*/
        }
    }, 100)
}

function trainingRound(instance, firstRound) {
    var tp = startBot(instance, firstRound)
    var lastScore = 0
    var interval = setInterval(function() {
        if(!instance.started()) {
            console.log("Done")
            console.log(tp)
            console.log(lastScore)
            console.log("------")
            attempts.push({score: lastScore, tp: tp})
            clearInterval(interval);
        } else {
            lastScore = instance.counter().text
            evaluate(instance, tp)
        }
    }, 50)
}

function evaluate(instance, thoughtProcess) {
    if(instance.started() && instance.pipe()) {
        var should = shouldJump(instance.bird().x, instance.bird().y, instance.pipe().x, instance.pipe().y, thoughtProcess)
        if(should) {
            instance.handleJumpStart()
        }
    } else if(!instance.pipe() && instance.bird().rotation > 0) {
        instance.handleJumpStart()
    }

}

function fillPersistentArray() {
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
        if(lastAttempts != null && lastAttempts != []) {
            output = lastAttempts
        } else {
            output = [ ]
            for (let i = 0; i < TRAINING_ROUNDS; i++) {
                var tp = []
                for (let j = 0; j < 3; j++) {
                    tp.push(Math.random())
                }
                output.push({score: 0, tp: tp})
            }
        }
    }
    lastAttempts = output
    localStorage.setItem('nn', JSON.stringify(lastAttempts))
}

function shouldJump(bx, by, px, py, tp) {
    z = (bx - px) * tp[0] + (by - py) * tp[1] + tp[2]
    z = z/100
    var val = 1/(1 + Math.exp(-z))
    return (val >= 0.8)
}

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * max) + min  
}

function prepareEnv() {
    var list = []
    var objectList = []
    for (let i = 0; i < TRAINING_ROUNDS; i++) {
        $('#flappyBirdContainer').append('<canvas id="canvas'+ i +'" width="768" height="1024"></canvas>')
        list.push('canvas' + i)
    }
    list.forEach( l => {
        var o = FlappyBird(l)
        o.init()
        objectList.push(o)
    })
    env = objectList
}