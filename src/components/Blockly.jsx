import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import * as Blockly from "blockly";
import { blocks } from "./blockly/text";
import { forBlock } from "./blockly/javascript";
import { javascriptGenerator } from "blockly/javascript";
import { toolbox } from "./blockly/toolbox";
import * as BlocklyCore from "blockly/core";
import { isEmpty } from "lodash";

export const BlocklyLayout = ({ data, setDataBlocks, isEdit = true }) => {
  const codeDivRef = useRef(null);
  const outputDivRef = useRef(null);
  const blocklyDivRef = useRef(null);
  const workspaceRef = useRef(null);

  useLayoutEffect(() => {
    Blockly.common.defineBlocks(blocks);
    Object.assign(javascriptGenerator.forBlock, forBlock);

    if (blocklyDivRef.current) {
      workspaceRef.current = Blockly.inject(blocklyDivRef.current, {
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
        BlocklyCore.serialization.workspaces.load(data, workspaceRef.current, undefined);
      }

      workspaceRef.current.addChangeListener((e) => {
        if (e.isUiEvent || e.type === Blockly.Events.FINISHED_LOADING || workspaceRef.current.isDragging()) {
          return;
        }
        const workspaceData = BlocklyCore.serialization.workspaces.save(workspaceRef.current);
        const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
        setDataBlocks({ code, data: workspaceData });
        showText();
      });
    }

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (data && workspaceRef.current) {
      BlocklyCore.serialization.workspaces.load(data, workspaceRef.current, undefined);
    }
  }, [data]);

  const showText = () => {
    if (workspaceRef.current) {
      const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
      if (codeDivRef.current) codeDivRef.current.textContent = code;
      if (outputDivRef.current) outputDivRef.current.innerHTML = "";
    }
  };

  const runCode = (e) => {
    e.preventDefault();
    if (workspaceRef.current) {
      const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
      console.log("code", code);
      try {
        const a = eval(code);
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  return (
    <>
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
          ref={blocklyDivRef}
          style={{
            flexBasis: "100%",
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
              <code ref={codeDivRef}></code>
            </pre>
            <div id="output" style={{ height: "50%" }} ref={outputDivRef}></div>
          </div>
        )}
      </div>
    </>
  );
};
