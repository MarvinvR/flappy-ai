# Flappy-ai

My first attempt to build an ANN to play a game. In this case flappy bird. 

Based on a highly modified version of this repo: https://codepen.io/hiilgav/pen/Grqcn

## Demo
https://flappy-ai.marvinvr.dev

## Structure

index.html -> Basic HTML structure <br/>
scripts.js -> Modified version of Flappy Bird game <br/>
bot.js -> All scripts related to NN


## Configuration

Some configurations can be made to the NN with the constants in bot.js
<pre><code>
TRAINING_ROUNDS -> Number of simultaious Flappy Bird instances running
NUM_BEST_ATTEMPTS -> Maximum amount of best attempts NN uses to learn from
NUM_ATTEMPTS_STORED -> Maximum number of attempts stored at once
RANDOM_ODDS -> Odds in % of Bird using a new random thought process
NUM_RAN -> Number of random values needed
</code></pre>