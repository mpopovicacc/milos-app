import { useEffect, useState } from 'react';
import './App.css';

const cImages = ['C1.png', 'C2.png', 'C3.png', 'C4.png'];
const sImages = ['S1.png', 'S2.png', 'S3.png', 'S4.png'];
const eImages = ['E1.png', 'E2.png', 'E3.png', 'E4.png'];
const rImages = ['R1.png', 'R2.png', 'R3.png', 'R4.png'];

const threshold = 0;

function App() {
  const [image, setImage] = useState('splash.png');
  const [showSplash, setShowSplash] = useState(true);
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerStarted, setTimerStarted] = useState(false);
  const [countup, setCountup] = useState(0);
  const [currentState, setCurrentState] = useState('C');
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [rCountdown, setRCountdown] = useState(null);
  const [runActive, setRunActive] = useState(false);
	const [isCtrlPressed, setIsCtrlPressed] = useState(false);
	const [ctrlPressDuration, setCtrlPressDuration] = useState(0);


useEffect(() => {
  if (isCtrlPressed) {
    const interval = setInterval(() => {
      setCtrlPressDuration(prev => prev + 100);
    }, 100);

    return () => clearInterval(interval);
  }
}, [isCtrlPressed]);

useEffect(() => {
  if (ctrlPressDuration > 1000 && currentState === 'E') { // If long press detected in E state
    setCurrentState('S');
    setImage(sImages[0]);
    setIndex(0);
  }
}, [ctrlPressDuration, currentState]);

useEffect(() => {
  if (currentState === 'R' && runActive && rCountdown !== null && rCountdown > 0) {
    const interval = setInterval(() => {
      setRCountdown(prev => {
		if (prev <= 1) {
		  clearInterval(interval);
		  // Reset everything back to C1
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
    }, 10); // 0.18 seconds

    return () => clearInterval(interval);
  }
}, [currentState, runActive, rCountdown]);



  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      setImage(cImages[0]);
      setTimerStarted(true);
    }, 1000);

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (timerStarted) {
      const countdown = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === threshold || prev === 1) {
            clearInterval(countdown);
            setTimerStarted(false);
          }

          if (prev === threshold) {
            setImage(sImages[0]);
            setCurrentState('S');
            setIndex(0);
          }

          if (prev === 1) {
            setTimeoutReached(true);
            setImage(eImages[0]);
            setCurrentState('E');
            setIndex(0);
          }

          return prev > 0 ? prev - 1 : 0;
        });
      }, 1000);

      const countupTimer = setInterval(() => {
        setCountup(prev => prev + 1);
      }, 1230);

      return () => {
        clearInterval(countdown);
        clearInterval(countupTimer);
      };
    }
  }, [timerStarted]);
const handleCtrlMouseDown = () => {
  setIsCtrlPressed(true);
  setCtrlPressDuration(0);
};

const handleCtrlMouseUp = () => {
  setIsCtrlPressed(false);
  if (ctrlPressDuration < 1000) { // less than 1 second, regular click
    handleCtrlClick();
  }
};

const handleCtrlClick = () => {
  let nextIndex;
  if (currentState === 'C') {
    nextIndex = (index + 1) % cImages.length;
    setImage(cImages[nextIndex]);
  } else if (currentState === 'S') {
    nextIndex = (index + 1) % sImages.length;
    setImage(sImages[nextIndex]);
  } else if (currentState === 'E') {
    nextIndex = (index + 1) % eImages.length;
    setImage(eImages[nextIndex]);
  } else if (currentState === 'R') {
    nextIndex = (index + 1) % rImages.length;
    setImage(rImages[nextIndex]);
  }
  setIndex((index + 1) % 4);
};


  const handleCrpClick = () => {
    if (currentState === 'C') {
      setTimerStarted(false);
      setTimeLeft(0);
      setImage(sImages[0]);
      setCurrentState('S');
      setIndex(0);
    }
  };
const handleRunClick = () => {
  if (!runActive) {
    // Starting RUN mode
    setTimerStarted(false);
    setTimeLeft(0);
    setCountup(0);
    setImage(rImages[0]);
    setCurrentState('R');
    setIndex(0);
    if (rCountdown === null) setRCountdown(872); // only reset on first RUN
    setRunActive(true);
  } else {
    // Pausing RUN mode (stop countdown)
    setRunActive(false);
    setImage(sImages[0]);
    setCurrentState('S');
    setIndex(0);
  }
};






  return (
    <div className="container">
<div className="left-buttons">
			  <button className="side-button" onClick={handleRunClick} disabled={currentState !== 'S' && currentState !== 'R'}>
				{runActive ? 'STOP' : 'RUN'}
			  </button>
			<button className="side-button" onClick={handleCrpClick}>Done Creep</button>
			<button className="side-button">Error</button>
</div>
      <div className="box">
        <img src={image} className="box-image" alt="Display" />
{currentState === 'R' && rCountdown !== null && (
<div className={`r-countdown-label ${image === 'R1.png' ? 's1' : image === 'R2.png' ? 's2' : image === 'R3.png' ? 's3' : 's4'}`}>

    {rCountdown}
  </div>
)}


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
    {/* Adding the ButtonPic.png here */}
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