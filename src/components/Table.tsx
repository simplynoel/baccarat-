import { useState, useCallback } from "react"
import "./Table.css"
import Card from "./Card"

interface CardType {
  suit: string;
  value: string;
  numericValue: number;
}

interface GameState {
  playerCards: CardType[];
  bankerCards: CardType[];
  playerScore: number;
  bankerScore: number;
  gameResult: string;
  isGameActive: boolean;
  playerBet: number;
  bankerBet: number;
  tieBet: number;
  balance: number;
}

const Table = () => {
  const [gameState, setGameState] = useState<GameState>({
    playerCards: [],
    bankerCards: [],
    playerScore: 0,
    bankerScore: 0,
    gameResult: "",
    isGameActive: false,
    playerBet: 0,
    bankerBet: 0,
    tieBet: 0,
    balance: 1000
  });
  const [isDealing, setIsDealing] = useState(false);

  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const createDeck = (): CardType[] => {
    const deck: CardType[] = [];
    suits.forEach(suit => {
      values.forEach((value, index) => {
        let numericValue = index + 1;
        if (numericValue > 10) numericValue = 0;
        if (numericValue === 1) numericValue = 1;
        deck.push({ suit, value, numericValue });
      });
    });
    return shuffleDeck(deck);
  };

  const shuffleDeck = (deck: CardType[]): CardType[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const calculateScore = (cards: CardType[]): number => {
    const total = cards.reduce((sum, card) => sum + card.numericValue, 0);
    return total % 10;
  };

  const placeBet = (betType: 'player' | 'banker' | 'tie', amount: number) => {
    if (gameState.isGameActive || gameState.balance < amount) return;
    
    setGameState(prev => ({
      ...prev,
      [betType + 'Bet']: prev[betType + 'Bet' as keyof GameState] as number + amount,
      balance: prev.balance - amount
    }));
  };

  const dealCards = useCallback(async () => {
    if (gameState.playerBet === 0 && gameState.bankerBet === 0 && gameState.tieBet === 0) {
      alert("Please place a bet first!");
      return;
    }

    setIsDealing(true);
    setGameState(prev => ({ ...prev, playerCards: [], bankerCards: [], gameResult: "" }));

    const deck = createDeck();
    let cardIndex = 0;

    const initialCards = {
      player: [deck[cardIndex++], deck[cardIndex++]],
      banker: [deck[cardIndex++], deck[cardIndex++]]
    };

    await new Promise(resolve => setTimeout(resolve, 500));
    setGameState(prev => ({ ...prev, playerCards: [initialCards.player[0]] }));

    await new Promise(resolve => setTimeout(resolve, 700));
    setGameState(prev => ({ ...prev, bankerCards: [initialCards.banker[0]] }));

    await new Promise(resolve => setTimeout(resolve, 700));
    setGameState(prev => ({ ...prev, playerCards: initialCards.player }));

    await new Promise(resolve => setTimeout(resolve, 700));
    setGameState(prev => ({ ...prev, bankerCards: initialCards.banker }));

    let playerCards = initialCards.player;
    let bankerCards = initialCards.banker;
    let playerScore = calculateScore(playerCards);
    let bankerScore = calculateScore(bankerCards);

    setGameState(prev => ({ ...prev, playerScore, bankerScore }));

    const playerNatural = playerScore >= 8;
    const bankerNatural = bankerScore >= 8;

    if (!playerNatural && !bankerNatural) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (playerScore <= 5) {
        await new Promise(resolve => setTimeout(resolve, 800));
        playerCards.push(deck[cardIndex++]);
        setGameState(prev => ({ ...prev, playerCards: [...playerCards] }));
        playerScore = calculateScore(playerCards);
      }

      const playerThirdCard = playerCards[2]?.numericValue || null;
      let bankerDraws = false;

      if (bankerScore <= 2) {
        bankerDraws = true;
      } else if (bankerScore === 3 && playerThirdCard !== 8) {
        bankerDraws = true;
      } else if (bankerScore === 4 && playerThirdCard !== null && [2, 3, 4, 5, 6, 7].includes(playerThirdCard)) {
        bankerDraws = true;
      } else if (bankerScore === 5 && playerThirdCard !== null && [4, 5, 6, 7].includes(playerThirdCard)) {
        bankerDraws = true;
      } else if (bankerScore === 6 && playerThirdCard !== null && [6, 7].includes(playerThirdCard)) {
        bankerDraws = true;
      }

      if (bankerDraws) {
        await new Promise(resolve => setTimeout(resolve, 800));
        bankerCards.push(deck[cardIndex++]);
        setGameState(prev => ({ ...prev, bankerCards: [...bankerCards] }));
        bankerScore = calculateScore(bankerCards);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    let result = "";
    let winnings = 0;

    if (playerScore > bankerScore) {
      result = "Player Wins!";
      winnings += gameState.playerBet * 2;
    } else if (bankerScore > playerScore) {
      result = "Banker Wins!";
      winnings += gameState.bankerBet * 1.95;
    } else {
      result = "It's a Tie!";
      winnings += gameState.tieBet * 9;
      winnings += gameState.playerBet + gameState.bankerBet;
    }

    setGameState(prev => ({
      ...prev,
      playerScore,
      bankerScore,
      gameResult: result,
      isGameActive: true,
      balance: prev.balance + winnings
    }));

    setIsDealing(false);
  }, [gameState.playerBet, gameState.bankerBet, gameState.tieBet, gameState.balance]);

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      playerCards: [],
      bankerCards: [],
      playerScore: 0,
      bankerScore: 0,
      gameResult: "",
      isGameActive: false,
      playerBet: 0,
      bankerBet: 0,
      tieBet: 0
    }));
  };

  return (
    <div className="container">
      <div className="table">
        <div className="table-header">
          <h1>Baccarat</h1>
          <div className="balance">Balance: ${gameState.balance}</div>
        </div>
        
        <div className="betting-area">
          <div className="bet-section">
            <h3>Player</h3>
            <div className="bet-amount">${gameState.playerBet}</div>
            <button onClick={() => placeBet('player', 25)} disabled={gameState.isGameActive}>$25</button>
            <button onClick={() => placeBet('player', 50)} disabled={gameState.isGameActive}>$50</button>
            <button onClick={() => placeBet('player', 100)} disabled={gameState.isGameActive}>$100</button>
          </div>
          
          <div className="bet-section">
            <h3>Tie</h3>
            <div className="bet-amount">${gameState.tieBet}</div>
            <button onClick={() => placeBet('tie', 25)} disabled={gameState.isGameActive}>$25</button>
            <button onClick={() => placeBet('tie', 50)} disabled={gameState.isGameActive}>$50</button>
            <button onClick={() => placeBet('tie', 100)} disabled={gameState.isGameActive}>$100</button>
          </div>
          
          <div className="bet-section">
            <h3>Banker</h3>
            <div className="bet-amount">${gameState.bankerBet}</div>
            <button onClick={() => placeBet('banker', 25)} disabled={gameState.isGameActive}>$25</button>
            <button onClick={() => placeBet('banker', 50)} disabled={gameState.isGameActive}>$50</button>
            <button onClick={() => placeBet('banker', 100)} disabled={gameState.isGameActive}>$100</button>
          </div>
        </div>

        <div className="table-body">   
          <div className="player-hand">
            <h2>Player's Hand</h2>
            <div className={`cards ${isDealing ? 'dealing' : ''}`}>
              {gameState.playerCards.map((card, index) => (
                <Card 
                  key={index} 
                  suit={card.suit} 
                  value={card.value}
                  className={`card-deal-animation deal-delay-${index * 2}`}
                />
              ))}
            </div>
            <div className="score">
              <h3>Score: {gameState.playerScore}</h3>
            </div>
          </div>
          
          <div className="game-result">
            {gameState.gameResult && (
              <div className="result-display">
                <h2>{gameState.gameResult}</h2>
              </div>
            )}
          </div>
          
          <div className="banker-hand">
            <h2>Banker's Hand</h2>
            <div className={`cards ${isDealing ? 'dealing' : ''}`}>
              {gameState.bankerCards.map((card, index) => (
                <Card 
                  key={index} 
                  suit={card.suit} 
                  value={card.value}
                  className={`card-deal-animation deal-delay-${index * 2 + 1}`}
                />
              ))}
            </div>
            <div className="score">
              <h3>Score: {gameState.bankerScore}</h3>
            </div>
          </div>
        </div>
        
        <div className="controls">
          <button 
            className={`deal-button ${isDealing ? 'dealing' : ''}`}
            onClick={dealCards}
            disabled={gameState.isGameActive || isDealing || (gameState.playerBet === 0 && gameState.bankerBet === 0 && gameState.tieBet === 0)}
          >
            Deal Cards
          </button>
          <button className="reset-button" onClick={resetGame}>New Round</button>
        </div>
        
        <div className="table-footer">
          <h3>© 2025 Baccarat Game create by Noel P</h3>
        </div>
      </div>  
    </div>
  )
}

export default Table