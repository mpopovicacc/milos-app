{/* 
  This app shows a screen with pictures and buttons. It starts with a welcome screen, then shows a picture from a set called 'C'. 
  A timer counts down from 20 seconds. You can press buttons to change the picture or switch to different sets of pictures ('C', 'S', 'E', 'R'). 
  - The "Ctrl" button lets you flip through pictures in the current set.
  - The "Done Creep" button moves you from the 'C' set to the 'S' set.
  - The "Error" button takes you to the 'E' set.
  - The "Run/Stop" button starts or stops a special mode with the 'R' set.
  If you're in the 'E' set and hold the "Ctrl" button for more than 1 second, it takes you back to the 'C' set.
  There's also a bar showing how much time is left and a number counting up how long you've been on the screen.
*/}

// Importing React hooks for state management and side effects
import React, { useState, useEffect, useRef } from 'react'; // Import React and hooks together
import FPSInput from './FPSInput'; // Import the FPSInput component
import './App.css'; // Keep your CSS import

// Now you can use `useEffect`, `useState`, and `useRef` without conflicts

// Define arrays of image paths for different states (C, S, E, R)
// Each array contains 4 images corresponding to different stages in each state
const cImages = ['C1.png', 'C2.png', 'C3.png', 'C4.png']; // Images for 'C' state
const sImages = ['S1.png', 'S2.png', 'S3.png', 'S4.png']; // Images for 'S' state
const eImages = ['E1.png', 'E2.png', 'E3.png', 'E4.png']; // Images for 'E' state
const rImages = ['R1.png', 'R2.png', 'R3.png', 'R4.png']; // Images for 'R' state

// Define a threshold constant for the timer (used to determine when to transition states)
const threshold = 0;



