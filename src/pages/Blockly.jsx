import React, { useEffect, useState } from "react";
import * as Blockly from "blockly";
import { blocks } from "./blockly/text";
import { forBlock } from "./blockly/javascript";
import { javascriptGenerator } from "blockly/javascript";
import { toolbox } from "./blockly/toolbox";
import * as BlocklyCore from "blockly/core";
import { ZoomToFitControl } from "@blockly/zoom-to-fit";

export const BlocklyLayout = () => {
  const [dataBlocks, setDataBlocks] = useState();
  let codeDiv = document.getElementById("generatedCode")?.firstChild;
  let outputDiv = document.getElementById("output");
  let ws;
  let blocklyDiv;

  const createWorkspace = () => {
    codeDiv = document.getElementById("generatedCode")?.firstChild;
    outputDiv = document.getElementById("output");
    blocklyDiv = document.getElementById("blocklyDiv");
    ws = blocklyDiv && Blockly.inject(blocklyDiv, { toolbox });
    const zoomToFit = new ZoomToFitControl(ws);
    zoomToFit.init();
    BlocklyCore.serialization.workspaces.load(
      JSON.parse(
        '{"blocks":{"languageVersion":0,"blocks":[{"type":"variables_set","id":"tsPLBy6bTcm#z2j;F)7q","x":117,"y":120,"fields":{"VAR":{"id":"q6~N.G8ig$`9uP}1}.!^"}},"inputs":{"VALUE":{"block":{"type":"math_number","id":"W.9g9,RIc%qo_@kVrEfL","fields":{"NUM":0}}}},"next":{"block":{"type":"variables_set","id":"4lU?zz5!D]uOo/:meT[0","fields":{"VAR":{"id":"X.`=m.+WN_4wuwQwRX%9"}},"inputs":{"VALUE":{"block":{"type":"math_number","id":"#1pp@Pd5Ls8}QCkcEPk!","fields":{"NUM":0}}}},"next":{"block":{"type":"variables_set","id":":VLi|XX#mr/8O4sxoVV1","fields":{"VAR":{"id":"Z+f}Z)6W}!|C`H!mgRa_"}},"inputs":{"VALUE":{"block":{"type":"math_number","id":"S?u(b5rZprK+@8+aNK$K","fields":{"NUM":0}}}},"next":{"block":{"type":"variables_set","id":"VJq.eS#5R1$#$,jOkgji","fields":{"VAR":{"id":"UqeFp@EQ=y0meerz_}~b"}},"inputs":{"VALUE":{"block":{"type":"math_number","id":"vFTCBPIO,:3bF*=AVkPd","fields":{"NUM":0}}}}}}}}}}}]},"variables":[{"name":"Số nhóm","id":"q6~N.G8ig$`9uP}1}.!^"},{"name":"Số vật trong một nhóm","id":"X.`=m.+WN_4wuwQwRX%9"},{"name":"Ước lượng số vật","id":"Z+f}Z)6W}!|C`H!mgRa_"},{"name":"Đếm số lượng vật","id":"UqeFp@EQ=y0meerz_}~b"}]}'
      ),
      ws,
      undefined
    );
    ws.addChangeListener((e) => {
      if (e.isUiEvent) return;
      const data = BlocklyCore.serialization.workspaces.save(ws);
      setDataBlocks(data);
    });
    ws.addChangeListener((e) => {
      if (
        e.isUiEvent ||
        e.type == Blockly.Events.FINISHED_LOADING ||
        ws.isDragging()
      ) {
        return;
      }
      showText();
    });
  };

  useEffect(() => {
    Blockly.common.defineBlocks(blocks);
    Object.assign(javascriptGenerator.forBlock, forBlock);
  }, []);

  const showText = () => {
    const code = javascriptGenerator.workspaceToCode(ws);
    console.log("code ==========I", code);
    if (codeDiv) codeDiv.textContent = code;

    if (outputDiv) outputDiv.innerHTML = "";
  };

  function submitBlock() {
    var code = javascriptGenerator.workspaceToCode(ws);

    console.log("dataBlocks", code, dataBlocks);
  }

  function runCode() {
    var code = javascriptGenerator.workspaceToCode(ws);
    try {
      const a = eval(code);
      console.log("code", a);
    } catch (e) {
      //   alert(e);
    }
  }

  return (
    <>
      <button onClick={createWorkspace}>Create workspace</button>
      <button onClick={runCode}>Run code</button>
      <button onClick={submitBlock}>Submit block</button>

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
          id="outputPane"
          style={{
            display: "flex",
            flexDirection: "column",
            width: "400px",
            flex: "0 0 400px",
            overflow: "auto",
            margin: "1rem",
          }}
        >
          <pre id="generatedCode" style={{ height: "50%" }}>
            <code></code>
          </pre>
          <div id="output" style={{ height: "50%" }}></div>
        </div>
        <div
          id="blocklyDiv"
          style={{
            flexBasis: " 100%",
            minWidth: "600px",
          }}
        ></div>
      </div>
    </>
  );
};
