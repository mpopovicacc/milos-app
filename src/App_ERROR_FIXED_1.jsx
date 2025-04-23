import { useEffect, useState } from 'react';
import './App.css';

// Image arrays for different states
const cImages = ['C1.png', 'C2.png', 'C3.png', 'C4.png'];
const sImages = ['S1.png', 'S2.png', 'S3.png', 'S4.png'];
const eImages = ['E1.png', 'E2.png', 'E3.png', 'E4.png'];
const rImages = ['R1.png', 'R2.png', 'R3.png', 'R4.png'];

const threshold = 0;

function App() {
  // Application state
  const [image, setImage] = useState('splash.png'); // Current image displayed
  const [showSplash, setShowSplash] = useState(true); // Splash screen toggle
  const [index, setIndex] = useState(0); // Current image index in a state
  const [timeLeft, setTimeLeft] = useState(20); // Countdown timer for C state
  const [timerStarted, setTimerStarted] = useState(false); // Whether the timer is active
  const [countup, setCountup] = useState(0); // Elapsed time shown in C state
  const [currentState, setCurrentState] = useState('C'); // Current mode: C, S, E, R
  const [timeoutReached, setTimeoutReached] = useState(false); // Whether countdown hit 0
  const [rCountdown, setRCountdown] = useState(null); // Countdown value in R mode
  const [runActive, setRunActive] = useState(false); // RUN mode toggle
  const [isCtrlPressed, setIsCtrlPressed] = useState(false); // Ctrl mouse press state
  const [ctrlPressDuration, setCtrlPressDuration] = useState(0); // How long Ctrl is held
  const [isInEState, setIsInEState] = useState(false); // Whether we are locked in E state
  const [ctrlPressed, setCtrlPressed] = useState(false); // Not currently used
  
  const handleErrorClick = () => {
  // Check if we're in any RUN state and handle accordingly
  if (runActive) {
    // Enter E1 without affecting the RUN state
    enterE1State();
  } else {
    // If not in RUN state, just enter E1 normally
    enterE1State();
  }
};

const enterE1State = () => {
  // Prevent entering E1 state again if already in E1 state
  if (currentState === 'E') return;

  setImage(eImages[0]);    // Set to E1 image
  setCurrentState('E');     // Change to E state
  setIndex(0);              // Reset index to 0 (E1)
  setIsInEState(true);      // Lock into E state (prevents exiting easily)
  setTimerStarted(false);   // Stop any countdowns or timers

  // When in RUN state, don't exit it, just enter E1 image
  if (runActive) {
    // We keep the RUN state active and show E1 state image
    setImage(eImages[0]); // Enter the Error state visually (E1)
  }
};





  // === EFFECTS ===

  // Automatically switch to E1 if countdown hits 0 while in C
  useEffect(() => {
    if (rCountdown === 0 && currentState === 'C') {
      setCurrentState('E1');  // Invalid state - maybe a bug or test hook
    }
  }, [rCountdown, currentState]);

  // Track Ctrl press duration in real time
  useEffect(() => {
    let interval;
    if (isCtrlPressed) {
      interval = setInterval(() => {
        setCtrlPressDuration(prev => prev + 100);
      }, 100);
    } else {
      setCtrlPressDuration(0); // Reset immediately
    }
    return () => clearInterval(interval);
  }, [isCtrlPressed]);

  // If Ctrl is held more than 1s in E, reset back to C1
  useEffect(() => {
    if (
      isInEState &&
      currentState === 'E' &&
      isCtrlPressed &&
      ctrlPressDuration > 1000
    ) {
      setIsInEState(false);
      setImage(cImages[0]);
      setCurrentState('C');
      setIndex(0);
      setTimeLeft(20);
      setCountup(0);
      setTimerStarted(true);
    }
  }, [ctrlPressDuration, currentState, isCtrlPressed, isInEState]);

  // R mode countdown animation logic
  useEffect(() => {
    if (currentState === 'R' && runActive && rCountdown !== null && rCountdown > 0) {
      const interval = setInterval(() => {
        setRCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            // Reset to C1 state after RUN finishes
            setImage(cImages[0]);
            setCurrentState('C');
            setIndex(0);
            setTimeLeft(20);
            setCountup(0);
            setTimerStarted(true);
            setRunActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 180); // ~24 FPS

      return () => clearInterval(interval);
    }
  }, [currentState, runActive, rCountdown]);

  // Splash screen delay logic
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      setImage(cImages[0]);
      setTimerStarted(true);
    }, 1000);

    return () => clearTimeout(splashTimer);
  }, []);

  // C-mode countdown and count-up timer logic
  useEffect(() => {
    if (!timerStarted || isInEState) return;

    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (isInEState) return prev;

        if (prev === threshold) {
          setImage(sImages[0]);
          setCurrentState('S');
          setIndex(0);
        }

        if (prev <= 1) {
          setTimeoutReached(true);
          setImage(eImages[0]);
          setCurrentState('E');
          setIndex(0);
          setIsInEState(true);    // Lock E state
          setTimerStarted(false); // Stop the countdown
          return 0;
        }

        return prev > 0 ? prev - 1 : 0;
      });
    }, 150); // C-mode timer

    const countupTimer = setInterval(() => {
      setCountup(prev => prev + 1);
    }, 1730); // Elapsed counter

    return () => {
      clearInterval(countdown);
      clearInterval(countupTimer);
    };
  }, [timerStarted, isInEState]);

  // === HANDLERS ===

  // Handle press/release on Ctrl button
  const handleCtrlMouseDown = () => {
    setIsCtrlPressed(true);
    setCtrlPressDuration(0);
  };

  const handleCtrlMouseUp = () => {
    setIsCtrlPressed(false);
    if (ctrlPressDuration < 1000) {
      handleCtrlClick(); // Regular click behavior
    }
  };

  // Ctrl click to cycle through state images
  const handleCtrlClick = () => {
    if (isInEState) return; // Block input while in E state

    let nextIndex;
    if (currentState === 'C') {
      nextIndex = (index + 1) % cImages.length;
      setImage(cImages[nextIndex]);
    } else if (currentState === 'S') {
      nextIndex = (index + 1) % sImages.length;
      setImage(sImages[nextIndex]);
    } else if (currentState === 'R') {
      nextIndex = (index + 1) % rImages.length;
      setImage(rImages[nextIndex]);
    }
    setIndex((index + 1) % 4);
  };

  // Manually skip to S state from C
  const handleCrpClick = () => {
    if (currentState === 'C') {
      setTimerStarted(false);
      setTimeLeft(0);
      setImage(sImages[0]);
      setCurrentState('S');
      setIndex(0);
    }
  };

  // Handle RUN button logic: toggles R mode on/off
  const handleRunClick = () => {
    if (!runActive) {
      setTimerStarted(false);
      setTimeLeft(0);
      setCountup(0);
      setImage(rImages[0]);
      setCurrentState('R');
      setIndex(0);
      if (rCountdown === null) setRCountdown(872); // Set once
      setRunActive(true);
    } else {
      // Stop RUN, go back to C1
      setRunActive(false);
      setImage(cImages[0]);
      setCurrentState('C');
      setIndex(0);
      setTimeLeft(20);
      setCountup(0);
      setTimerStarted(true);
    }
  };

  // === RENDER ===

  return (
    <div className="container">
      <div className="left-buttons">
        <button className="side-button" onClick={handleRunClick} disabled={currentState !== 'S' && currentState !== 'R'}>
          {runActive ? 'STOP' : 'RUN'}
        </button>
        <button className="side-button" onClick={handleCrpClick}>Done Creep</button>
<button className="side-button" onClick={handleErrorClick}>Error</button>

      </div>

      <div className="box">
        <img src={image} className="box-image" alt="Display" />

        {/* Show R countdown number in corner with dynamic class */}
        {rCountdown !== null && (
          <div className={
            `countdown-label ` + (
              currentState === 'C' && `c-state-countdown-${index + 1}` ||
              currentState === 'S' && `s-state-countdown-${index + 1}` ||
              currentState === 'E' && `e-state-countdown-${index + 1}` ||
              currentState === 'R' && `r-countdown-label s${index + 1}`
            )
          }>
            {rCountdown}
          </div>
        )}

        {/* Progress and elapsed labels (only in C mode) */}
        {!showSplash && currentState === 'C' && (
          <>
            <div className="countup-label">{countup}'</div>
            <div className="progress-bar-container">
              {[...Array(20)].map((_, idx) => (
                <div
                  key={idx}
                  className="progress-bar-segment"
                  style={{
                    backgroundColor: idx < timeLeft ? 'green' : 'black',
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="side-image-container">
        <img src="/BtnPic.png" className="side-image" alt="Button Image" />
      </div>

      <button 
        className="side-button right-button" 
        onMouseDown={handleCtrlMouseDown}
        onMouseUp={handleCtrlMouseUp}
      >
        Ctrl
      </button>
    </div>
  );
}

export default App;