// Main React component for the application
function App() {
  // State variables using the useState hook to manage the app's dynamic behavior
  const [image, setImage] = useState('splash.png'); // Tracks the currently displayed image, starts with a splash screen
  const [showSplash, setShowSplash] = useState(true); // Controls whether the splash screen is visible
  const [doneWSplash, setdoneWSplash] = useState(false); // 
  const [index, setIndex] = useState(0); // Tracks the current index of the image array for the active state
  const [timeLeft, setTimeLeft] = useState(20); // Represents the remaining time for the 'C' state timer (starts at 20 seconds)
  const [timerStarted, setTimerStarted] = useState(false); // Flag to control whether the main timer is running
  const [countup, setCountup] = useState(0); // Tracks elapsed time in seconds (countup timer)
  const [currentState, setCurrentState] = useState('C'); // Tracks the current state of the app ('C', 'S', 'E', 'R', or 'E1')
  const [timeoutReached, setTimeoutReached] = useState(false); // Indicates if the timer has reached the threshold
  const [rCountdown, setRCountdown] = useState(null); // Countdown timer for the 'R' (Run) state, starts as null
  const [bComingOutOfELong, setbComingOutOfELong] = useState(false); // Countdown timer for the 'R' (Run) state, starts as null
  const [runActive, setRunActive] = useState(false); // Flag to indicate if the 'Run' mode is active
  const [isCtrlPressed, setIsCtrlPressed] = useState(false); // Tracks if the Ctrl button is currently pressed
  const [ctrlPressDuration, setCtrlPressDuration] = useState(0); // Measures how long the Ctrl button has been pressed (in milliseconds)
  const [isInEState, setIsInEState] = useState(false); // Tracks if the app is locked in the 'E' (Error) state
  const [ctrlPressed, setCtrlPressed] = useState(false); // Flag to detect if the Ctrl button was pressed (not actively used in the code)
  const [isLongCtrlPressed, setIsLongCtrlPressed] = useState(false); // Tracks if the Ctrl button is currently pressed

  const timerRef = useRef(null);
  const longCtrlPressTriggeredRef = useRef(false);
  const pressCtrlStartTimeRef = useRef(null);
  const [pressStatus, setPressStatus] = useState("CTRL Off");
  const intervalRef = useRef(null);
  const ctrlIntervalRef = useRef(null);
  const [fps, setFps] = useState(24);

  const handleFPSChange = (e) => {
    setFps(e.target.value);
  };
    // Function to retrieve the current FPS value
  const getFPS = () => {
    return fps;
  };
/*   const getCountdownClassName = () => {
  if (rCountdown === null) return ''; // No countdown to show
 */

    const getCountdownClassName = () => {
  if (rCountdown === null) return 'r-countdown-label-1';
  /* const clamped = Math.max(0, Math.min(rCountdown, 3));
   return ['r-countdown-label-1', 'r-countdown-label s2', 'r-countdown-label s3', 'r-countdown-label s4'][clamped];  */


  
  

  
  
  
  
  
  
  
  
  
  

  const stateImageClassMap = {
    'C': {
      'C1.png': 'c-state-countdown-1',
      'C2.png': 'c-state-countdown-2',
      'C3.png': 'c-state-countdown-3',
      'C4.png': 'c-state-countdown-4',
    },
    'S': {
      'S1.png': 's-state-countdown-1',
      'S2.png': 's-state-countdown-2',
      'S3.png': 's-state-countdown-3',
      'S4.png': 's-state-countdown-4',
    },
    'E': {
      'E1.png': 'e-state-countdown-1',
      'E2.png': 'e-state-countdown-2',
      'E3.png': 'e-state-countdown-3',
      'E4.png': 'e-state-countdown-4',
    },
    'R': {
      'R1.png': 'r-countdown-label s1',
      'R2.png': 'r-countdown-label s2',
      'R3.png': 'r-countdown-label s3',
      'R4.png': 'r-countdown-label s4',
    }
  };

  return stateImageClassMap[currentState] && stateImageClassMap[currentState][image] || '';
};

  const renderDebugStatusBox = () => {
  if (!pressStatus) return null;

return (
  <div>
    <div className="debug-status-box">
      Click CTRL button to cycle through pages<br />
      Long Click CTRL button for &gt; 2 Sec CTRL button to exit Error state<br /><br />
      CTRL Btn State: {pressStatus} <br />
      Magazine State: {currentState.toString()}<br />
      Pressing for: {(ctrlPressDuration / 1000).toFixed(2)}s<br />
	  Current: {getFPS().toString()}<br />
	  CountdownClassName: {getCountdownClassName().toString()}
    </div>

  </div>
);

};

const renderCreepProgressBar = () => {
  if (showSplash || currentState !== 'C') return null;

  return (
    <>
      {/* Display the countup timer value (in seconds)}
      <div className="countup-label">{countup}'</div>

      {/* Progress bar to visualize the time left */}
      <div className="progress-bar-container">
        {[...Array(20)].map((_, idx) => (
          <div
            key={idx}
            className="progress-bar-segment"
            className="progress-bar-segment"
            style={{
              backgroundColor: idx < timeLeft ? '#003300' : '#000000'
            }}
          />
        ))}
      </div>
    </>
  );
};

const renderCtrlProgressBar = () => {
  if (currentState !== 'E' || pressStatus !== "Pressing...") return null;

  const depletedSegments = Math.floor(ctrlPressDuration / 100) * 1;
  const remainingSegments = 20 - depletedSegments;

return (
  <>
    {ctrlPressDuration / 1000 > 0.2 && (
      <div className="progress-bar-container">
        {[...Array(20)].map((_, idx) => (
          <div
            key={idx}
            className="progress-bar-segment"
            style={{
              backgroundColor: idx < remainingSegments ? '#222222' : '#000000'
            }}
          />
        ))}
      </div>
    )}
  </>
);
};

  const LongCtrlPressDetected = () => {
    /* console.log('Long press detected!'); */
    setCtrlPressDuration(2001)
	//setIsCtrlPressed(true);
	setIsLongCtrlPressed(true);
	setPressStatus("Long Press Detected!");
		
  };
    const ShortCtrlPressDetected = () => {
       setPressStatus("Short Press Detected!");
	  // setIsCtrlPressed(true);
    handleCtrlClick();
	
  };
  // useEffect Hook 1: Transition from 'C' state to 'E1' state when rCountdown reaches 0
  // useEffect is a React hook that runs side effects (like timers or state updates) after rendering
  useEffect(() => {
    // Check if the countdown for the 'R' state has reached 0 and the current state is 'C'
    if (rCountdown === 0 && currentState === 'C') {
      // Transition to the 'E1' state (a specific error state)
      setCurrentState('E1');
    }
  }, [rCountdown, currentState]); // Dependencies: this effect runs whenever rCountdown or currentState changes
 /****************************************************************************************/
/****************************************************************************************/
/****************************************************************************************/ 
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);
/****************************************************************************************/
/****************************************************************************************/
/****************************************************************************************/
  // useEffect Hook 2: Track the duration of the Ctrl button press
  useEffect(() => {
    // Declare a variable to hold the interval ID (for cleanup later)
    let interval;
    // If the Ctrl button is pressed, start measuring the duration
    if (isCtrlPressed) {
      // Set up an interval that increments ctrlPressDuration by 100ms every 100ms
      interval = setInterval(() => {
        setCtrlPressDuration(prev => prev + 100); // Increment the duration
      }, 100); // Runs every 100 milliseconds
    } else {
      // If Ctrl is not pressed, reset the duration immediately
      setCtrlPressDuration(0);
    } 
    // Cleanup: clear the interval when the component unmounts or when isCtrlPressed changes
    return () => clearInterval(interval);
  }, [isCtrlPressed]); // Dependency: this effect runs whenever isCtrlPressed changes
