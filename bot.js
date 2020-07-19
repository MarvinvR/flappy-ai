
/*

    Config

*/
var TRAINING_ROUNDS = 10
var NUM_BEST_ATTEMPTS = 5
var NUM_ATTEMPTS_STORED = 10
var NUM_DISPLAYED_ITEMS = 0
var RANDOM_ODDS = 15
var NUM_RAN = 3


/*   Code   */

var MASTER_THOUGHT_PROCESS = [0.04410882290469753, 0.6064345623916954, 0.04838791543931212]


var attempts = []
var lastAttempts = []
var levelsCompleted = 0
var generation = 1

var env

// Commands
var stopTraining = false
var killAllBots = false

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
        for (let i = 0; i < NUM_RAN; i++) {
            thoughtProcess.push(Math.random())
        }
    } else {
        if (getRandomArbitrary(0, 100) < RANDOM_ODDS) {
            thoughtProcess = []
            for (let i = 0; i < NUM_RAN; i++) {
                thoughtProcess.push(Math.random())
            }
        } else {
            thoughtProcess = [...lastAttempts[getRandomArbitrary(0, lastAttempts.length)].tp]
            for (let i = 0; i < getRandomArbitrary(0, NUM_RAN-1); i++) {
                var randomIndex = getRandomArbitrary(0, thoughtProcess.length)
                var value =  thoughtProcess[randomIndex]
                thoughtProcess[randomIndex] = (value * generation + Math.random())/(generation + 1)
            }
        }
    }
    instance.handleJumpStart()
    return thoughtProcess
}

function trainBot() {
    lastAttempts = JSON.parse(localStorage.getItem('nn'))
    levelsCompleted = localStorage.getItem('levelsCompleted')
    generation = localStorage.getItem('generation')
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
            console.log("Next Round. Generation: " + generation)
            env.forEach(e => {
                e.restart()
                $("#" + e.container()).css('display', 'inline')
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
            $("#" + instance.container()).css('display', 'none')
            if(lastScore > 0) {
                console.log("Score: " + lastScore)
                console.log(tp)
                console.log("------")
            }
            attempts.push({score: lastScore, tp: tp})
            clearInterval(interval);
        } else {
            lastScore = instance.counter().text
            evaluate(instance, tp)
        }
    }, 25)
}

function evaluate(instance, thoughtProcess) {
    if(instance.started() && instance.pipe() && !killAllBots) {
        var should = shouldJump(instance.bird().x, instance.bird().y, instance.pipe().x +130, instance.pipe().y, thoughtProcess)
        if(should) {
            instance.handleJumpStart()
        }
    } else if(!instance.pipe() && instance.bird().rotation > -15) {
        instance.handleJumpStart()
    }

}

function shouldJump(bx, by, px, py, tp) {
    const o = 1/(1 + Math.exp(-(((bx - px) * tp[0] + (py - by) * tp[1] + tp[2])/80)))
    return (o <= 0.2)
}

function fillPersistentArray() {
    var output = []
    attempts.sort((a, b) => (a.score < b.score) ? 1 : -1)
    attempts = attempts.filter((x) => {return x.score > 0})
    var numAttempts = attempts.length
    if(numAttempts > NUM_BEST_ATTEMPTS) { numAttempts = NUM_BEST_ATTEMPTS }
    var totalScore = 0
    for (let i = 0; i < numAttempts; i++) {
        output.push(attempts[i])
        totalScore += attempts[i].score
    }
    if (output.length == 0) {
        if(lastAttempts != null && lastAttempts != []) {
            output = lastAttempts
        } 
    } else {
        var balancedOutput = []
        output.forEach( o => {
            const numSlots = NUM_ATTEMPTS_STORED / totalScore * o.score
            for (let i = 0; i < numSlots; i++) {
                balancedOutput.push(o)
            }
        })
        output = balancedOutput
    }
    if (levelsCompleted < totalScore) {
        lastAttempts = output
        levelsCompleted = totalScore
        generation++
        localStorage.setItem('generation', generation)
        localStorage.setItem('levelsCompleted', levelsCompleted)
    }
    localStorage.setItem('nn', JSON.stringify(lastAttempts))
}

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * max) + min  
}

function prepareEnv() {
    $('#numInstances').append(TRAINING_ROUNDS)
    var list = []
    var objectList = []
    var visibleItems = 0
    for (let i = 0; i < TRAINING_ROUNDS; i++) {
        $('#flappyBirdContainer').append('<canvas ' + (visibleItems >= NUM_DISPLAYED_ITEMS ? 'class="hidden" ' : '') + 'id="canvas'+ i +'" width="768" height="1024"></canvas>')
        visibleItems++
        list.push('canvas' + i)
    }
    list.forEach( l => {
        var o = FlappyBird(l)
        o.init()
        objectList.push(o)
    })
    env = objectList
}