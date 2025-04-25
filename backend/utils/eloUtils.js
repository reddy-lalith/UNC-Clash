const K_FACTOR = 32;

/**
 * Calculates the expected score of player A against player B.
 * @param {number} ratingA Player A's current rating.
 * @param {number} ratingB Player B's current rating.
 * @returns {number} The expected score (probability of winning) for player A.
 */
function calculateExpectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculates the new Elo ratings for a winner and loser.
 * @param {number} winnerElo The current Elo rating of the winner.
 * @param {number} loserElo The current Elo rating of the loser.
 * @param {number} [kFactor=K_FACTOR] The K-factor to use for the calculation.
 * @returns {{ newWinnerElo: number, newLoserElo: number }} The new Elo ratings.
 */
function calculateEloChange(winnerElo, loserElo, kFactor = K_FACTOR) {
  const expectedWinnerScore = calculateExpectedScore(winnerElo, loserElo);
  const expectedLoserScore = calculateExpectedScore(loserElo, winnerElo);

  const newWinnerElo = Math.round(winnerElo + kFactor * (1 - expectedWinnerScore));
  const newLoserElo = Math.round(loserElo + kFactor * (0 - expectedLoserScore));

  return { newWinnerElo, newLoserElo };
}

module.exports = { calculateEloChange }; 