/****************************************************************************************/
/****************************************************************************************/
/****************************************************************************************/
  // useEffect Hook 3: Handle long Ctrl press in the 'E' state to return to 'C' state
  useEffect(() => {
    // Check if the app is in the 'E' state, currentState is 'E', Ctrl is pressed, and the press duration exceeds 1 second
    if (isInEState && currentState === 'E' && isLongCtrlPressed && ctrlPressDuration > 1500) {
      // Exit the 'E' state
      setIsInEState(false);
      // Reset the image to the first 'C' state image (C1.png)
      setImage(cImages[0]);
      // Transition back to the 'C' state
      setCurrentState('C');
      // Reset the image index to 0
      setIndex(0);
      // Reset the time left to 20 seconds
      setTimeLeft(20);
      // Reset the countup timer to 0
      setCountup(0);
      // Start the main timer again
      setTimerStarted(true);

	  //setCtrlPressDuration(100);
    }else if ((currentState === 'C' || currentState === 'S') && (isCtrlPressed && ctrlPressDuration > 1000 && doneWSplash === true )){
		  setRCountdown(990); // Set rCountdown to 990 after splash screen
	}
  }, [ctrlPressDuration, currentState, isCtrlPressed, isInEState]); // Dependencies: runs when these values change
/****************************************************************************************/
/****************************************************************************************/
/****************************************************************************************/
  // useEffect Hook 4: Manage the countdown timer in the 'R' (Run) state
useEffect(() => {
  if (currentState === 'R' && runActive) {
    const interval = setInterval(() => {
      setRCountdown(prev => {
        if (prev === 0) {
          clearInterval(interval);
          // Reset everything back to 'C' state and initial values
/*           setImage(cImages[0]);     // Reset image
          setCurrentState('C');     // Switch state to 'C'
          setIndex(0);              // Reset index
          setTimeLeft(20);          // Reset timer
          setCountup(0);            // Reset countup
          setTimerStarted(true);    // Restart timer */
          return 0;
        }
        return prev - 1;
      });
    }, 1000 * 4.25 / fps); // use current FPS directly

    return () => clearInterval(interval);
  }
}, [currentState, runActive, fps]); // FPS included here

/****************************************************************************************/
/****************************************************************************************/
/****************************************************************************************/
  // useEffect Hook 5: Handle the splash screen timeout
  useEffect(() => {
    // Set a timeout to hide the splash screen after 1 second (1000ms)
    const splashTimer = setTimeout(() => {
      // Hide the splash screen
      setShowSplash(false);
      // Set the initial image to the first 'C' state image (C1.png)
      setImage(cImages[0]);
      // Start the main timer
      setTimerStarted(true);
	  
	  setRCountdown(990); // Set rCountdown to 990 after splash screen
	  setdoneWSplash(true);
    }, 1000);
    // Cleanup: clear the timeout when the component unmounts
    return () => clearTimeout(splashTimer);
  }, []); // Empty dependency array: this effect runs only once when the component mounts
