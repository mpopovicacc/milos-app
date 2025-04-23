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
import { useEffect, useState } from 'react';
// Importing the CSS file for styling the application
import './App.css';

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
  const [index, setIndex] = useState(0); // Tracks the current index of the image array for the active state
  const [timeLeft, setTimeLeft] = useState(20); // Represents the remaining time for the 'C' state timer (starts at 20 seconds)
  const [timerStarted, setTimerStarted] = useState(false); // Flag to control whether the main timer is running
  const [countup, setCountup] = useState(0); // Tracks elapsed time in seconds (countup timer)
  const [currentState, setCurrentState] = useState('C'); // Tracks the current state of the app ('C', 'S', 'E', 'R', or 'E1')
  const [timeoutReached, setTimeoutReached] = useState(false); // Indicates if the timer has reached the threshold
  const [rCountdown, setRCountdown] = useState(null); // Countdown timer for the 'R' (Run) state, starts as null
  
  const [runActive, setRunActive] = useState(false); // Flag to indicate if the 'Run' mode is active
  const [isCtrlPressed, setIsCtrlPressed] = useState(false); // Tracks if the Ctrl button is currently pressed
  const [ctrlPressDuration, setCtrlPressDuration] = useState(0); // Measures how long the Ctrl button has been pressed (in milliseconds)
  const [isInEState, setIsInEState] = useState(false); // Tracks if the app is locked in the 'E' (Error) state
  const [ctrlPressed, setCtrlPressed] = useState(false); // Flag to detect if the Ctrl button was pressed (not actively used in the code)

  // useEffect Hook 1: Transition from 'C' state to 'E1' state when rCountdown reaches 0
  // useEffect is a React hook that runs side effects (like timers or state updates) after rendering
  useEffect(() => {
    // Check if the countdown for the 'R' state has reached 0 and the current state is 'C'
    if (rCountdown === 0 && currentState === 'C') {
      // Transition to the 'E1' state (a specific error state)
      setCurrentState('E1');
    }
  }, [rCountdown, currentState]); // Dependencies: this effect runs whenever rCountdown or currentState changes

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

  // useEffect Hook 3: Handle long Ctrl press in the 'E' state to return to 'C' state
  useEffect(() => {
    // Check if the app is in the 'E' state, currentState is 'E', Ctrl is pressed, and the press duration exceeds 1 second
    if (isInEState && currentState === 'E' && isCtrlPressed && ctrlPressDuration > 1000) {
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
    }
  }, [ctrlPressDuration, currentState, isCtrlPressed, isInEState]); // Dependencies: runs when these values change

  // useEffect Hook 4: Manage the countdown timer in the 'R' (Run) state
  useEffect(() => {
    // Check if the app is in the 'R' state, runActive is true, and rCountdown is not null and greater than 0
    if (currentState === 'R' && runActive && rCountdown !== null && rCountdown > 0) {
      // Set up an interval to decrease the countdown every 180ms (approximately 24 FPS)
      const interval = setInterval(() => {
        // Update the countdown value
        setRCountdown(prev => {
          // If the countdown reaches 1 or less, reset the app to the 'C' state
          if (prev <= 1) {
            // Stop the interval
            clearInterval(interval);
            // Reset to the 'C' state with the first image (C1.png)
            setImage(cImages[0]);
            setCurrentState('C');
            setIndex(0);
            setTimeLeft(20);
            setCountup(0);
            setTimerStarted(true);
            setRunActive(false);
            // Reset the countdown to 0
            return 0;
          }
          // Decrease the countdown by 1
          return prev - 1;
        });
      }, 180); // Interval runs every 180ms (approximately 24 FPS)
      // Cleanup: clear the interval when the component unmounts or dependencies change
      return () => clearInterval(interval);
    }
  }, [currentState, runActive, rCountdown]); // Dependencies: runs when these values change

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
    }, 1000);
    // Cleanup: clear the timeout when the component unmounts
    return () => clearTimeout(splashTimer);
  }, []); // Empty dependency array: this effect runs only once when the component mounts

  // useEffect Hook 6: Manage the countdown and countup timers for the 'C' state
  useEffect(() => {
    // If the timer hasn't started or the app is in the 'E' state, exit early
    if (!timerStarted || isInEState) return;

    // Set up a countdown timer that decreases timeLeft every 150ms
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
    }, 150); // Interval runs every 150ms

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

  // Handler function: Called when the Ctrl button is pressed down
  const handleCtrlMouseDown = () => {
    // Set the Ctrl button as pressed
    setIsCtrlPressed(true);
    // Reset the press duration to 0
    setCtrlPressDuration(0);
  };

  // Handler function: Called when the Ctrl button is released
  const handleCtrlMouseUp = () => {
    // Set the Ctrl button as not pressed
    setIsCtrlPressed(false);
    // If the press duration is less than 1 second, treat it as a regular click
    if (ctrlPressDuration < 1000) {
      handleCtrlClick();
    }
  };

  // Handler function: Handles a regular Ctrl click (less than 1 second)
  const handleCtrlClick = () => {
    // Determine which image array to use based on the current state
    let images;
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

  // Render the UI using JSX
  return (
    // Main container for the app
    <div className="container">
      {/* Left-side buttons for controlling the app */}
      <div className="left-buttons">
        {/* Run/Stop button: Toggles between 'Run' and 'Stop' modes */}
        <button
          className="side-button"
          onClick={handleRunClick}
          disabled={currentState !== 'S' && currentState !== 'R'} // Disabled unless in 'S' or 'R' state
        >
          {runActive ? 'STOP' : 'RUN'} {/* Button label changes based on runActive */}
        </button>
        {/* Done Creep button: Transitions from 'C' to 'S' state */}
        <button className="side-button" onClick={handleCrpClick}>
          Done Creep
        </button>
        {/* Error button: Forces the app into the 'E' state */}
        <button className="side-button" onClick={handleErrorClick}>
          Error
        </button>
      </div>

      {/* Main display area for the image and timers */}
      <div className="box">
        {/* Display the current image */}
        <img src={image} className="box-image" alt="Display" />

        {/* Display the countdown for the 'R' state if rCountdown is not null */}
        {rCountdown !== null && (
          <div
            className={
              // Dynamically set the class name based on the current state and image
              `countdown-label ` + (
                currentState === 'C' && image === 'C1.png' ? 'c-state-countdown-1' :
                currentState === 'C' && image === 'C2.png' ? 'c-state-countdown-2' :
                currentState === 'C' && image === 'C3.png' ? 'c-state-countdown-3' :
                currentState === 'C' && image === 'C4.png' ? 'c-state-countdown-4' :
                currentState === 'S' && image === 'S1.png' ? 's-state-countdown-1' :
                currentState === 'S' && image === 'S2.png' ? 's-state-countdown-2' :
                currentState === 'S' && image === 'S3.png' ? 's-state-countdown-3' :
                currentState === 'S' && image === 'S4.png' ? 's-state-countdown-4' :
                currentState === 'E' && image === 'E1.png' ? 'e-state-countdown-1' :
                currentState === 'E' && image === 'E2.png' ? 'e-state-countdown-2' :
                currentState === 'E' && image === 'E3.png' ? 'e-state-countdown-3' :
                currentState === 'E' && image === 'E4.png' ? 'e-state-countdown-4' :
                currentState === 'R' && image === 'R1.png' ? 'r-countdown-label s1' :
                currentState === 'R' && image === 'R2.png' ? 'r-countdown-label s2' :
                currentState === 'R' && image === 'R3.png' ? 'r-countdown-label s3' :
                currentState === 'R' && image === 'R4.png' ? 'r-countdown-label s4' :
                ''
              )
            }
          >
            {rCountdown} {/* Display the current countdown value */}
          </div>
        )}

        {/* Display the countup timer and progress bar when not showing the splash screen and in the 'C' state */}
        {!showSplash && currentState === 'C' && (
          <>
            {/* Display the countup timer value (in seconds) */}
            <div className="countup-label">{countup}'</div>
            {/* Progress bar to visualize the time left */}
            <div className="progress-bar-container">
              {/* Create an array of 20 segments to represent the time left */}
              {[...Array(20)].map((_, idx) => (
                <div
                  key={idx} // Unique key for each segment (required by React for lists)
                  className="progress-bar-segment"
                  style={{
                    // Color the segment green if its index is less than timeLeft, otherwise black
                    backgroundColor: idx < timeLeft ? 'green' : 'black',
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Container for the side image (button image) */}
      <div className="side-image-container">
        <img src="/BtnPic.png" className="side-image" alt="Button Image" />
      </div>

      {/* Ctrl button: Handles mouse down and up events to detect press duration */}
      <button
        className="side-button right-button"
        onMouseDown={handleCtrlMouseDown} // Called when the button is pressed
        onMouseUp={handleCtrlMouseUp} // Called when the button is released
      >
        Ctrl
      </button>
    </div>
  );
}

// Export the App component as the default export
export default App;