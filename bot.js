var attempts = []
var lastAttempts = []
var TRAINING_ROUNDS = 120
var NUM_BEST_ATTEMPTS = 5

var env

var stopTraining = false
var roundActive = false


function startBot(instance) {
    var thoughtProcess = []
    // Needed info:
    //bird.y
    //bird.x

    //pipe.x
    //pipe.y

    //score
    //dead
    if (!lastAttempts || lastAttempts.length == 0 ) {
        thoughtProcess = []
        for (let i = 0; i < 3; i++) {
            thoughtProcess.push(Math.random())
        }
    } else {
        thoughtProcess = [...lastAttempts[getRandomArbitrary(0, lastAttempts.length)].tp]
        for (let i = 0; i < getRandomArbitrary(0, 3); i++) {
            var randomIndex = getRandomArbitrary(0, thoughtProcess.length)
            var value =  thoughtProcess[randomIndex]
            thoughtProcess[randomIndex] = (value * 8 + Math.random())/9
        }
    }
    instance.handleJumpStart()
    return thoughtProcess
}

function trainBot() {
    lastAttempts = JSON.parse(localStorage.getItem('nn'))
    env.forEach(e => {
        trainingRound(e)
    })
    var pollInterval = setInterval( () => {
        if(stopTraining) {
            clearInterval(pollInterval)
        }
        if(attempts.length == TRAINING_ROUNDS) {
            fillPersistentArray()
            attempts = []
            env.forEach(e => {
                e.restart()
                trainingRound(e)
            })
        }
    }, 100)
}

function trainingRound(instance) {
    var tp = startBot(instance)
    var lastScore = 0
    var interval = setInterval(function() {
        if(!instance.started() || instance.dead()) {
            if(lastScore > 0) {
                console.log("------")
                console.log(tp)
                console.log(lastScore)
                console.log("------")
            }
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

function shouldJump(bx, by, px, py, tp) {
    z = (bx - px) * tp[0] + (by - py) * tp[1] + tp[2]
    var val = 1/(1 + Math.exp(-z))
    return (val >= 0.5)
}

function fillPersistentArray() {
    var output = []
    attempts.sort((a, b) => (a.score < b.score) ? 1 : -1)
    attempts = attempts.filter((x) => {return x.score > 0})
    var numAttempts = attempts.length
    if(numAttempts > NUM_BEST_ATTEMPTS) { numAttempts = NUM_BEST_ATTEMPTS }
    attPerSection = Math.floor(TRAINING_ROUNDS / numAttempts)
    for (let i = 0; i < numAttempts; i++) {
        for (let j = 0; j < attempts[i].score ** 2; j++) {
            output.push(attempts[i])
        }
    }
    if (output.length == 0) {
        if(lastAttempts != null && lastAttempts != []) {
            output = lastAttempts
        } 
    }
    var outputScore = 0
    output.forEach(o => {
        outputScore += o.score
    })
    var lastAttemptsScore = 0
    lastAttempts.forEach(l => {
        lastAttemptsScore += l.score
    })
    if (lastAttemptsScore < outputScore) {
        lastAttempts = output
    }
    localStorage.setItem('nn', JSON.stringify(lastAttempts))
}

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * max) + min  
}

function prepareEnv() {
    var list = []
    var objectList = []
    var firstItem = true
    for (let i = 0; i < TRAINING_ROUNDS; i++) {
        $('#flappyBirdContainer').append('<canvas ' + (!firstItem ? 'class="hidden" ' : '') + 'id="canvas'+ i +'" width="768" height="1024"></canvas>')
        firstItem = false
        list.push('canvas' + i)
    }
    firstItem = true
    list.forEach( l => {
        var o = FlappyBird(l, firstItem)
        firstItem = false
        o.init()
        objectList.push(o)
    })
    env = objectList
}