/****************************************************************************************/
/****************************************************************************************/
/****************************************************************************************/
  // useEffect Hook 6: Manage the countdown and countup timers for the 'C' state
  useEffect(() => {
    // If the timer hasn't started or the app is in the 'E' state, exit early
    if (!timerStarted || isInEState) return;

    // Set up a countdown timer that decreases timeLeft every 150ms - CREEP TIMEOUT
 const countdown = setInterval(() => {
      setTimeLeft(prev => {
        // If the app enters the 'E' state, stop the countdown
        if (isInEState) return prev;

        // If timeLeft reaches the threshold (0), transition to the 'S' state
        if (prev === threshold) {
          setImage(sImages[0]);
          setCurrentState('S');
          setIndex(0);
        }

        // If timeLeft reaches 1 or less, transition to the 'E' state
        if (prev <= 1) {
          setTimeoutReached(true);
          setImage(eImages[0]);
          setCurrentState('E');
          setIndex(0);
          setIsInEState(true); // Lock into the 'E' state
          setTimerStarted(false); // Stop the timer
          return 0;
        }

        // Decrease timeLeft by 1, but don't go below 0
        return prev > 0 ? prev - 1 : 0;
      });
 }, 1000); // Interval runs every 1000mS x 20 - CREEP TIMEOUT

    // Set up a countup timer that increments every 1730ms (1.73 seconds)
    const countupTimer = setInterval(() => {
      setCountup(prev => prev + 1);
    }, 1730);

    // Cleanup: clear both intervals when the component unmounts or dependencies change
    return () => {
      clearInterval(countdown);
      clearInterval(countupTimer);
    };
  }, [timerStarted, isInEState]); // Dependencies: runs when these values change
/****************************************************************************************/
/****************************************************************************************/
/****************************************************************************************/
  // Handler function: Called when the Ctrl button is pressed down
const handleCtrlMouseDown = (event) => {
  event.preventDefault(); // Prevent unintended browser behavior
  pressCtrlStartTimeRef.current = Date.now(); // Store press start time
  longCtrlPressTriggeredRef.current = false; // Reset flag
  setPressStatus("Pressing...");

  // Start updating visible duration
  intervalRef.current = setInterval(() => {
    const elapsed = Date.now() - pressCtrlStartTimeRef.current;
    setCtrlPressDuration(elapsed);
  }, 100);

	ctrlIntervalRef.current = setInterval(() => {
	  const elapsed = Date.now() - pressCtrlStartTimeRef.current;
	  setCtrlPressDuration(elapsed);
	}, 100);
  timerRef.current = setTimeout(() => {
    if (!longCtrlPressTriggeredRef.current) {
      LongCtrlPressDetected();
      longCtrlPressTriggeredRef.current = true;
    }
  }, 2000);
};


  // Handler function: Called when the Ctrl button is released
const handleCtrlMouseUp = () => {
	
	//Deal with 100mS timer
	clearInterval(ctrlIntervalRef.current);
	ctrlIntervalRef.current = null;
	setCtrlPressDuration(0); // Reset display
	//**************Deal with 100mS timer

  setCtrlPressDuration(0);
  setIsLongCtrlPressed(false); // Reset Long-Press

  const pressDuration = Date.now() - pressCtrlStartTimeRef.current;

  clearTimeout(timerRef.current);
  clearInterval(intervalRef.current); // Clear the live interval here too
  timerRef.current = null;
  intervalRef.current = null;

  if (pressDuration < 500) {
    ShortCtrlPressDetected();
  } else {
    setPressStatus("CTRL Off"); // Reset state after release	  
  }
};


  // Handler function: Handles a regular Ctrl click (less than 1 second)
  const handleCtrlClick = () => {
    // Determine which image array to use based on the current state
    let images;
	setbComingOutOfELong(false); //NOT LONG PRESS
    if (currentState === 'C') images = cImages;  
    else if (currentState === 'S') images = sImages;
    else if (currentState === 'R') images = rImages;
    else if (currentState === 'E') images = eImages;

    // If an image array is found, cycle to the next image in the array
    if (images) {
      // Calculate the next index, looping back to 0 if at the end of the array
      const nextIndex = (index + 1) % images.length;
      setIndex(nextIndex);
      setImage(images[nextIndex]);
    }
  };

  // Handler function: Handles clicking the "Error" button to enter the 'E' state
  const handleErrorClick = () => {
    // Indicate that the timeout has been reached
    setTimeoutReached(true);
    // Set the image to the first 'E' state image (E1.png)
    setImage(eImages[0]);
    // Transition to the 'E' state
    setCurrentState('E');
    // Reset the image index to 0
    setIndex(0);
    // Lock the app into the 'E' state
    setIsInEState(true);
    // Stop the main timer
    setTimerStarted(false);

    // Reset timers and states
    setTimeLeft(0); // Reset the time left to 0
    setCountup(0); // Reset the countup timer
    setRunActive(false); // Stop any active run logic
    // Note: setButtonLabel is called but not defined in the state; this line may cause an error
    setButtonLabel('RUN'); // Set the RUN button label to 'RUN' (potential bug)
  };

  // Handler function: Handles clicking the "Done Creep" button to transition from 'C' to 'S' state
  const handleCrpClick = () => {
    // Check if the app is in the 'C' state
    if (currentState === 'C') {
      // Stop the main timer
      setTimerStarted(false);
      // Reset the time left to 0
      setTimeLeft(0);
      // Set the image to the first 'S' state image (S1.png)
      setImage(sImages[0]);
      // Transition to the 'S' state
      setCurrentState('S');
      // Reset the image index to 0
      setIndex(0);
    }
  };

  // Handler function: Handles clicking the "Run" or "Stop" button to toggle the 'R' (Run) state
  const handleRunClick = () => {
    // If runActive is false, start the 'Run' mode
    if (!runActive) {
      // Stop the main timer
      setTimerStarted(false);
      // Reset the time left to 0
      setTimeLeft(0);
      // Reset the countup timer to 0
      setCountup(0);
      // Set the image to the first 'R' state image (R1.png)
      setImage(rImages[0]);
      // Transition to the 'R' state
      setCurrentState('R');
      // Reset the image index to 0
      setIndex(0);
      // If rCountdown is null (first run), set it to 990
      if (rCountdown === null) setRCountdown(990);
      // Activate the run mode
      setRunActive(true);
    } else {
      // If runActive is true, stop the 'Run' mode and return to 'C' state
      setRunActive(false);
      // Set the image to the first 'C' state image (C1.png)
      setImage(cImages[0]);
      // Transition to the 'C' state
      setCurrentState('C');
      // Reset the image index to 0
      setIndex(0);

      // Reset timers
      setTimeLeft(20); // Reset time left to 20 seconds
      setCountup(0); // Reset the countup timer
      setTimerStarted(true); // Start the main timer again
    }
  };
