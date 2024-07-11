import React, { useState } from "react";
import styled from "./styles.module.css";

export const ContactButton = () => {
  return (
    <>
      <>
        <a
          href={process.env.REACT_APP_MESSENGER_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "#448AFF",
            zIndex: 2000,
          }}
          className={`fixed bottom-7 left-7 h-16 w-16 rounded-full flex justify-center items-center ${styled.animationPulse}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            viewBox="0 0 48 48"
          >
            <path
              fill="#448AFF"
              d="M24,4C13.5,4,5,12.1,5,22c0,5.2,2.3,9.8,6,13.1V44l7.8-4.7c1.6,0.4,3.4,0.7,5.2,0.7c10.5,0,19-8.1,19-18C43,12.1,34.5,4,24,4z"
            ></path>
            <path fill="#FFF" d="M12 28L22 17 27 22 36 17 26 28 21 23z"></path>
          </svg>
        </a>
      </>
    </>
  );
};
