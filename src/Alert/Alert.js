import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Alert as BAlert } from 'react-bootstrap';

import './css/alert.css'

function Alert(props) {
  const [closeTimeout, setCloseTimeout] = useState(null);
  const [transDate, setTransDate] = useState(props.transDate);
  const [counter, setCounter] = useState(props.timer);
  const interval = 50;

  useEffect(() => {
    if (transDate !== props.transDate) {
      setTransDate(props.transDate);
      setCounter(props.timer);
    }

    if (counter === 0)
      closeAlert();

    beginCloseTimeout();
  }, [counter, transDate, closeTimeout]);

  const closeAlert = () => {
    clearTimeout(closeTimeout);
    setCloseTimeout(null);
    ReactDOM.unmountComponentAtNode(document.getElementById('alert-container'));
  }

  const beginCloseTimeout = () => {
    setCloseTimeout(setTimeout(() => {
      setCounter(prevCounter => {
        if (transDate !== props.transDate) {
          return props.timer;
        }
        else {
          return prevCounter - interval;
        }
      });
    }, interval));
  }

  return (
    <>
      <div className="alert-info-container col-11 col-sm-10 col-md-6 col-lg-5">
        <BAlert variant={props.messageType} onClose={closeAlert} dismissible>
          <BAlert.Heading className="hidden">{props.title}</BAlert.Heading>
          <hr className="hidden" />
          <div dangerouslySetInnerHTML={{__html: props.message}}></div>
        </BAlert>
        <div className={`timer-container alert-${props.messageType}`}>
            <div className="timer-text-value hidden">{counter}</div>
            <div className="timer-value" style={{width: ((counter/props.timer)*100) + "%"}}></div>
            <div className="timer-background"></div>
          </div>
      </div>
    </>
  );
}

export const setAlert = (title, message, messageType="info") => {
  const validMessageTypes = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
  const transDate = Date.now().toString();
  if (!validMessageTypes.includes(messageType)) {
    throw Error("Invalid alert message type.");
  }
  ReactDOM.render(
    <Alert messageType={messageType} timer={5000} title={title} message={message} transDate={transDate} />,
    document.getElementById("alert-container")
  );
}