/****************************************************************************************/
/****************************************************************************************/
/****************************************************************************************/
  // Render the UI using JSX

  return (
    // Main container for the app
	
    <div className="container">

      {/* Left-side buttons for controlling the app */}
				<div className="left-buttons">
  					    <div>
    <FPSInput value={fps} onChange={handleFPSChange} className="fps-input-position" />
  </div>
				  {/* Run/Stop button: Toggles between 'Run' and 'Stop' modes */}
				  <button
					id="CTRLBtn"
					className="side-button"
					onClick={handleRunClick}
					disabled={currentState !== 'S' && currentState !== 'R'} // Disabled unless in 'S' or 'R' state
				  >
					{runActive ? 'Stop Camera' : 'Run Camera'} {/* Button label changes based on runActive */}
				  </button>

				  {/* Done Creep button: Transitions from 'C' to 'S' state */}
				  <button
					id="CTRLBtn"
					className="side-button"
					onClick={handleCrpClick}
				  >
					Finish Creep
				  </button>

				  {/* Error button: Forces the app into the 'E' state */}
				  <button
					id="CTRLBtn"
					className="side-button"
					onClick={handleErrorClick}
				  >
					Cause Error
				  </button>
				</div>


      {/* Main display area for the image and timers */}
      <div className="box">
        {/* Display the current image */}
        <img src={image} className="box-image" alt="Display" />

        {/* Display the countdown for the 'R' state if rCountdown is not null */}
		{rCountdown !== null && (
		  <div className={`countdown-label ${getCountdownClassName()}`}>
			{rCountdown} {/* Display the current countdown value */}
		  </div>
		)}

        {/* Display the countup timer and progress bar when not showing the splash screen and in the 'C' state */}
			{renderCreepProgressBar()}
			{renderCtrlProgressBar()}
      </div>
      {/* Container for the side image (button image) */}
      <div className="side-image-container"><img src="/BtnPic.png" className="side-image" alt="Button Image" />
      </div>
		{/* Ctrl button: Handles mouse down and up events to detect press duration */}
		<button  id="CTRLBtn"  onMouseDown={handleCtrlMouseDown}  onMouseUp={handleCtrlMouseUp}>CTRL</button>
		{renderDebugStatusBox()}
    </div>

  );
}				
/* 				isInEState: {isInEState.toString()}<br />
				isLongCtrlPressed: {isLongCtrlPressed.toString()}<br />
				ctrlPressDuration: {ctrlPressDuration.toString()}<br /> */
// Export the App component as the default export
export default App;