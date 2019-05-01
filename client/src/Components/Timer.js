import React, { useState, useEffect } from "react";

const Timmer = props => {
  const [time, setTime] = useState(null);

  useEffect(() => {
    if (props.timezone) {
      let id = setInterval(() => {
        let timeZone = new Date(
          new Date().toLocaleString("en-US", { timeZone: props.timezone })
        );
        setTime(timeZone);
      }, 1000);
      return () => clearInterval(id);
    }
  }, [props.timezone]);//Solo se actualiza si cambia la zona horaria

  return <div>{time ? time.toLocaleString() : ""}</div>;
};
export default Timmer;
