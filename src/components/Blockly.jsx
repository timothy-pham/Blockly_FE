import React, { useEffect, useLayoutEffect, useState } from "react";
import * as Blockly from "blockly";
import { blocks } from "./blockly/text";
import { forBlock } from "./blockly/javascript";
import { javascriptGenerator } from "blockly/javascript";
import { toolbox } from "./blockly/toolbox";
import * as BlocklyCore from "blockly/core";
import { isEmpty } from "lodash";

export const BlocklyLayout = ({ data, setDataBlocks, isEdit = true }) => {
  let codeDiv;
  let outputDiv;
  let ws;
  let blocklyDiv;

  useLayoutEffect(() => {
    if (isEmpty(blocklyDiv)) {
      codeDiv = document.getElementById("generatedCode")?.firstChild;
      outputDiv = document.getElementById("output");
      blocklyDiv = document.getElementById("blocklyDiv");
      ws =
        blocklyDiv &&
        Blockly.inject(blocklyDiv, {
          toolbox: isEdit ? toolbox : null,
          zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2,
            pinch: true,
          },
          trashcan: isEdit,
        });
      if (data) {
        BlocklyCore.serialization.workspaces.load(data, ws, undefined);
      }
      ws.addChangeListener((e) => {
        if (
          e.isUiEvent ||
          e.type == Blockly.Events.FINISHED_LOADING ||
          ws.isDragging()
        ) {
          return;
        }
        const data = BlocklyCore.serialization.workspaces.save(ws);
        var code = javascriptGenerator.workspaceToCode(ws);

        setDataBlocks({ code, data });
        showText();
      });
    }
  }, []);

  useEffect(() => {
    Blockly.common.defineBlocks(blocks);
    Object.assign(javascriptGenerator.forBlock, forBlock);
  }, []);

  const showText = () => {
    const code = javascriptGenerator.workspaceToCode(ws);
    if (codeDiv) codeDiv.textContent = code;

    if (outputDiv) outputDiv.innerHTML = "";
  };

  function runCode(e) {
    e.preventDefault();
    var code = javascriptGenerator.workspaceToCode(ws);
    console.log("code", code);
    try {
      const a = eval(code);
    } catch (e) {
      console.log("erorr", e);
      //   alert(e);
    }
  }

  return (
    <>
      {/* <button onClick={runCode}>Run code</button>
      <button onClick={submitBlock}>Submit block</button> */}

      <div
        id="pageContainer"
        style={{
          display: "flex",
          width: "50%",
          maxWidth: "100vw",
          height: "50vh",
        }}
      >
        <div
          id="blocklyDiv"
          style={{
            flexBasis: " 100%",
            minWidth: "600px",
          }}
        ></div>
        {isEdit && (
          <div
            id="outputPane"
            style={{
              display: "flex",
              flexDirection: "column",
              width: "400px",
              flex: "0 0 400px",
              overflow: "auto",
              margin: "1rem",
              backgroundColor: "#f0e5b1",
            }}
          >
            <pre id="generatedCode" style={{ height: "50%" }}>
              <code></code>
            </pre>
            <div id="output" style={{ height: "50%" }}></div>
          </div>
        )}
      </div>
    </>
  );
};
